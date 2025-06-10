import { NextAuthOptions } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import SteamProvider from "next-auth-steam";
import { users, accounts, sessions, verificationTokens } from "@/lib/db/schema";

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    SteamProvider({
      clientSecret: process.env.STEAM_API_KEY!,
      clientId: process.env.STEAM_CLIENT_ID!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
  },
}; 