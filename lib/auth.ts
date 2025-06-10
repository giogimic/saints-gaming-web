import { getServerSession } from 'next-auth';
import { getUsers, getUserById, getUserByEmail } from './db';
import type { User } from './types';
import { UserRole, ROLE_HIERARCHY } from './permissions';
import type { Session } from "next-auth";
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/prisma';
import bcrypt from "bcryptjs"
import CredentialsProvider from "next-auth/providers/credentials"
import { User as PrismaUser } from "@prisma/client"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { DefaultSession } from "next-auth"
import "./auth-types"

declare module "next-auth" {
  interface User {
    id: string
    email: string | null
    name: string | null
    role: UserRole
    image: string | null
  }

  interface Session {
    user: {
      id: string
      email: string | null
      name: string | null
      role: UserRole
      image: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string | null
    name: string | null
    role: UserRole
    picture: string | null
  }
}

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

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as UserRole
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
}

export { authOptions }

// Helper function to get session with type safety
export const getAuthSession = () => getServerSession(authOptions) 