import { UserRole } from './permissions';

export interface UserSettings {
  theme: "light" | "dark" | "system";
  notifications: boolean;
  language: string;
  timezone: string;
  emailNotifications: boolean;
  darkMode: boolean;
  showOnlineStatus: boolean;
}

export interface UserGamingProfile {
  favoriteGames: string[];
  gamingSetup: {
    pc?: {
      cpu: string;
      gpu: string;
    };
    console?: {
      type: string;
      model: string;
    };
  };
  gamingPreferences: {
    favoriteGenres: string[];
    playStyle: string[];
    multiplayer: boolean;
    competitive: boolean;
  };
}

export interface GamingUrls {
  steam: string;
  discord: string;
  twitch: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  emailVerified: string;
  password?: string;
  bio?: string;
  avatar?: string;
  steamId?: string;
  discordId?: string;
  twitchId?: string;
  lastLogin?: string;
  settings?: UserSettings;
  gamingProfile?: UserGamingProfile;
  gamingUrls?: GamingUrls;
  socialLinks?: {
    platform: string;
    url: string;
  }[];
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  votes: Vote[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vote {
  id: string;
  postId: string;
  userId: string;
  value: number;
  createdAt: string;
}

export interface Session {
  user: User;
  expires: string;
}

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName?: string;
  categoryId: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  votes?: Array<{
    userId: string;
    value: number;
  }>;
}

export interface ForumReply {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageContent {
  id: string;
  title: string;
  content: string;
  slug: string;
  path: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPermission {
  role: UserRole;
  permissions: string[];
}

export interface AuthSession {
  id: string;
  userId: string;
  provider: string;
  createdAt: string;
  expiresAt: string;
}

export interface CookieConsent {
  id: string;
  userId: string;
  accepted: boolean;
  timestamp: string;
  preferences: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
  };
}

export interface SteamStats {
  achievements: number;
  playtime: number;
  friends: number;
  games: {
    appid: number;
    name: string;
    playtime_forever: number;
    playtime_2weeks?: number;
  }[];
  currentGame?: {
    name: string;
    appid: number;
  };
}

export const ROLE_WEIGHTS: Record<UserRole, number> = {
  [UserRole.USER]: 0,
  [UserRole.MEMBER]: 1,
  [UserRole.MODERATOR]: 2,
  [UserRole.ADMIN]: 3,
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.USER]: ['read:posts'],
  [UserRole.MEMBER]: ['read:posts', 'create:posts', 'edit:own:posts', 'delete:own:posts'],
  [UserRole.MODERATOR]: ['read:posts', 'create:posts', 'edit:posts', 'delete:posts', 'manage:categories'],
  [UserRole.ADMIN]: ['read:posts', 'create:posts', 'edit:posts', 'delete:posts', 'manage:categories', 'manage:users', 'manage:roles'],
}; 