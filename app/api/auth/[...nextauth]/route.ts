import NextAuth from 'next-auth';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import SteamProvider from '@/lib/auth/steam-provider';
import { createUser, getUsers, getUserByEmail, updateUser, getUserBySteamId } from '@/lib/db';
import { compare, hash } from 'bcryptjs';
import { UserRole } from '@/lib/types';
import { saveUser } from '@/lib/storage';

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
          return null;
        }

        const user = await getUserByEmail(credentials.email);
        if (!user) {
          return null;
        }

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          return null;
        }

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
      clientSecret: process.env.STEAM_SECRET!,
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/callback/steam`,
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
            await updateUser({ ...existingUser, lastLogin: new Date().toISOString() });
            return true;
          }

          const newUser = {
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
            gamingUrls: {
              steam: '',
              discord: '',
              twitch: ''
            }
          };

          await createUser(newUser);
          return true;
        } catch (error) {
          console.error('Steam sign in error:', error);
          return false;
        }
      }

      if (account?.provider === 'credentials') {
        try {
          const userDb = await getUserByEmail(user.email);
          if (userDb) {
            await updateUser({ ...userDb, lastLogin: new Date().toISOString() });
            return true;
          }

          const newUser = {
            id: crypto.randomUUID(),
            name: user.name || 'User',
            email: user.email!,
            role: (user.email === 'matthewatoope@gmail.com' ? UserRole.ADMIN : UserRole.MEMBER),
            emailVerified: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            bio: '',
            gamingUrls: {
              steam: '',
              discord: '',
              twitch: ''
            }
          };

          await createUser(newUser);
          return true;
        } catch (error) {
          console.error('Credentials sign in error:', error);
          return false;
        }
      }

      if (account?.provider === 'steam' && user.email) {
        const existingUser = await getUserByEmail(user.email);
        if (!existingUser) {
          // Create new user
          const newUser = {
            id: user.id,
            email: user.email,
            name: user.name || 'Anonymous',
            role: UserRole.MEMBER,
            emailVerified: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await saveUser(newUser);
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