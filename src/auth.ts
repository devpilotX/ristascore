/**
 * Auth.js v5 configuration.
 *
 * Credentials provider, bcrypt password check, JWT session stored in an
 * httpOnly secure cookie. Roles are carried on the token and session so the
 * API and pages can do role based checks.
 */

import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { loginSchema } from "@/lib/schemas";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
  interface User {
    role?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: env.nextAuthSecret,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  cookies: {
    sessionToken: {
      name: env.cookieSecure ? "__Secure-rishtascore.session" : "rishtascore.session",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: env.cookieSecure,
      },
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await db.user.findUnique({ where: { email: parsed.data.email } });
        if (!user || !user.is_active) return null;

        const ok = await bcrypt.compare(parsed.data.password, user.hashed_password);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.full_name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? "";
        session.user.role = (token.role as string) ?? "subject";
      }
      return session;
    },
  },
});
