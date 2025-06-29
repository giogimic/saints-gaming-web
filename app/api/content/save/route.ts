import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pageId, content } = await request.json();

    if (!pageId || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if page exists
    const existingPage = await prisma.page.findFirst({
      where: {
        slug: pageId,
      },
    });

    if (existingPage) {
      // Update existing page
      const updatedPage = await prisma.page.update({
        where: {
          id: existingPage.id,
        },
        data: {
          content: typeof content === 'string' ? content : JSON.stringify(content),
          updatedAt: new Date(),
        },
      });

      return NextResponse.json(updatedPage);
    }

    // Get or create a system user for content creation
    let systemUser = await prisma.user.findFirst({
      where: {
        email: "system@saintsgaming.com",
      },
    });

    if (!systemUser) {
      try {
        systemUser = await prisma.user.create({
          data: {
            email: "system@saintsgaming.com",
            name: "System",
            role: "admin",
          },
        });
      } catch (error) {
        // If creation fails, try to find the user again (in case of race condition)
        systemUser = await prisma.user.findFirst({
          where: {
            email: "system@saintsgaming.com",
          },
        });
        
        if (!systemUser) {
          throw new Error("Failed to create or find system user");
        }
      }
    }

    // Create new page
    const newPage = await prisma.page.create({
      data: {
        slug: pageId,
        title: pageId.charAt(0).toUpperCase() + pageId.slice(1),
        content: typeof content === 'string' ? content : JSON.stringify(content),
        createdById: systemUser.id,
        isPublished: true,
        description: `${pageId} page content`,
        template: "default"
      },
    });

    return NextResponse.json(newPage);
  } catch (error) {
    console.error("Error saving content:", error);
    return NextResponse.json(
      { error: "Failed to save content", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 