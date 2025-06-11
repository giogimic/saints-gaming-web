import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const page = await prisma.page.findUnique({
      where: { slug: 'home' },
      select: {
        id: true,
        content: true,
      },
    });

    if (!page) {
      // Create the home page if it doesn't exist
      const newPage = await prisma.page.create({
        data: {
          slug: 'home',
          title: 'SaintsGaming: Mod-First Multiplayer Servers',
          content: JSON.stringify({
            title: "SaintsGaming: Mod-First Multiplayer Servers",
            subtitle: "Powered by overhaul mods, curated packs, and a zero-fluff community focus",
            headerImage: "/imgs/banner.png",
            buttons: [
              {
                text: "View Servers",
                href: "/servers"
              },
              {
                text: "View Modpacks",
                href: "/modpacks"
              }
            ]
          }),
          createdById: session?.user?.id || 'system',
          isPublished: true,
        },
      });
      return NextResponse.json(newPage);
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error fetching home page:", error);
    return NextResponse.json({ error: "Failed to fetch home page" }, { status: 500 });
  }
} 