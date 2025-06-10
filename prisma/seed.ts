import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create default site settings
  await prisma.siteSettings.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
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

  // Create default admin user if none exists
  const adminExists = await prisma.user.findFirst({
    where: { role: UserRole.admin }
  })

  if (!adminExists) {
    await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@saintsgaming.com",
        role: UserRole.admin,
        settings: {
          create: {
            theme: "dark",
            notifications: true,
            language: "en",
            timezone: "UTC",
            emailNotifications: true,
            darkMode: true,
            showOnlineStatus: true
          }
        }
      }
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 