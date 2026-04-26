import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  accounts,
  businesses,
  sessions,
  users,
  verificationTokens,
} from "@/lib/db/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.AUTH_EMAIL_FROM,
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
  },
  session: { strategy: "database" },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        const [row] = await db
          .select({ businessId: users.businessId })
          .from(users)
          .where(eq(users.id, user.id))
          .limit(1);
        session.user.businessId = row?.businessId ?? null;
      }
      return session;
    },
  },
  events: {
    /**
     * Phase 1 onboarding: when a brand-new user is created by the adapter,
     * auto-provision a personal business and attach the user to it.
     * In Phase 2 this is where invite-acceptance / domain-matching would go.
     */
    async createUser({ user }) {
      if (!user.id || !user.email) return;
      const [biz] = await db
        .insert(businesses)
        .values({ name: user.email.split("@")[0] })
        .returning({ id: businesses.id });
      await db
        .update(users)
        .set({ businessId: biz.id })
        .where(eq(users.id, user.id));
    },
  },
});
