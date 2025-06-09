import NextAuth from 'next-auth';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import SteamProvider from '@/lib/auth/steam-provider';
import { saveUser, getUsers } from '@/lib/storage';
import { compare, hash } from 'bcryptjs';
import { getUserByEmail } from '@/lib/storage';
import { UserRole } from '@/lib/types';

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
        if (!user) {
          throw new Error('No user found with this email');
        }

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
    SteamProvider({
      clientId: process.env.STEAM_CLIENT_ID || '',
      clientSecret: process.env.STEAM_API_KEY || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'steam') {
        try {
          // Get Steam ID from profile
          const steamId = profile?.steamid;
          if (!steamId) return false;

          // Check if user exists
          const users = await getUsers();
          const existingUser = users.find(u => u.steamId === steamId);

          if (existingUser) {
            // Update last login
            await saveUser({
              ...existingUser,
              lastLogin: new Date().toISOString()
            });
            return true;
          }

          // Create new user
          const newUser = {
            id: crypto.randomUUID(),
            name: profile?.personaname || 'Steam User',
            email: `${steamId}@steam.local`,
            steamId,
            role: 'member' as UserRole,
            emailVerified: true,
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

          await saveUser(newUser);
          return true;
        } catch (error) {
          console.error('Steam sign in error:', error);
          return false;
        }
      }

      // Handle credentials provider
      if (account?.provider === 'credentials') {
        try {
          const users = await getUsers();
          const existingUser = users.find(u => u.email === user.email);

          if (existingUser) {
            // Update last login
            await saveUser({
              ...existingUser,
              lastLogin: new Date().toISOString()
            });
            return true;
          }

          // Create new user
          const newUser = {
            id: crypto.randomUUID(),
            name: user.name || 'User',
            email: user.email!,
            role: (user.email === 'matthewatoope@gmail.com' ? 'admin' : 'member') as UserRole,
            emailVerified: true,
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

          await saveUser(newUser);
          return true;
        } catch (error) {
          console.error('Credentials sign in error:', error);
          return false;
        }
      }

      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        const users = await getUsers();
        const user = users.find(u => u.email === session.user.email);
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
        token.steamId = profile.steamid;
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