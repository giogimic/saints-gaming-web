import { prisma } from './db';
import type { User } from './types';
import { hash } from 'bcryptjs';
import { UserRole } from './permissions';
import fs from 'fs/promises';
import path from 'path';

export async function saveUser(user: Partial<User>): Promise<User> {
  try {
    if (!user.password) {
      throw new Error('Password is required');
    }

    const hashedPassword = await hash(user.password, 12);

    const newUser = await prisma.user.create({
      data: {
        name: user.name || '',
        email: user.email || '',
        password: hashedPassword,
        role: (user.role || 'member') as UserRole,
        emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
        bio: user.bio || null,
        avatar: user.avatar || null,
        steamId: user.steamId || null,
        discordId: user.discordId || null,
        twitchId: user.twitchId || null,
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

    return {
      id: newUser.id,
      name: newUser.name || '',
      email: newUser.email || '',
      role: newUser.role as UserRole,
      createdAt: newUser.createdAt.toISOString(),
      updatedAt: newUser.updatedAt.toISOString(),
      emailVerified: newUser.emailVerified?.toISOString() || '',
      password: newUser.password || '',
      bio: newUser.bio || undefined,
      avatar: newUser.avatar || undefined,
      steamId: newUser.steamId || undefined,
      discordId: newUser.discordId || undefined,
      twitchId: newUser.twitchId || undefined,
      lastLogin: newUser.lastLogin?.toISOString(),
      settings: newUser.settings ? {
        theme: newUser.settings.theme as "light" | "dark" | "system",
        notifications: newUser.settings.notifications,
        language: newUser.settings.language,
        timezone: newUser.settings.timezone,
        emailNotifications: newUser.settings.emailNotifications,
        darkMode: newUser.settings.darkMode,
        showOnlineStatus: newUser.settings.showOnlineStatus
      } : undefined,
      gamingProfile: newUser.gamingProfile ? {
        favoriteGames: JSON.parse(newUser.gamingProfile.favoriteGames),
        gamingSetup: JSON.parse(newUser.gamingProfile.gamingSetup),
        gamingPreferences: JSON.parse(newUser.gamingProfile.gamingPreferences)
      } : undefined,
      socialLinks: newUser.socialLinks?.map(link => ({
        platform: link.platform,
        url: link.url
      }))
    };
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
}

export async function getPage(slug: string) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'pages', `${slug}.json`);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading page:', error);
    return null;
  }
}

export async function updateUserVerification(userId: string, verified: boolean) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: verified ? new Date() : null }
    });
    return user;
  } catch (error) {
    console.error('Error updating user verification:', error);
    throw error;
  }
}

export async function readJsonFile(filePath: string) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return null;
  }
}

export async function writeJsonFile(filePath: string, data: any) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing JSON file:', error);
    return false;
  }
}

export async function getPostById(id: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: true,
        comments: true,
        votes: true
      }
    });
    return post;
  } catch (error) {
    console.error('Error getting post:', error);
    return null;
  }
}

export async function updatePost(id: string, data: any) {
  try {
    const post = await prisma.post.update({
      where: { id },
      data,
      include: {
        author: true,
        comments: true,
        votes: true
      }
    });
    return post;
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
}

export async function deletePost(id: string) {
  try {
    await prisma.post.delete({
      where: { id }
    });
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    return false;
  }
}
