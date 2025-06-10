import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create default admin user if it doesn't exist
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: UserRole.admin,
      password: 'admin123', // This should be hashed in production
    },
  })

  // Create default pages
  const defaultPages = [
    {
      title: 'Home',
      slug: 'home',
      description: 'Welcome to Saints Gaming',
      isPublished: true,
      template: 'home',
    },
    {
      title: 'Events',
      slug: 'events',
      description: 'Upcoming gaming events and tournaments',
      isPublished: true,
      template: 'events',
    },
    {
      title: 'Servers',
      slug: 'servers',
      description: 'Our gaming servers and communities',
      isPublished: true,
      template: 'servers',
    },
    {
      title: 'About',
      slug: 'about',
      description: 'About Saints Gaming',
      isPublished: true,
      template: 'about',
    },
  ]

  for (const page of defaultPages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: page,
      create: {
        ...page,
        createdById: adminUser.id,
      },
    })
  }

  // Create default site settings
  await prisma.siteSettings.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      settings: {
        siteName: 'Saints Gaming',
        siteDescription: 'A gaming community for everyone',
        logo: '/logo.png',
        theme: {
          primary: '#4F46E5',
          secondary: '#10B981',
          accent: '#F59E0B',
        },
        social: {
          discord: 'https://discord.gg/saintsgaming',
          twitter: 'https://twitter.com/saintsgaming',
          youtube: 'https://youtube.com/saintsgaming',
        },
        servers: {
          minecraft: 'play.saintsgaming.com',
          teamspeak: 'ts.saintsgaming.com',
        },
        features: {
          forum: true,
          events: true,
          servers: true,
          news: true,
        },
        maintenance: false,
      },
    },
  })

  console.log('Database seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 