import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create categories
  const categories = [
    {
      name: 'General Discussion',
      description: 'General discussion about gaming and community topics',
      slug: 'general',
      order: 1,
      isDefault: true,
    },
    {
      name: 'ARK: Survival Ascended',
      description: 'Discussion about ARK: Survival Ascended',
      slug: 'ark',
      order: 2,
    },
    {
      name: 'Minecraft',
      description: 'Discussion about Minecraft',
      slug: 'minecraft',
      order: 3,
    },
    {
      name: 'Server Support',
      description: 'Get help with server issues',
      slug: 'support',
      order: 4,
    },
    {
      name: 'Community Events',
      description: 'Information about community events and tournaments',
      slug: 'events',
      order: 5,
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  // Create a default user (admin) if not exists
  const admin = await prisma.user.upsert({
    where: { email: 'admin@saintsgaming.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@saintsgaming.com',
      role: 'admin',
      password: 'admin', // In production, use hashed passwords!
    },
  });

  // Create default pages
  const defaultPages = [
    {
      title: 'Home',
      slug: 'home',
      description: 'Welcome to Saints Gaming',
      isPublished: true,
      template: 'home',
      createdById: admin.id,
      content: 'Welcome to the home page!'
    },
    {
      title: 'About',
      slug: 'about',
      description: 'About Saints Gaming',
      isPublished: true,
      template: 'about',
      createdById: admin.id,
      content: 'About us content goes here.'
    },
    {
      title: 'Contact',
      slug: 'contact',
      description: 'Contact Saints Gaming',
      isPublished: true,
      template: 'contact',
      createdById: admin.id,
      content: 'Contact information goes here.'
    },
    {
      title: 'Servers',
      slug: 'servers',
      description: 'Our Game Servers',
      isPublished: true,
      template: 'servers',
      createdById: admin.id,
      content: 'Server information and details.'
    },
  ];

  for (const page of defaultPages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    });
  }

  // Create initial servers
  const servers = [
    {
      id: 'ark-ascended',
      name: 'ARK: Survival Ascended',
      description: 'Join our ARK: Survival Ascended server for an epic survival experience!',
      image: '/saintsgaming-logo.png',
      status: 'online',
      players: 24,
      maxPlayers: 50,
      version: 'v1.0',
      ip: 'ark.saintsgaming.com',
      type: 'ark',
      features: JSON.stringify([
        '2x XP and Harvesting',
        'Custom Dino Spawns',
        'Active Admin Team',
        'Regular Events',
        'Discord Integration',
      ]),
      rules: JSON.stringify([
        'No cheating or exploiting',
        'Be respectful to other players',
        'No griefing or harassment',
        'Follow server guidelines',
      ]),
      modpack: undefined,
      order: 1,
    },
    {
      id: 'minecraft',
      name: 'Minecraft',
      description: 'Explore our Minecraft server with custom modpacks and unique features!',
      image: '/saintsgaming-icon.png',
      status: 'online',
      players: 15,
      maxPlayers: 30,
      version: '1.20.1',
      ip: 'mc.saintsgaming.com',
      type: 'minecraft',
      features: JSON.stringify([
        'Custom Modpack',
        'Economy System',
        'Land Protection',
        'Player Shops',
        'Regular Events',
      ]),
      rules: JSON.stringify([
        'No griefing or stealing',
        'Be respectful to others',
        'No cheating or exploiting',
        'Follow server guidelines',
      ]),
      modpack: {
        name: 'Saints Gaming Modpack',
        version: '1.0.0',
        downloadUrl: '/modpacks/saints-gaming.zip',
      },
      order: 2,
    },
  ];

  for (const server of servers) {
    const { id, ...updateData } = server;
    await prisma.server.upsert({
      where: { id: server.id },
      update: updateData,
      create: server,
    });
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 