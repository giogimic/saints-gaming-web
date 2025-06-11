import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const page = await prisma.page.findFirst({
      where: {
        slug: "games",
      },
    });

    if (!page) {
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

      const defaultContent = {
        title: "Our Games",
        subtitle: "Explore our gaming servers",
        games: [
          {
            id: "ark",
            name: "ARK: Survival Ascended",
            description: "Experience the ultimate ARK survival adventure",
            image: "/images/ark-server.jpg",
            status: "online",
            players: 0,
            maxPlayers: 70,
            version: "v1.0",
            ip: "play.saintsgaming.com",
            features: ["Modded", "PVE", "Active Admins"],
            joinButton: "Join ARK Server"
          },
          {
            id: "minecraft",
            name: "Minecraft",
            description: "Join our vibrant Minecraft community",
            image: "/images/minecraft-server.jpg",
            status: "online",
            players: 0,
            maxPlayers: 100,
            version: "1.20.4",
            ip: "mc.saintsgaming.com",
            features: ["Modded", "PVE", "Active Admins"],
            joinButton: "Join Minecraft Server"
          }
        ]
      };

      const newPage = await prisma.page.create({
        data: {
          slug: "games",
          title: "Our Games",
          content: JSON.stringify(defaultContent),
          createdById: systemUser.id,
          isPublished: true,
          description: "Games page content",
          template: "games"
        },
      });

      return NextResponse.json(newPage);
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error fetching games page:", error);
    return NextResponse.json(
      { error: "Failed to fetch games page", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 