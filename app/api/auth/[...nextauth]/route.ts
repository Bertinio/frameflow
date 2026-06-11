import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { JWT } from "next-auth/jwt";
import { Session, NextAuthOptions } from "next-auth";
import { User } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials?: Record<string, string> | undefined) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: JWT & { id?: string; email?: string; role?: string };
      user?: User | null;
    }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },

    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT & { id?: string; email?: string; role?: string };
    }) {
      const typedSession = session as Session & {
        user: { id: string; email?: string | null; role?: string };
      };

      typedSession.user = {
        id: token.id ?? "",
        email: token.email ?? null,
        role: token.role ?? "",
      };

      return typedSession;
    },
  },

  session: {
    strategy: "jwt",
  },
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
