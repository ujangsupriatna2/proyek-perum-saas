import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const admin = await db.admin.findUnique({
          where: { email: credentials.email },
          include: { mitra: { select: { id: true, name: true, slug: true } } },
        });

        if (!admin) {
          return null;
        }

        const isValid = await compare(credentials.password, admin.password);

        if (!isValid) {
          return null;
        }

        return {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          mitraId: admin.mitraId,
          mitraName: admin.mitra?.name ?? null,
          mitraSlug: admin.mitra?.slug ?? null,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.mitraId = (user as { mitraId?: string }).mitraId ?? null;
        token.mitraName = (user as { mitraName?: string | null }).mitraName ?? null;
        token.mitraSlug = (user as { mitraSlug?: string | null }).mitraSlug ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { mitraId?: string | null }).mitraId = token.mitraId as string | null;
        (session.user as { mitraName?: string | null }).mitraName = token.mitraName as string | null;
        (session.user as { mitraSlug?: string | null }).mitraSlug = token.mitraSlug as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
