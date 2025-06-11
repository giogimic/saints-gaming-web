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
        title: "Our Games",
        subtitle: "Modded multiplayer experiences for every player",
        games: [
          {
            id: "1",
            title: "ARK: Survival Ascended",
            description: "Join our Omega modded server for an enhanced PvE experience with quality-of-life improvements and expanded content.",
            imageUrl: "/imgs/ark.jpg",
            status: "active",
            features: [
              "Omega Mod Collection",
              "Enhanced PvE Experience",
              "Quality of Life Mods",
              "Active Community"
            ]
          },
          {
            id: "2",
            title: "Minecraft",
            description: "Experience our custom modpacks featuring Cobblemon, enhanced combat, and immersive portals in a multiplayer environment.",
            imageUrl: "/imgs/minecraft.jpg",
            status: "active",
            features: [
              "Custom Modpacks",
              "Cobblemon Integration",
              "Enhanced Combat",
              "Multiplayer Focus"
            ],
            modpack: {
              name: "SaintsGaming Modpack",
              url: "/modpacks"
            }
          },
          {
            id: "3",
            title: "Stardew Valley",
            description: "Transform your farm with our Holy Crop! modpack, featuring automation, cosmetics, and new features for an enhanced farming experience.",
            imageUrl: "/imgs/holycrop.png",
            status: "active",
            features: [
              "Automation Systems",
              "Visual Enhancements",
              "New Features",
              "Co-op Support"
            ],
            modpack: {
              name: "Holy Crop!",
              url: "/modpacks"
            }
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
          template: "default"
        },
      });

      return NextResponse.json(newPage);
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error fetching games page:", error);
    return NextResponse.json(
      { error: "Failed to fetch games page" },
      { status: 500 }
    );
  }
} 