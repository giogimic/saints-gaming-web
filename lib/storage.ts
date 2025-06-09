import { prisma } from './db';
import type { User } from './types';
import { hash } from 'bcryptjs';
import { UserRole } from './permissions';

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