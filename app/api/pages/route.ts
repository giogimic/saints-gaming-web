import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const page = await db.query.pages.findFirst({
        where: eq(pages.slug, slug),
      });

      if (!page) {
        // Create default page if it doesn't exist
        const defaultPage = {
          slug,
          title: slug.charAt(0).toUpperCase() + slug.slice(1),
          content: JSON.stringify({
            heroTitle: "Welcome to Saints Gaming",
            heroSubtitle: "Your ultimate gaming community",
            welcomeMessage: "Welcome to Saints Gaming!",
            ourServers: "Our Servers",
            arkTitle: "ARK: Survival Ascended",
            arkDesc: "Join our ARK: Survival Ascended server for an epic survival experience!",
            arkStatus: "Online",
            arkPlayers: "24/50",
            arkVersion: "v1.0",
            arkIP: "ark.saintsgaming.com",
            arkJoin: "Join Server",
            mcTitle: "Minecraft",
            mcDesc: "Explore our Minecraft server with custom modpacks and unique features!",
            mcStatus: "Online",
            mcPlayers: "15/30",
            mcVersion: "1.20.1",
            mcIP: "mc.saintsgaming.com",
            mcJoin: "Join Server",
            whyChoose: "Why Choose Saints Gaming?",
            feature1Title: "Active Community",
            feature1Desc: "Join our vibrant community of gamers and make new friends!",
            feature2Title: "Regular Events",
            feature2Desc: "Participate in weekly events and win amazing prizes!",
            feature3Title: "24/7 Support",
            feature3Desc: "Our staff is always here to help you with any issues!"
          })
        };

        const [newPage] = await db.insert(pages).values(defaultPage).returning();
        return NextResponse.json(newPage);
      }

      return NextResponse.json(page);
    }

    const allPages = await db.query.pages.findMany();
    return NextResponse.json(allPages);
  } catch (error) {
    console.error("[PAGES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["admin", "moderator"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { slug, title, content } = body;

    if (!slug || !title || !content) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const page = await db.insert(pages).values({
      slug,
      title,
      content,
    }).returning();

    return NextResponse.json(page[0]);
  } catch (error) {
    console.error("[PAGES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["admin", "moderator"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { id, content } = body;

    if (!id || !content) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const [updatedPage] = await db.update(pages)
      .set({
        content: typeof content === 'string' ? content : JSON.stringify(content),
        updatedAt: new Date(),
      })
      .where(eq(pages.id, id))
      .returning();

    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error("[PAGES_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["admin", "moderator"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Missing page ID", { status: 400 });
    }

    await db.delete(pages).where(eq(pages.id, id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[PAGES_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 