export type UserRole = 'user' | 'admin' | 'moderator';

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  image?: string;
  emailVerified: boolean;
  verificationToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  order: number;
  posts: ForumPost[];
  createdAt: string;
  updatedAt: string;
}

export interface ForumPost {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  likes: number;
  isSolution: boolean;
}

export interface ForumReply {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  likes: number;
  isSolution: boolean;
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
  user: 0,
  moderator: 1,
  admin: 2,
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  user: ['read:posts', 'create:posts', 'edit:own:posts', 'delete:own:posts'],
  moderator: ['read:posts', 'create:posts', 'edit:posts', 'delete:posts', 'manage:categories'],
  admin: ['read:posts', 'create:posts', 'edit:posts', 'delete:posts', 'manage:categories', 'manage:users', 'manage:roles'],
}; 