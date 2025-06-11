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
            aboutTitle: "Our Story",
            aboutContent: "SaintsGaming was founded with a simple mission: to create the best gaming community possible. We believe in providing high-quality servers, regular events, and a friendly environment for all players.",
            missionTitle: "Our Mission",
            missionContent: "To provide an exceptional gaming experience through high-performance servers, active community engagement, and continuous improvement.",
            valuesTitle: "Our Values",
            valuesContent: "Community, Quality, Innovation, and Fun are at the core of everything we do."
          }),
          createdById: systemUser.id,
          isPublished: true,
          description: "About SaintsGaming page content",
          template: "about"
        },
      });

      return NextResponse.json(newPage);
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error fetching about page:", error);
    return NextResponse.json(
      { error: "Failed to fetch about page", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 