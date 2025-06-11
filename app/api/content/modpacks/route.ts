import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const page = await prisma.page.findFirst({
      where: {
        slug: "modpacks",
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
        title: "Our Modpacks",
        subtitle: "Curated modpacks for the best gaming experience",
        modpacks: [
          {
            id: "1",
            title: "SaintsGaming Modpack",
            description: "Our flagship modpack featuring 400+ mods, including Cobblemon integration, enhanced world generation, and quality-of-life improvements.",
            type: "Minecraft",
            imageUrl: "/imgs/saintsgamingmc.jpg",
            features: [
              "400+ Mods",
              "Cobblemon Integration",
              "Enhanced World Gen",
              "QoL Improvements"
            ],
            tags: ["Minecraft", "Cobblemon", "Adventure"],
            curseForgeUrl: "https://www.curseforge.com/minecraft/modpacks/saintsgaming"
          },
          {
            id: "2",
            title: "Dimensional Cobblemon",
            description: "A unique Pokémon-style adventure with dimensional exploration and custom Pokémon mechanics.",
            type: "Minecraft",
            imageUrl: "/imgs/dimensionalcobblemon.jpg",
            features: [
              "Custom Dimensions",
              "Pokémon Mechanics",
              "Adventure Focus",
              "Custom Biomes"
            ],
            tags: ["Minecraft", "Cobblemon", "Adventure"],
            curseForgeUrl: "https://www.curseforge.com/minecraft/modpacks/dimensional-cobblemon"
          },
          {
            id: "3",
            title: "Holy Crop!",
            description: "A comprehensive Stardew Valley modpack focusing on farming automation and visual enhancements.",
            type: "Stardew Valley",
            imageUrl: "/imgs/holycrop.png",
            features: [
              "Farming Automation",
              "Visual Enhancements",
              "New Crops",
              "Quality of Life"
            ],
            tags: ["Stardew Valley", "Farming", "Automation"],
            curseForgeUrl: "https://www.curseforge.com/stardewvalley/modpacks/holy-crop"
          }
        ]
      };

      const newPage = await prisma.page.create({
        data: {
          slug: "modpacks",
          title: "Our Modpacks",
          content: JSON.stringify(defaultContent),
          createdById: systemUser.id,
          isPublished: true,
          description: "Modpacks page content",
          template: "default"
        },
      });

      return NextResponse.json(newPage);
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error fetching modpacks page:", error);
    return NextResponse.json(
      { error: "Failed to fetch modpacks page" },
      { status: 500 }
    );
  }
} 