import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).toLowerCase();
        let user;
        try {
          user = await prisma.user.findUnique({
            where: { email },
          });
        } catch {
          console.error("[auth] Database unavailable during login");
          return null;
        }
        if (!user?.password) return null;
        const valid = await bcrypt.compare(
          String(credentials.password),
          user.password,
        );
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const uid = user?.id ?? token.sub;
      if (uid) {
        token.sub = uid;
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: uid },
            include: {
              roles: { include: { role: true } },
            },
          });
          token.roles = dbUser?.roles.map((r) => r.role.key) ?? [];
        } catch {
          token.roles = [];
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.roles = (token.roles as string[] | undefined) ?? [];
      }
      return session;
    },
  },
  trustHost: true,
});
