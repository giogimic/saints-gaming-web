import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { UserRole, Permission } from "@/lib/permissions"
import { hasPermission } from "@/lib/permissions"
import { pageContentSchema } from "@/lib/validations/content"

// Define content structure schemas
const contentFieldSchema = z.object({
  content: z.string(),
});

const pageSchema = z.object({
  slug: z.string(),
  title: z.string(),
  content: z.string(),
});

const ContentSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  content: z.any(), // Allow any content type
});

// Helper function to check admin access
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: "Unauthorized", status: 401 };
  }

  const hasEditPermission = hasPermission(session.user.role as UserRole, "edit:page");
  if (!hasEditPermission) {
    return { error: "Forbidden", status: 403 };
  }

  return { session };
}

// Helper function to create default content
function createDefaultContent(slug: string) {
  const defaultContent = {
    title: { content: slug.charAt(0).toUpperCase() + slug.slice(1) },
    description: { content: `Welcome to our ${slug} page` },
  };

  // Add specific defaults based on page type
  if (slug === "about") {
    return {
      ...defaultContent,
      mission: { content: "Our mission is to create an inclusive gaming community" },
      values: { content: "We value respect, inclusivity, and fair play" },
    };
  }

  if (slug === "games") {
    return {
      ...defaultContent,
      games: {
        content: [
          {
            title: "Game 1",
            description: "Description for Game 1",
          },
          {
            title: "Game 2",
            description: "Description for Game 2",
          },
        ],
      },
    };
  }

  return defaultContent;
}

// Helper function to validate and parse content
function validateAndParseContent(content: string, slug: string) {
  try {
    const parsed = JSON.parse(content);
    const validated = pageContentSchema.parse(parsed);
    return { data: validated };
  } catch (e) {
    console.error("Error parsing/validating content:", e);
    if (e instanceof z.ZodError) {
      return { error: "Validation error", details: e.errors };
    }
    return { error: "Invalid content format" };
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { error: "Slug parameter is required" },
        { 
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Get the page and its latest content revision
    const page = await prisma.page.findUnique({
      where: { slug },
      include: {
        contentRevisions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!page) {
      // Return default content for new pages
      return NextResponse.json({
        content: {
          title: "Welcome",
          subtitle: "Get started by editing this page",
          content: "Add your content here",
        },
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const latestRevision = page.contentRevisions[0];
    if (!latestRevision) {
      return NextResponse.json(
        { error: "No content found" },
        { 
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Parse the content JSON
    let content;
    try {
      // If the content is already an object, use it directly
      if (typeof latestRevision.content === 'object') {
        content = latestRevision.content;
      } else {
        // Otherwise, try to parse it as JSON
        content = JSON.parse(latestRevision.content as string);
      }
    } catch (e) {
      console.error("Error parsing content:", e);
      return NextResponse.json(
        { error: "Invalid content format" },
        { 
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return NextResponse.json({ content }, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in GET /api/admin/content/pages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { 
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { 
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const body = await request.json();
    const { slug, content } = body;

    if (!slug || !content) {
      return NextResponse.json(
        { error: "Slug and content are required" },
        { 
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate content structure
    let parsedContent;
    try {
      parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
      ContentSchema.parse(parsedContent);
    } catch (e) {
      console.error("Content validation error:", e);
      return NextResponse.json(
        { error: "Invalid content format" },
        { 
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Get or create the page
    let page = await prisma.page.findUnique({
      where: { slug },
    });

    if (!page) {
      page = await prisma.page.create({
        data: {
          slug,
          title: "New Page",
          content: "{}",
          description: "",
          createdById: session.user.id,
        },
      });
    }

    // Create a new content revision
    const contentRevision = await prisma.contentRevision.create({
      data: {
        content: parsedContent,
        pageId: page.id,
        createdById: session.user.id,
      },
    });

    return NextResponse.json({
      content: parsedContent,
      revision: contentRevision,
    }, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in POST /api/admin/content/pages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { 
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { slug, updates } = body;

    if (!slug || !updates) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const page = await prisma.page.findUnique({
      where: { slug },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Merge existing content with updates
    const existingContent = JSON.parse(page.content);
    const updatedContent = { ...existingContent, ...updates };

    const validation = validateAndParseContent(
      JSON.stringify(updatedContent),
      slug
    );
    if ("error" in validation) {
      return NextResponse.json(
        { error: validation.error, details: validation.details },
        { status: 400 }
      );
    }

    const updatedPage = await prisma.page.update({
      where: { slug },
      data: {
        content: JSON.stringify(updatedContent),
      },
    });

    // Create revision
    await prisma.contentRevision.create({
      data: {
        pageId: page.id,
        content: updatedContent,
        createdById: auth.session.user.id,
      },
    });

    return NextResponse.json({ content: updatedPage.content });
  } catch (error) {
    console.error("Error updating page:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url)
    const pageSlug = searchParams.get("slug")

    if (!pageSlug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      )
    }

    await prisma.page.delete({
      where: { slug: pageSlug },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/admin/content/pages:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 