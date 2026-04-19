import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import Facebook from "next-auth/providers/facebook";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/env";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      hasOnboarded: boolean;
    } & DefaultSession["user"];
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          select: { id: true, email: true, name: true, image: true, hashedPassword: true },
        });
        if (!user?.hashedPassword) return null;
        const ok = await bcrypt.compare(password, user.hashedPassword);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
    ...(process.env.AUTH_GOOGLE_ID ? [Google] : []),
    ...(process.env.AUTH_APPLE_ID ? [Apple] : []),
    ...(process.env.AUTH_FACEBOOK_ID ? [Facebook] : []),
  ],
  callbacks: {
    async signIn({ user }) {
      if (user.email && isAdminEmail(user.email)) {
        await prisma.user
          .update({ where: { email: user.email }, data: { role: "ADMIN" } })
          .catch(() => {});
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
      }
      if (token.userId && !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.userId as string },
          select: { role: true, profile: { select: { id: true } } },
        });
        token.role = dbUser?.role ?? "USER";
        token.hasOnboarded = !!dbUser?.profile;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId && session.user) {
        session.user.id = token.userId as string;
        session.user.role = (token.role as Role) ?? "USER";
        session.user.hasOnboarded = Boolean(token.hasOnboarded);
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      await prisma.preference.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id },
      });
      await prisma.subscription.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id, tier: "FREE", status: "ACTIVE" },
      });
    },
  },
});

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== "ADMIN") {
    throw new Response("Forbidden", { status: 403 });
  }
  return session;
}
