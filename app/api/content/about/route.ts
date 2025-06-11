import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const page = await prisma.page.findUnique({
      where: { slug: 'about' },
      select: {
        id: true,
        content: true,
      },
    });

    if (!page) {
      // Create the about page if it doesn't exist
      const newPage = await prisma.page.create({
        data: {
          slug: 'about',
          title: 'About SaintsGaming',
          content: JSON.stringify({
            title: "About SaintsGaming",
            subtitle: "Your Premier Destination for Modded Multiplayer Gaming",
            sections: [
              {
                id: "1",
                title: "Our Mission",
                content: "At SaintsGaming, we're dedicated to crafting exceptional modded multiplayer experiences that go beyond the ordinary. Our focus is on creating immersive, stable, and engaging environments where players can enjoy their favorite games with carefully curated mods that enhance gameplay without compromising performance.",
                features: [
                  "Curated Mod Collections",
                  "Performance-Optimized Servers",
                  "Active Community Management",
                  "Regular Content Updates"
                ]
              },
              {
                id: "2",
                title: "Our Servers",
                content: "Experience gaming at its finest with our premium modded servers. Our ARK: Survival Ascended server features the Omega mod collection, offering an enhanced survival experience with new creatures, items, and mechanics. Our Minecraft server runs the custom SaintsGaming modpack, boasting over 400 carefully selected mods that transform the game into an epic adventure with Cobblemon integration.",
                features: [
                  "ARK: Survival Ascended — Omega Modded Experience",
                  "Minecraft — 400+ Mods with Cobblemon",
                  "High-Performance Hardware",
                  "Automated Backups",
                  "24/7 Active Moderation"
                ]
              },
              {
                id: "3",
                title: "Our Modpacks",
                content: "Discover our carefully crafted modpacks, each designed for a unique gaming experience. The SaintsGaming Modpack transforms Minecraft into an epic adventure with new dimensions, creatures, and mechanics. Dimensional Cobblemon brings the Pokémon experience to Minecraft with custom regions and features. Holy Crop! revolutionizes Stardew Valley with new crops, mechanics, and automation options.",
                features: [
                  "SaintsGaming Modpack — Epic Minecraft Adventure",
                  "Dimensional Cobblemon — Pokémon in Minecraft",
                  "Holy Crop! — Stardew Valley Enhanced",
                  "Monthly Content Updates",
                  "CurseForge Integration"
                ]
              },
              {
                id: "4",
                title: "Join Our Community",
                content: "Become part of our thriving gaming community! Our Discord server is the heart of SaintsGaming, where players connect, share experiences, and get instant support. Join us for regular community events, modpack assistance, and stay updated on server maintenance and new features. Your feedback shapes our future updates and improvements.",
                features: [
                  "Active Discord Community",
                  "Weekly Community Events",
                  "Expert Modpack Support",
                  "Real-time Server Updates",
                  "Community-Driven Development"
                ]
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
    console.error("Error fetching about page:", error);
    return NextResponse.json({ error: "Failed to fetch about page" }, { status: 500 });
  }
} 