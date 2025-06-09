import { PrismaClient } from '@prisma/client';
import type { User as PrismaUser, SocialLink as PrismaSocialLink } from '@prisma/client';
import { User, UserSettings, UserGamingProfile, ForumPost, ForumReply, ForumCategory } from './types';
import { UserRole, DEFAULT_ADMIN_EMAIL, DEFAULT_CATEGORIES } from './permissions';

const prisma = new PrismaClient();

let db: any = null;

async function initDatabase() {
  try {
    db = await prisma;

    // Users table
    await prisma.user.createMany({
      data: [
        {
          id: 'admin',
          email: 'matthewatoope@gmail.com',
          name: 'Matthew Atoope',
          password: 'admin',
          role: UserRole.ADMIN,
          emailVerified: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    });

    // User settings table
    await prisma.userSettings.createMany({
      data: [
        {
          userId: 'admin',
          theme: 'default',
          notifications: true,
          language: 'en',
          timezone: 'UTC',
          emailNotifications: true,
          darkMode: false,
          showOnlineStatus: true
        }
      ]
    });

    // User gaming profile table
    await prisma.userGamingProfile.createMany({
      data: [
        {
          userId: 'admin',
          favoriteGames: '[]',
          gamingSetup: '[]',
          gamingPreferences: '[]'
        }
      ]
    });

    // User social links table
    await prisma.userSocialLink.createMany({
      data: [
        {
          id: 'admin-social-link',
          userId: 'admin',
          platform: 'steam',
          url: 'https://steamcommunity.com/id/matthewatoope',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    });

    // Forum categories table
    await prisma.forumCategory.createMany({
      data: DEFAULT_CATEGORIES
    });

    // Post votes table
    await prisma.postVote.createMany({
      data: []
    });

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

async function ensureSuperAdmin() {
  try {
    await prisma.user.update({
      where: { email: 'matthewatoope@gmail.com' },
      data: { role: UserRole.ADMIN }
    });
  } catch (error) {
    console.error('Error ensuring super admin:', error);
  }
}

// Initialize database
initDatabase().then(ensureSuperAdmin).catch(console.error);

// Helper functions for type conversion
function convertPrismaUserToUser(prismaUser: any): User {
  return {
    id: prismaUser.id,
    name: prismaUser.name,
    email: prismaUser.email,
    role: prismaUser.role as UserRole,
    createdAt: prismaUser.createdAt.toISOString(),
    updatedAt: prismaUser.updatedAt.toISOString(),
    emailVerified: prismaUser.emailVerified?.toISOString() || '',
    password: undefined,
    bio: prismaUser.bio,
    avatar: prismaUser.avatar,
    steamId: prismaUser.steamId,
    discordId: prismaUser.discordId,
    twitchId: prismaUser.twitchId,
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
    socialLinks: prismaUser.socialLinks?.map((link: any) => ({
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

export async function updateUser(user: Partial<User>): Promise<User> {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: user.id! },
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        emailVerified: user.emailVerified ? new Date(user.emailVerified) : undefined,
        bio: user.bio,
        avatar: user.avatar,
        steamId: user.steamId,
        discordId: user.discordId,
        twitchId: user.twitchId,
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined,
        settings: user.settings ? {
          upsert: {
            create: {
              theme: user.settings.theme,
              notifications: user.settings.notifications,
              language: user.settings.language,
              timezone: user.settings.timezone,
              emailNotifications: user.settings.emailNotifications,
              darkMode: user.settings.darkMode,
              showOnlineStatus: user.settings.showOnlineStatus
            },
            update: {
              theme: user.settings.theme,
              notifications: user.settings.notifications,
              language: user.settings.language,
              timezone: user.settings.timezone,
              emailNotifications: user.settings.emailNotifications,
              darkMode: user.settings.darkMode,
              showOnlineStatus: user.settings.showOnlineStatus
            }
          }
        } : undefined,
        gamingProfile: user.gamingProfile ? {
          upsert: {
            create: {
              favoriteGames: JSON.stringify(user.gamingProfile.favoriteGames),
              gamingSetup: JSON.stringify(user.gamingProfile.gamingSetup),
              gamingPreferences: JSON.stringify(user.gamingProfile.gamingPreferences)
            },
            update: {
              favoriteGames: JSON.stringify(user.gamingProfile.favoriteGames),
              gamingSetup: JSON.stringify(user.gamingProfile.gamingSetup),
              gamingPreferences: JSON.stringify(user.gamingProfile.gamingPreferences)
            }
          }
        } : undefined,
        socialLinks: user.socialLinks ? {
          deleteMany: {},
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

// User settings operations
export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  try {
    const settings = await prisma.userSettings.findUnique({
      where: { userId }
    });
    if (!settings) return null;
    return {
      theme: settings.theme as "light" | "dark" | "system",
      notifications: settings.notifications,
      language: settings.language,
      timezone: settings.timezone,
      emailNotifications: settings.emailNotifications,
      darkMode: settings.darkMode,
      showOnlineStatus: settings.showOnlineStatus
    };
  } catch (error) {
    console.error('Error getting user settings:', error);
    throw error;
  }
}

export async function updateUserSettings(userId: string, settings: UserSettings): Promise<UserSettings> {
  try {
    const updatedSettings = await prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        theme: settings.theme,
        notifications: settings.notifications,
        language: settings.language,
        timezone: settings.timezone,
        emailNotifications: settings.emailNotifications,
        darkMode: settings.darkMode,
        showOnlineStatus: settings.showOnlineStatus
      },
      update: {
        theme: settings.theme,
        notifications: settings.notifications,
        language: settings.language,
        timezone: settings.timezone,
        emailNotifications: settings.emailNotifications,
        darkMode: settings.darkMode,
        showOnlineStatus: settings.showOnlineStatus
      }
    });
    return {
      theme: updatedSettings.theme as "light" | "dark" | "system",
      notifications: updatedSettings.notifications,
      language: updatedSettings.language,
      timezone: updatedSettings.timezone,
      emailNotifications: updatedSettings.emailNotifications,
      darkMode: updatedSettings.darkMode,
      showOnlineStatus: updatedSettings.showOnlineStatus
    };
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
}

// User gaming profile operations
export async function getUserGamingProfile(userId: string): Promise<UserGamingProfile | null> {
  try {
    const profile = await prisma.userGamingProfile.findUnique({
      where: { userId }
    });
    if (!profile) return null;
    return {
      favoriteGames: JSON.parse(profile.favoriteGames),
      gamingSetup: JSON.parse(profile.gamingSetup),
      gamingPreferences: JSON.parse(profile.gamingPreferences)
    };
  } catch (error) {
    console.error('Error getting user gaming profile:', error);
    throw error;
  }
}

export async function updateUserGamingProfile(userId: string, profile: UserGamingProfile): Promise<UserGamingProfile> {
  try {
    const updatedProfile = await prisma.userGamingProfile.upsert({
      where: { userId },
      create: {
        userId,
        favoriteGames: JSON.stringify(profile.favoriteGames),
        gamingSetup: JSON.stringify(profile.gamingSetup),
        gamingPreferences: JSON.stringify(profile.gamingPreferences)
      },
      update: {
        favoriteGames: JSON.stringify(profile.favoriteGames),
        gamingSetup: JSON.stringify(profile.gamingSetup),
        gamingPreferences: JSON.stringify(profile.gamingPreferences)
      }
    });
    return {
      favoriteGames: JSON.parse(updatedProfile.favoriteGames),
      gamingSetup: JSON.parse(updatedProfile.gamingSetup),
      gamingPreferences: JSON.parse(updatedProfile.gamingPreferences)
    };
  } catch (error) {
    console.error('Error updating user gaming profile:', error);
    throw error;
  }
}

// Forum category operations
export async function getForumCategories(categoryId?: string): Promise<ForumCategory | ForumCategory[]> {
  try {
    if (categoryId) {
      const category = await prisma.forumCategory.findUnique({
        where: { id: categoryId }
      });
      if (!category) return [];
      return {
        id: category.id,
        name: category.name,
        description: category.description || '',
        order: category.order,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString()
      };
    }
    const categories = await prisma.forumCategory.findMany({
      orderBy: { order: 'asc' }
    });
    return categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description || '',
      order: category.order,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString()
    }));
  } catch (error) {
    console.error('Error getting forum categories:', error);
    throw error;
  }
}

export async function createForumCategory(category: ForumCategory): Promise<ForumCategory> {
  try {
    const newCategory = await prisma.forumCategory.create({
      data: {
        name: category.name,
        description: category.description,
        order: category.order,
        createdAt: new Date(category.createdAt),
        updatedAt: new Date(category.updatedAt)
      }
    });
    return {
      id: newCategory.id,
      name: newCategory.name,
      description: newCategory.description || '',
      order: newCategory.order,
      createdAt: newCategory.createdAt.toISOString(),
      updatedAt: newCategory.updatedAt.toISOString()
    };
  } catch (error) {
    console.error('Error creating forum category:', error);
    throw error;
  }
}

export async function updateForumCategory(category: ForumCategory): Promise<ForumCategory> {
  try {
    const updatedCategory = await prisma.forumCategory.update({
      where: { id: category.id },
      data: {
        name: category.name,
        description: category.description,
        order: category.order,
        updatedAt: new Date()
      }
    });
    return {
      id: updatedCategory.id,
      name: updatedCategory.name,
      description: updatedCategory.description || '',
      order: updatedCategory.order,
      createdAt: updatedCategory.createdAt.toISOString(),
      updatedAt: updatedCategory.updatedAt.toISOString()
    };
  } catch (error) {
    console.error('Error updating forum category:', error);
    throw error;
  }
}

export async function deleteForumCategory(id: string): Promise<void> {
  try {
    await prisma.forumCategory.delete({
      where: { id }
    });
  } catch (error) {
    console.error('Error deleting forum category:', error);
    throw error;
  }
}

// Forum post operations
export async function getForumPosts(postId?: string): Promise<ForumPost | ForumPost[]> {
  try {
    if (postId) {
      const post = await prisma.forumPost.findUnique({
        where: { id: postId },
        include: {
          author: true,
          category: true,
          votes: true
        }
      });
      if (!post) return [];
      return {
        id: post.id,
        title: post.title,
        content: post.content,
        authorId: post.authorId,
        authorName: post.author.name,
        categoryId: post.categoryId,
        isPinned: post.isPinned,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        votes: post.votes.map(vote => ({
          userId: vote.userId,
          value: vote.value
        }))
      };
    }
    const posts = await prisma.forumPost.findMany({
      include: {
        author: true,
        category: true,
        votes: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      authorId: post.authorId,
      authorName: post.author.name,
      categoryId: post.categoryId,
      isPinned: post.isPinned,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      votes: post.votes.map(vote => ({
        userId: vote.userId,
        value: vote.value
      }))
    }));
  } catch (error) {
    console.error('Error getting forum posts:', error);
    throw error;
  }
}

export async function createForumPost(post: ForumPost): Promise<ForumPost> {
  try {
    const newPost = await prisma.forumPost.create({
      data: {
        title: post.title,
        content: post.content,
        authorId: post.authorId,
        categoryId: post.categoryId,
        isPinned: post.isPinned,
        createdAt: new Date(post.createdAt),
        updatedAt: new Date(post.updatedAt)
      },
      include: {
        author: true,
        category: true,
        votes: true
      }
    });
    return {
      id: newPost.id,
      title: newPost.title,
      content: newPost.content,
      authorId: newPost.authorId,
      authorName: newPost.author.name,
      categoryId: newPost.categoryId,
      isPinned: newPost.isPinned,
      createdAt: newPost.createdAt.toISOString(),
      updatedAt: newPost.updatedAt.toISOString(),
      votes: newPost.votes.map(vote => ({
        userId: vote.userId,
        value: vote.value
      }))
    };
  } catch (error) {
    console.error('Error creating forum post:', error);
    throw error;
  }
}

export async function updateForumPost(post: ForumPost): Promise<ForumPost> {
  try {
    const updatedPost = await prisma.forumPost.update({
      where: { id: post.id },
      data: {
        title: post.title,
        content: post.content,
        authorId: post.authorId,
        categoryId: post.categoryId,
        isPinned: post.isPinned,
        updatedAt: new Date()
      },
      include: {
        author: true,
        category: true,
        votes: true
      }
    });
    return {
      id: updatedPost.id,
      title: updatedPost.title,
      content: updatedPost.content,
      authorId: updatedPost.authorId,
      authorName: updatedPost.author.name,
      categoryId: updatedPost.categoryId,
      isPinned: updatedPost.isPinned,
      createdAt: updatedPost.createdAt.toISOString(),
      updatedAt: updatedPost.updatedAt.toISOString(),
      votes: updatedPost.votes.map(vote => ({
        userId: vote.userId,
        value: vote.value
      }))
    };
  } catch (error) {
    console.error('Error updating forum post:', error);
    throw error;
  }
}

export async function deleteForumPost(id: string): Promise<void> {
  try {
    await prisma.forumPost.delete({
      where: { id }
    });
  } catch (error) {
    console.error('Error deleting forum post:', error);
    throw error;
  }
}

// Forum reply operations
export async function getForumReplies(postId?: string): Promise<ForumReply[]> {
  try {
    const replies = await prisma.forumReply.findMany({
      where: postId ? { postId } : undefined,
      include: {
        author: true
      },
      orderBy: { createdAt: 'asc' }
    });
    return replies.map(reply => ({
      id: reply.id,
      content: reply.content,
      authorId: reply.authorId,
      postId: reply.postId,
      createdAt: reply.createdAt.toISOString(),
      updatedAt: reply.updatedAt.toISOString()
    }));
  } catch (error) {
    console.error('Error getting forum replies:', error);
    throw error;
  }
}

export async function createForumReply(reply: ForumReply): Promise<ForumReply> {
  try {
    const newReply = await prisma.forumReply.create({
      data: {
        content: reply.content,
        authorId: reply.authorId,
        postId: reply.postId,
        createdAt: new Date(reply.createdAt),
        updatedAt: new Date(reply.updatedAt)
      },
      include: {
        author: true
      }
    });
    return {
      id: newReply.id,
      content: newReply.content,
      authorId: newReply.authorId,
      postId: newReply.postId,
      createdAt: newReply.createdAt.toISOString(),
      updatedAt: newReply.updatedAt.toISOString()
    };
  } catch (error) {
    console.error('Error creating forum reply:', error);
    throw error;
  }
}

export async function updateForumReply(reply: ForumReply): Promise<ForumReply> {
  try {
    const updatedReply = await prisma.forumReply.update({
      where: { id: reply.id },
      data: {
        content: reply.content,
        authorId: reply.authorId,
        postId: reply.postId,
        updatedAt: new Date()
      },
      include: {
        author: true
      }
    });
    return {
      id: updatedReply.id,
      content: updatedReply.content,
      authorId: updatedReply.authorId,
      postId: updatedReply.postId,
      createdAt: updatedReply.createdAt.toISOString(),
      updatedAt: updatedReply.updatedAt.toISOString()
    };
  } catch (error) {
    console.error('Error updating forum reply:', error);
    throw error;
  }
}

export async function deleteForumReply(id: string): Promise<void> {
  try {
    await prisma.forumReply.delete({
      where: { id }
    });
  } catch (error) {
    console.error('Error deleting forum reply:', error);
    throw error;
  }
}

// User profile operations
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  steamId?: string;
  socialLinks: {
    platform: string;
    url: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        socialLinks: true,
        gamingProfile: true
      }
    });
    if (!user) return null;
    return {
      ...user,
      password: undefined,
      steamId: user.gamingProfile?.steamId,
      socialLinks: user.socialLinks.map(link => ({
        platform: link.platform,
        url: link.url
      }))
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

export async function updateUserProfile(
  userId: string,
  data: {
    name?: string;
    socialLinks?: { platform: string; url: string }[];
  }
): Promise<UserProfile> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        socialLinks: data.socialLinks ? {
          deleteMany: {},
          create: data.socialLinks.map(link => ({
            platform: link.platform,
            url: link.url
          }))
        } : undefined,
        updatedAt: new Date()
      },
      include: {
        socialLinks: true,
        gamingProfile: true
      }
    });
    return {
      ...user,
      password: undefined,
      steamId: user.gamingProfile?.steamId,
      socialLinks: user.socialLinks.map(link => ({
        platform: link.platform,
        url: link.url
      }))
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

export default db; 