import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"
import prisma from "@/lib/prisma"
import { UserRole } from "@/lib/permissions"

// GET: Fetch site settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (session.user.role !== UserRole.ADMIN) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    let settings = await prisma.siteSettings.findFirst()

    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.siteSettings.create({
        data: {
          id: "1",
          settings: {
            siteName: "Saints Gaming",
            siteDescription: "A gaming community for Saints",
            logo: "/images/logo.png",
            theme: {
              primary: "#4F46E5",
              secondary: "#10B981",
              accent: "#F59E0B"
            },
            social: {
              discord: "https://discord.gg/saintsgaming",
              steam: "https://steamcommunity.com/groups/saintsgaming",
              twitter: "https://twitter.com/saintsgaming"
            },
            servers: {
              ark: {
                name: "ARK: Survival Ascended",
                ip: "ark.saintsgaming.com",
                port: "7777",
                status: "online"
              },
              minecraft: {
                name: "Minecraft",
                ip: "mc.saintsgaming.com",
                port: "25565",
                status: "online"
              }
            },
            features: {
              forum: true,
              news: true,
              events: true,
              servers: true,
              store: false
            },
            maintenance: false,
            maintenanceMessage: "Site is under maintenance. Please check back later."
          }
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("[SETTINGS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// PUT: Update site settings
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()

    const settings = await prisma.siteSettings.upsert({
      where: { id: "1" },
      update: {
        settings: body,
      },
      create: {
        id: "1",
        settings: body,
      },
    })

    return NextResponse.json(settings.settings)
  } catch (error) {
    console.error("[SETTINGS_PUT]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (session.user.role !== UserRole.ADMIN) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const body = await req.json()
    const { settings } = body

    if (!settings) {
      return new NextResponse("Settings are required", { status: 400 })
    }

    const updatedSettings = await prisma.siteSettings.upsert({
      where: { id: "1" },
      update: { settings },
      create: {
        id: "1",
        settings
      }
    })

    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error("[SETTINGS_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 