import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getUsers, getUserById, getUserByEmail } from './db';
import type { User } from './types';
import { UserRole, ROLE_HIERARCHY } from './permissions';
import type { Session } from "next-auth";

export interface UserSession extends Omit<Session, 'user'> {
  user: {
    id: string;
    email: string | null;
    name: string | null;
    role: string;
  };
}

export function hasPermission(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    admin: 3,
    moderator: 2,
    member: 1,
  };

  return (roleHierarchy[userRole as keyof typeof roleHierarchy] || 0) >= 
         (roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0);
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getServerSession(authOptions) as UserSession | null;
  if (!session?.user?.email) return null;
  return getUserByEmail(session.user.email);
}

export async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id || null;
}

export async function getCurrentUserRole(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.role || null;
}

export async function getAllUsers(): Promise<User[]> {
  return getUsers();
}

export async function getUser(id: string): Promise<User | null> {
  return getUserById(id);
}

export async function getUserByEmailAddress(email: string): Promise<User | null> {
  return getUserByEmail(email);
} 