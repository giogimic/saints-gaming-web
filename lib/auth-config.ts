import { NextAuthOptions, User, Session } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import prisma from "./prisma";
import { UserRole } from "./permissions";
import { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any, // Type assertion needed due to version mismatch
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email || "",
          name: user.name || "",
          role: user.role as UserRole,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: User | null }): Promise<JWT> {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      if (token) {
        session.user = {
          id: token.id,
          role: token.role as UserRole,
          email: token.email,
          name: token.name,
        };
      }
      return session;
    },
  },
  events: {
    async signIn({ user }: { user: User }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });
    },
  },
}; 