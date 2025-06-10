import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const DEFAULT_HOME_CONTENT = {
  heroTitle: 'Welcome to Saints Gaming',
  heroSubtitle: 'Your ultimate gaming community',
  joinServers: 'Join Our Servers',
  joinCommunity: 'Join Community',
  welcomeMessage: 'Welcome to Saints Gaming!',
  ourServers: 'Our Servers',
  arkTitle: 'ARK: Survival Ascended',
  arkDesc: 'Join our ARK: Survival Ascended server for an epic survival experience!',
  arkStatus: 'Online',
  arkPlayers: '24/50',
  arkVersion: 'v1.0',
  arkIP: 'ark.saintsgaming.com',
  arkJoin: 'Join Server',
  mcTitle: 'Minecraft',
  mcDesc: 'Explore our Minecraft server with custom modpacks and unique features!',
  mcStatus: 'Online',
  mcPlayers: '15/30',
  mcVersion: '1.20.1',
  mcIP: 'mc.saintsgaming.com',
  mcJoin: 'Join Server',
  whyChoose: 'Why Choose Saints Gaming?',
  feature1Title: 'Active Community',
  feature1Desc: 'Join our vibrant community of gamers and make new friends!',
  feature2Title: 'Regular Events',
  feature2Desc: 'Participate in weekly events and win amazing prizes!',
  feature3Title: '24/7 Support',
  feature3Desc: 'Our staff is always here to help you with any issues!',
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    let page = await prisma.page.findUnique({ where: { slug } });
    
    if (!page) {
      // Get or create a system user for default pages
      const systemUser = await prisma.user.upsert({
        where: { email: 'system@saintsgaming.com' },
        update: {},
        create: {
          email: 'system@saintsgaming.com',
          name: 'System',
          role: 'admin',
        },
      });

      // Create a default page if it doesn't exist
      const defaultContent = slug === 'home' ? DEFAULT_HOME_CONTENT : {};
      page = await prisma.page.create({
        data: {
          slug,
          title: slug.charAt(0).toUpperCase() + slug.slice(1),
          content: JSON.stringify(defaultContent),
          isPublished: true,
          createdById: systemUser.id,
        },
      });
    }

    return NextResponse.json(page);
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

    const page = await prisma.page.create({
      data: {
        slug,
        title,
        content: typeof content === 'string' ? content : JSON.stringify(content),
        isPublished: true,
        createdById: session.user.id,
      },
    });

    return NextResponse.json(page);
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

    const updatedPage = await prisma.page.update({
      where: { id },
      data: {
        content: typeof content === 'string' ? content : JSON.stringify(content),
        updatedAt: new Date(),
      },
    });

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

    await prisma.page.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[PAGES_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 