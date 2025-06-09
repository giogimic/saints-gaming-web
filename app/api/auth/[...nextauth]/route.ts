import NextAuth from 'next-auth';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import SteamProvider from '@/lib/auth/steam-provider';
import { createUser, getUsers, getUserByEmail, updateUser } from '@/lib/db';
import { compare, hash } from 'bcryptjs';
import { UserRole } from '@/lib/permissions';
import { saveUser } from '@/lib/storage';
import type { User } from '@/lib/types';

interface SteamProfile {
  steamid: string;
  personaname: string;
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const user = await getUserByEmail(credentials.email);
        
        // If user doesn't exist, create a new one
        if (!user) {
          const hashedPassword = await hash(credentials.password, 12);
          const newUser: Partial<User> = {
            id: crypto.randomUUID(),
            name: credentials.email.split('@')[0],
            email: credentials.email,
            password: hashedPassword,
            role: UserRole.MEMBER,
            emailVerified: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            bio: '',
            settings: {
              theme: 'system' as const,
              notifications: true,
              language: 'en',
              timezone: 'UTC',
              emailNotifications: true,
              darkMode: false,
              showOnlineStatus: true
            },
            gamingProfile: {
              favoriteGames: [],
              gamingSetup: [],
              gamingPreferences: []
            }
          };

          const createdUser = await saveUser(newUser);
          return {
            id: createdUser.id,
            email: createdUser.email,
            name: createdUser.name,
            role: createdUser.role,
            image: createdUser.avatar
          };
        }

        // If user exists, verify password
        if (!user.password) {
          throw new Error('Invalid credentials');
        }

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        // Update last login
        await updateUser(user.id, { lastLogin: new Date().toISOString() });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.avatar
        };
      },
    }),
    SteamProvider({
      clientId: process.env.STEAM_CLIENT_ID!,
      clientSecret: process.env.STEAM_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'steam') {
        try {
          const steamProfile = profile as SteamProfile;
          const steamId = steamProfile.steamid;
          if (!steamId) return false;

          const users = await getUsers();
          const existingUser = users.find(u => u.steamId === steamId);

          if (existingUser) {
            await updateUser(existingUser.id, { lastLogin: new Date().toISOString() });
            return true;
          }

          const newUser: Partial<User> = {
            id: crypto.randomUUID(),
            name: steamProfile.personaname || 'Steam User',
            email: `${steamId}@steam.local`,
            steamId,
            role: UserRole.MEMBER,
            emailVerified: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            bio: '',
            settings: {
              theme: 'system' as const,
              notifications: true,
              language: 'en',
              timezone: 'UTC',
              emailNotifications: true,
              darkMode: false,
              showOnlineStatus: true
            },
            gamingProfile: {
              favoriteGames: [],
              gamingSetup: [],
              gamingPreferences: []
            }
          };

          await saveUser(newUser);
          return true;
        } catch (error) {
          console.error('Steam sign in error:', error);
          return false;
        }
      }

      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        const user = await getUserByEmail(session.user.email);
        if (user) {
          session.user.id = user.id;
          session.user.role = user.role;
          session.user.steamId = user.steamId;
        }
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      if (account?.provider === 'steam' && profile) {
        const steamProfile = profile as SteamProfile;
        token.steamId = steamProfile.steamid;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 