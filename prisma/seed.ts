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
      title: 'About Us',
      description: 'Learn about Saints Gaming, our mission, vision, and the team behind your favorite gaming community.',
      content: JSON.stringify({
        title: { id: 'title', type: 'text', content: 'About Saints Gaming' },
        description: { id: 'description', type: 'text', content: 'Welcome to Saints Gaming, your ultimate destination for ARK and Minecraft gaming experiences.' },
        mission: { id: 'mission', type: 'text', content: 'Our mission is to provide the best gaming experience with high-performance servers and a friendly community.' },
        vision: { id: 'vision', type: 'text', content: 'We envision a gaming community where players can enjoy their favorite games in a safe and welcoming environment.' },
        teamTitle: { id: 'teamTitle', type: 'text', content: 'Our Team' },
        teamDesc: { id: 'teamDesc', type: 'text', content: 'Meet the dedicated team behind Saints Gaming.' },
        member1Name: { id: 'member1Name', type: 'text', content: 'John Doe' },
        member1Role: { id: 'member1Role', type: 'text', content: 'Founder & Lead Developer' },
        member1Desc: { id: 'member1Desc', type: 'text', content: 'Passionate about gaming and community building.' },
        member2Name: { id: 'member2Name', type: 'text', content: 'Jane Smith' },
        member2Role: { id: 'member2Role', type: 'text', content: 'Community Manager' },
        member2Desc: { id: 'member2Desc', type: 'text', content: 'Dedicated to creating an amazing community experience.' }
      }),
      isPublished: true,
      createdById: systemUser.id,
      template: 'about',
      metadata: {
        seo: {
          title: 'About Saints Gaming - Our Story and Team',
          description: 'Learn about Saints Gaming, our mission, vision, and the team behind your favorite gaming community.',
          keywords: ['about', 'gaming community', 'team', 'mission', 'vision']
        }
      }
    }
  });

  // Create about page content blocks
  await prisma.contentBlock.createMany({
    data: [
      {
        type: 'hero',
        title: 'About Hero',
        content: {
          title: 'About Saints Gaming',
          subtitle: 'Your Ultimate Gaming Community'
        },
        order: 1,
        isPublished: true,
        createdById: systemUser.id,
        pageId: aboutPage.id,
        settings: {
          backgroundImage: '/images/about-hero.jpg',
          textColor: '#ffffff'
        }
      },
      {
        type: 'mission',
        title: 'Our Mission',
        content: {
          title: 'Our Mission',
          description: 'Our mission is to provide the best gaming experience with high-performance servers and a friendly community.'
        },
        order: 2,
        isPublished: true,
        createdById: systemUser.id,
        pageId: aboutPage.id
      },
      {
        type: 'vision',
        title: 'Our Vision',
        content: {
          title: 'Our Vision',
          description: 'We envision a gaming community where players can enjoy their favorite games in a safe and welcoming environment.'
        },
        order: 3,
        isPublished: true,
        createdById: systemUser.id,
        pageId: aboutPage.id
      },
      {
        type: 'team',
        title: 'Our Team',
        content: {
          title: 'Our Team',
          description: 'Meet the dedicated team behind Saints Gaming.',
          members: [
            {
              name: 'John Doe',
              role: 'Founder & Lead Developer',
              description: 'Passionate about gaming and community building.'
            },
            {
              name: 'Jane Smith',
              role: 'Community Manager',
              description: 'Dedicated to creating an amazing community experience.'
            }
          ]
        },
        order: 4,
        isPublished: true,
        createdById: systemUser.id,
        pageId: aboutPage.id
      }
    ]
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