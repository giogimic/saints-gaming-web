import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import SteamProvider from "./auth/steam-provider";
import type { NextAuthOptions } from "next-auth";
import { UserRole } from "@/lib/permissions";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    SteamProvider(),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role as UserRole;
      }
      return session;
    },
    async signIn({ account, profile }) {
      if (account?.provider === "steam") {
        // Here you can add any additional validation or user creation logic
        return true;
      }
      return true;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
};
