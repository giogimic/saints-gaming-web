import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

const DEFAULT_HOME_CONTENT = {
  heroTitle: { content: 'Welcome to Saints Gaming' },
  heroSubtitle: { content: 'Your ultimate gaming community' },
  joinServers: { content: 'Join Our Servers' },
  joinCommunity: { content: 'Join Community' },
  welcomeMessage: { content: 'Welcome to Saints Gaming!' },
  ourServers: { content: 'Our Servers' },
  arkTitle: { content: 'ARK: Survival Ascended' },
  arkDesc: { content: 'Join our ARK: Survival Ascended server for an epic survival experience!' },
  arkStatus: { content: 'Online' },
  arkPlayers: { content: '24/50' },
  arkVersion: { content: 'v1.0' },
  arkIP: { content: 'ark.saintsgaming.com' },
  arkJoin: { content: 'Join Server' },
  mcTitle: { content: 'Minecraft' },
  mcDesc: { content: 'Explore our Minecraft server with custom modpacks and unique features!' },
  mcStatus: { content: 'Online' },
  mcPlayers: { content: '15/30' },
  mcVersion: { content: '1.20.1' },
  mcIP: { content: 'mc.saintsgaming.com' },
  mcJoin: { content: 'Join Server' },
  whyChoose: { content: 'Why Choose Saints Gaming?' },
  feature1Title: { content: 'Active Community' },
  feature1Desc: { content: 'Join our vibrant community of gamers and make new friends!' },
  feature2Title: { content: 'Regular Events' },
  feature2Desc: { content: 'Participate in weekly events and win amazing prizes!' },
  feature3Title: { content: '24/7 Support' },
  feature3Desc: { content: 'Our staff is always here to help you with any issues!' },
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    let page = await prisma.page.findUnique({ where: { slug } });
    console.log('Found page:', page);
    
    if (!page) {
      // Get or create a system user for default pages
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

      // Create a default page if it doesn't exist
      const defaultContent = {
        heroTitle: { id: 'heroTitle', type: 'text', content: "Welcome to Saints Gaming" },
        heroSubtitle: { id: 'heroSubtitle', type: 'text', content: "Your Ultimate Gaming Community" },
        heroButton: { id: 'heroButton', type: 'text', content: "Join Now" },
        arkTitle: { id: 'arkTitle', type: 'text', content: "ARK Server" },
        arkDesc: { id: 'arkDesc', type: 'text', content: "Experience the ultimate ARK survival adventure" },
        arkStatus: { id: 'arkStatus', type: 'text', content: "Online" },
        arkPlayers: { id: 'arkPlayers', type: 'text', content: "0/70" },
        arkVersion: { id: 'arkVersion', type: 'text', content: "v1.0" },
        arkIP: { id: 'arkIP', type: 'text', content: "play.saintsgaming.com" },
        arkJoin: { id: 'arkJoin', type: 'text', content: "Join ARK Server" },
        mcTitle: { id: 'mcTitle', type: 'text', content: "Minecraft Server" },
        mcDesc: { id: 'mcDesc', type: 'text', content: "Join our vibrant Minecraft community" },
        mcStatus: { id: 'mcStatus', type: 'text', content: "Online" },
        mcPlayers: { id: 'mcPlayers', type: 'text', content: "0/100" },
        mcVersion: { id: 'mcVersion', type: 'text', content: "1.20.4" },
        mcIP: { id: 'mcIP', type: 'text', content: "mc.saintsgaming.com" },
        mcJoin: { id: 'mcJoin', type: 'text', content: "Join Minecraft Server" },
        featuresTitle: { id: 'featuresTitle', type: 'text', content: "Why Choose Us" },
        featuresDesc: { id: 'featuresDesc', type: 'text', content: "Experience gaming like never before" },
        feature1: { id: 'feature1', type: 'text', content: "High-performance servers with minimal lag" },
        feature2: { id: 'feature2', type: 'text', content: "Active and friendly community" },
        feature3: { id: 'feature3', type: 'text', content: "24/7 support and regular updates" },
        ctaTitle: { id: 'ctaTitle', type: 'text', content: "Ready to Join?" },
        ctaDesc: { id: 'ctaDesc', type: 'text', content: "Start your adventure today" },
        ctaButton: { id: 'ctaButton', type: 'text', content: "Get Started" }
      };

      page = await prisma.page.create({
        data: {
          slug,
          title: slug.charAt(0).toUpperCase() + slug.slice(1),
          content: JSON.stringify(defaultContent),
          isPublished: true,
          createdById: systemUser.id,
          description: `${slug} page content`,
          template: "default"
        },
      });
      console.log('Created page:', page);
    }

    // Parse content if it's a string
    let content = page.content;
    if (typeof content === 'string') {
      try {
        content = JSON.parse(content);
      } catch (error) {
        console.error('Error parsing content:', error);
        content = {};
      }
    }

    return NextResponse.json({ ...page, content });
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
        description: `${slug} page content`,
        template: "default"
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

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const body = await request.json();
    const { content } = body;

    if (!content || !slug) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const updatedPage = await prisma.page.update({
      where: { slug },
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