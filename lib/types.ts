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
  gamingSetup: string[];
  gamingPreferences: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  emailVerified: string;
  password: string;
  bio?: string;
  avatar?: string;
  steamId?: string;
  discordId?: string;
  twitchId?: string;
  lastLogin?: string;
  settings?: UserSettings;
  gamingProfile?: UserGamingProfile;
  socialLinks?: SocialLink[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  order: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  categoryId: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Reply {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface GamingUrls {
  steam: string;
  discord: string;
  twitch: string;
}

export interface PostVote {
  id: string;
  postId: string;
  userId: string;
  value: number;
  createdAt: string;
  updatedAt: string;
  post?: ForumPost;
  user?: User;
}

export interface ReplyVote {
  id: string;
  replyId: string;
  userId: string;
  value: number;
  createdAt: string;
  updatedAt: string;
  reply?: ForumReply;
  user?: User;
}

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  order: number;
  posts?: ForumPost[];
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  author?: User;
  category?: ForumCategory;
  replies?: ForumReply[];
  votes?: PostVote[];
}

export interface ForumReply {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  createdAt: string;
  updatedAt: string;
  isSolution: boolean;
  author?: User;
  post?: ForumPost;
  votes?: ReplyVote[];
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
  expiresAt: string;
  provider: string;
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

export interface SteamProfile {
  steamid: string;
  personaname: string;
  avatarfull: string;
}

export interface DiscordProfile {
  id: string;
  username: string;
  avatar: string;
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