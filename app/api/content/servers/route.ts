import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const page = await prisma.page.findFirst({
      where: {
        slug: "servers",
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
        systemUser = await prisma.user.create({
          data: {
            email: "system@saintsgaming.com",
            name: "System",
            role: "admin",
          },
        });
      }

      // Create default content if page doesn't exist
      const defaultContent = {
        title: "Our Servers",
        subtitle: "Join our modded multiplayer experiences",
        servers: [
          {
            id: "1",
            title: "ARK: Survival Ascended — Omega Modded Server",
            description: "PvE server running Ark Omega (Hexen) and 20+ structural/content/QOL mods",
            maxPlayers: 70,
            mods: [
              "Death Inventory Keeper",
              "Dino Storage",
              "Auto Doors",
              "Creature Finder"
            ],
            imageUrl: "/imgs/ark.jpg",
            status: "online",
            connectionInfo: "Search for 'Saints' in the in-game server browser to join. Direct connection is not available for modded servers."
          },
          {
            id: "2",
            title: "Minecraft — SaintsGaming Modpack",
            description: "MC Version: 1.21.1, NeoForge, 400+ mods including Cobblemon, Better Combat, Immersive Portals, and Parkour",
            maxPlayers: 100,
            mods: [
              "Cobblemon",
              "Better Combat",
              "Immersive Portals",
              "Parkour"
            ],
            imageUrl: "/imgs/minecraft.jpg",
            status: "online",
            connectionInfo: "Join through the server button in the main menu after installing the modpack from CurseForge."
          }
        ]
      };

      const newPage = await prisma.page.create({
        data: {
          slug: "servers",
          title: "Our Servers",
          content: JSON.stringify(defaultContent),
          createdById: systemUser.id,
          isPublished: true,
          description: "Servers page content",
          template: "default"
        },
      });

      return NextResponse.json(newPage);
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error fetching servers page:", error);
    return NextResponse.json(
      { error: "Failed to fetch servers page" },
      { status: 500 }
    );
  }
} 