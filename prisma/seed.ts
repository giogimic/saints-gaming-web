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

  // Create system user
  const systemUser = await prisma.user.upsert({
    where: { email: 'system@saintsgaming.com' },
    update: {},
    create: {
      email: 'system@saintsgaming.com',
      name: 'System',
      role: 'admin',
    },
  });

  // Minimal home page content
  const homeContent = {
    hero: {
      id: 'hero',
      type: 'hero',
      title: 'Welcome to Saints Gaming',
      subtitle: 'A modern gaming community for everyone',
      button: 'Join Now',
    },
    welcome: {
      id: 'welcome',
      type: 'text',
      content: 'We are glad you are here! Explore our servers and join the fun.'
    }
  };

  await prisma.page.upsert({
    where: { slug: 'home' },
    update: {
      title: 'Home',
      content: JSON.stringify(homeContent),
      isPublished: true,
      createdById: systemUser.id,
    },
    create: {
      slug: 'home',
      title: 'Home',
      content: JSON.stringify(homeContent),
      isPublished: true,
      createdById: systemUser.id,
    },
  });

  console.log('Minimal home page seeded!');

  // Create about page
  const aboutPage = await prisma.page.upsert({
    where: { slug: 'about' },
    update: {},
    create: {
      slug: 'about',
      title: 'About SaintsGaming',
      description: 'Learn about SaintsGaming, our mission, servers, modpacks, and join our thriving community.',
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
      isPublished: true,
      createdById: systemUser.id,
      template: 'about',
      metadata: {
        seo: {
          title: 'About SaintsGaming - Your Premier Modded Gaming Community',
          description: 'Discover SaintsGaming, your premier destination for modded multiplayer gaming. Experience our curated modpacks, high-performance servers, and join our thriving community.',
          keywords: ['modded gaming', 'multiplayer servers', 'gaming community', 'ARK mods', 'Minecraft modpacks', 'Stardew Valley mods']
        }
      }
    }
  });

  // Remove the old content blocks since we're using a new structure
  await prisma.contentBlock.deleteMany({
    where: {
      pageId: aboutPage.id
    }
  });

  // Create contact page
  const contactPage = await prisma.page.upsert({
    where: { slug: 'contact' },
    update: {},
    create: {
      slug: 'contact',
      title: 'Contact',
      description: 'Contact Saints Gaming',
      content: JSON.stringify({
        heroTitle: { id: 'heroTitle', type: 'text', content: 'Contact Us' },
        heroSubtitle: { id: 'heroSubtitle', type: 'text', content: 'Get in touch with our team' },
        contactTitle: { id: 'contactTitle', type: 'text', content: 'Send us a message' },
        contactDesc: { id: 'contactDesc', type: 'text', content: 'Have questions or feedback? We\'d love to hear from you!' },
        emailLabel: { id: 'emailLabel', type: 'text', content: 'Email' },
        emailPlaceholder: { id: 'emailPlaceholder', type: 'text', content: 'Enter your email' },
        messageLabel: { id: 'messageLabel', type: 'text', content: 'Message' },
        messagePlaceholder: { id: 'messagePlaceholder', type: 'text', content: 'Enter your message' },
        submitButton: { id: 'submitButton', type: 'text', content: 'Send Message' }
      }),
      isPublished: true,
      createdById: systemUser.id,
      template: 'contact',
      metadata: {
        seo: {
          title: 'Contact Saints Gaming - Get in Touch',
          description: 'Contact Saints Gaming for support, feedback, or any questions about our gaming community.',
          keywords: ['contact', 'support', 'feedback', 'gaming community']
        }
      }
    },
  });

  // Create contact page content blocks
  await prisma.contentBlock.createMany({
    data: [
      {
        type: 'hero',
        title: 'Contact Hero',
        content: {
          title: 'Contact Us',
          subtitle: 'Get in touch with our team'
        },
        order: 1,
        isPublished: true,
        createdById: systemUser.id,
        pageId: contactPage.id,
        settings: {
          backgroundImage: '/images/contact-hero.jpg',
          textColor: '#ffffff'
        }
      },
      {
        type: 'contact-form',
        title: 'Contact Form',
        content: {
          title: 'Send us a message',
          description: 'Have questions or feedback? We\'d love to hear from you!',
          fields: [
            {
              type: 'email',
              label: 'Email',
              placeholder: 'Enter your email'
            },
            {
              type: 'textarea',
              label: 'Message',
              placeholder: 'Enter your message'
            }
          ],
          submitButton: 'Send Message'
        },
        order: 2,
        isPublished: true,
        createdById: systemUser.id,
        pageId: contactPage.id
      }
    ]
  });

  // Initialize server data
  const servers = [
    {
      name: "ARK: Survival Ascended",
      description: "Experience the ultimate survival adventure in ARK: Survival Ascended",
      image: "/saintsgaming-logo.png",
      status: "online",
      players: 0,
      maxPlayers: 70,
      version: "v1.0",
      ip: "play.saintsgaming.com",
      type: "ark",
      features: JSON.stringify([
        "High-performance server",
        "Active community",
        "Regular events",
        "24/7 support"
      ]),
      rules: JSON.stringify([
        "Be respectful to other players",
        "No cheating or exploiting",
        "No griefing or harassment",
        "Follow server guidelines"
      ]),
      metadata: {
        seo: {
          title: "ARK: Survival Ascended Server - Saints Gaming",
          description: "Join our ARK: Survival Ascended server for an epic survival experience with a friendly community.",
          keywords: ["ARK", "Survival Ascended", "gaming", "server", "community"]
        }
      },
      order: 1
    },
    {
      name: "Minecraft Server",
      description: "Join our vibrant Minecraft community with custom modpacks",
      image: "/saintsgaming-icon.png",
      status: "online",
      players: 0,
      maxPlayers: 100,
      version: "1.20.4",
      ip: "mc.saintsgaming.com",
      type: "minecraft",
      features: JSON.stringify([
        "Custom modpack",
        "Economy system",
        "Land protection",
        "Regular events"
      ]),
      rules: JSON.stringify([
        "Be respectful to other players",
        "No griefing or stealing",
        "No cheating or exploiting",
        "Follow server guidelines"
      ]),
      metadata: {
        seo: {
          title: "Minecraft Server - Saints Gaming",
          description: "Join our Minecraft server with custom modpacks and a friendly community.",
          keywords: ["Minecraft", "server", "modpack", "gaming", "community"]
        }
      },
      order: 2
    }
  ];

  for (const server of servers) {
    await prisma.server.create({
      data: server
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 