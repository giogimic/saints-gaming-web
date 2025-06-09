export enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member',
  USER = 'user'
}

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

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: string;
  createdAt: string;
  updatedAt: string;
  settings?: UserSettings;
  gamingProfile?: UserGamingProfile;
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
  categoryId: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
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

export const ROLE_WEIGHTS: Record<UserRole, number> = {
  member: 0,
  moderator: 1,
  admin: 2,
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  member: ['read:posts', 'create:posts', 'edit:own:posts', 'delete:own:posts'],
  moderator: ['read:posts', 'create:posts', 'edit:posts', 'delete:posts', 'manage:categories'],
  admin: ['read:posts', 'create:posts', 'edit:posts', 'delete:posts', 'manage:categories', 'manage:users', 'manage:roles'],
}; 