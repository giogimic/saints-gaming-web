import { PrismaClient } from '@prisma/client';
import type { User as PrismaUser, UserSettings as PrismaUserSettings, UserGamingProfile as PrismaUserGamingProfile, SocialLink as PrismaSocialLink, Category, Post, Reply } from '@prisma/client';
import { User, UserSettings, UserGamingProfile, ForumPost, ForumReply, ForumCategory } from './types';
import { UserRole, DEFAULT_CATEGORIES } from './permissions';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Initialize database with default categories
async function initDatabase() {
  try {
    const existingCategories = await prisma.category.findMany();
    if (existingCategories.length === 0) {
      await prisma.category.createMany({
        data: DEFAULT_CATEGORIES.map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          order: cat.order,
          isDefault: cat.isDefault
        }))
      });
    }
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Initialize database
initDatabase().catch(console.error);

// Helper functions for type conversion
function convertPrismaUserToUser(prismaUser: PrismaUser & {
  settings?: PrismaUserSettings | null;
  gamingProfile?: PrismaUserGamingProfile | null;
  socialLinks?: PrismaSocialLink[];
}): User {
  return {
    id: prismaUser.id,
    name: prismaUser.name || '',
    email: prismaUser.email || '',
    role: prismaUser.role as UserRole,
    createdAt: prismaUser.createdAt.toISOString(),
    updatedAt: prismaUser.updatedAt.toISOString(),
    emailVerified: prismaUser.emailVerified?.toISOString() || '',
    password: prismaUser.password || '',
    bio: prismaUser.bio || undefined,
    avatar: prismaUser.avatar || undefined,
    steamId: prismaUser.steamId || undefined,
    discordId: prismaUser.discordId || undefined,
    twitchId: prismaUser.twitchId || undefined,
    lastLogin: prismaUser.lastLogin?.toISOString(),
    settings: prismaUser.settings ? {
      theme: prismaUser.settings.theme as "light" | "dark" | "system",
      notifications: prismaUser.settings.notifications,
      language: prismaUser.settings.language,
      timezone: prismaUser.settings.timezone,
      emailNotifications: prismaUser.settings.emailNotifications,
      darkMode: prismaUser.settings.darkMode,
      showOnlineStatus: prismaUser.settings.showOnlineStatus
    } : undefined,
    gamingProfile: prismaUser.gamingProfile ? {
      favoriteGames: JSON.parse(prismaUser.gamingProfile.favoriteGames),
      gamingSetup: JSON.parse(prismaUser.gamingProfile.gamingSetup),
      gamingPreferences: JSON.parse(prismaUser.gamingProfile.gamingPreferences)
    } : undefined,
    socialLinks: prismaUser.socialLinks?.map(link => ({
      platform: link.platform,
      url: link.url
    }))
  };
}

// User operations
export async function getUsers(): Promise<User[]> {
  try {
    const users = await prisma.user.findMany({
      include: {
        settings: true,
        gamingProfile: true,
        socialLinks: true
      }
    });
    return users.map(convertPrismaUserToUser);
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        settings: true,
        gamingProfile: true,
        socialLinks: true
      }
    });
    if (!user) return null;
    return convertPrismaUserToUser(user);
  } catch (error) {
    console.error('Error getting user by id:', error);
    throw error;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        settings: true,
        gamingProfile: true,
        socialLinks: true
      }
    });
    if (!user) return null;
    return convertPrismaUserToUser(user);
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
}

export async function createUser(user: Partial<User>): Promise<User> {
  try {
    if (!user.password) {
      throw new Error('Password is required');
    }

    const newUser = await prisma.user.create({
      data: {
        name: user.name || '',
        email: user.email || '',
        password: user.password,
        role: user.role || UserRole.MEMBER,
        emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
        bio: user.bio,
        avatar: user.avatar,
        steamId: user.steamId,
        discordId: user.discordId,
        twitchId: user.twitchId,
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
        settings: user.settings ? {
          create: {
            theme: user.settings.theme,
            notifications: user.settings.notifications,
            language: user.settings.language,
            timezone: user.settings.timezone,
            emailNotifications: user.settings.emailNotifications,
            darkMode: user.settings.darkMode,
            showOnlineStatus: user.settings.showOnlineStatus
          }
        } : undefined,
        gamingProfile: user.gamingProfile ? {
          create: {
            favoriteGames: JSON.stringify(user.gamingProfile.favoriteGames),
            gamingSetup: JSON.stringify(user.gamingProfile.gamingSetup),
            gamingPreferences: JSON.stringify(user.gamingProfile.gamingPreferences)
          }
        } : undefined,
        socialLinks: user.socialLinks ? {
          create: user.socialLinks.map(link => ({
            platform: link.platform,
            url: link.url
          }))
        } : undefined
      },
      include: {
        settings: true,
        gamingProfile: true,
        socialLinks: true
      }
    });
    return convertPrismaUserToUser(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateUser(idOrUser: string | User, userData?: Partial<User>): Promise<User> {
  try {
    const id = typeof idOrUser === 'string' ? idOrUser : idOrUser.id;
    const data = typeof idOrUser === 'string' ? userData : idOrUser;

    if (!data) {
      throw new Error('No update data provided');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        emailVerified: data.emailVerified ? new Date(data.emailVerified) : undefined,
        bio: data.bio,
        avatar: data.avatar,
        steamId: data.steamId,
        discordId: data.discordId,
        twitchId: data.twitchId,
        lastLogin: data.lastLogin ? new Date(data.lastLogin) : undefined,
        settings: data.settings ? {
          upsert: {
            create: {
              theme: data.settings.theme,
              notifications: data.settings.notifications,
              language: data.settings.language,
              timezone: data.settings.timezone,
              emailNotifications: data.settings.emailNotifications,
              darkMode: data.settings.darkMode,
              showOnlineStatus: data.settings.showOnlineStatus
            },
            update: {
              theme: data.settings.theme,
              notifications: data.settings.notifications,
              language: data.settings.language,
              timezone: data.settings.timezone,
              emailNotifications: data.settings.emailNotifications,
              darkMode: data.settings.darkMode,
              showOnlineStatus: data.settings.showOnlineStatus
            }
          }
        } : undefined,
        gamingProfile: data.gamingProfile ? {
          upsert: {
            create: {
              favoriteGames: JSON.stringify(data.gamingProfile.favoriteGames),
              gamingSetup: JSON.stringify(data.gamingProfile.gamingSetup),
              gamingPreferences: JSON.stringify(data.gamingProfile.gamingPreferences)
            },
            update: {
              favoriteGames: JSON.stringify(data.gamingProfile.favoriteGames),
              gamingSetup: JSON.stringify(data.gamingProfile.gamingSetup),
              gamingPreferences: JSON.stringify(data.gamingProfile.gamingPreferences)
            }
          }
        } : undefined
      },
      include: {
        settings: true,
        gamingProfile: true,
        socialLinks: true
      }
    });
    return convertPrismaUserToUser(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    await prisma.user.delete({
      where: { id }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// Category operations
export async function getCategories(): Promise<Category[]> {
  try {
    return await prisma.category.findMany({
      orderBy: { order: 'asc' }
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
}

export async function createCategory(category: Partial<Category>): Promise<Category> {
  try {
    return await prisma.category.create({
      data: {
        name: category.name || '',
        description: category.description,
        order: category.order || 0,
        isDefault: category.isDefault || false
      }
    });
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

export async function updateCategory(id: string, category: Partial<Category>): Promise<Category> {
  try {
    return await prisma.category.update({
      where: { id },
      data: {
        name: category.name,
        description: category.description,
        order: category.order,
        isDefault: category.isDefault
      }
    });
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await prisma.category.delete({
      where: { id }
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}