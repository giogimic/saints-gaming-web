import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Get or create system user
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
          createdById: systemUser.id,
          isPublished: true,
          description: "Home page content",
          template: "default"
        },
      });
      return NextResponse.json(newPage);
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error fetching home page:", error);
    return NextResponse.json(
      { error: "Failed to fetch home page", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 