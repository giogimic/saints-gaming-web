import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getUsers, getUserById, getUserByEmail } from './db';
import type { User } from './types';
import { UserRole, ROLE_HIERARCHY } from './permissions';

export function hasPermission(userRole: string, requiredRole: string): boolean {
  return ROLE_HIERARCHY[userRole as UserRole] >= ROLE_HIERARCHY[requiredRole as UserRole];
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getServerSession(authOptions);
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