import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { JWT } from "next-auth/jwt";
import {
  Session,
  NextAuthOptions,
  User,
  Account,
  Profile,
} from "next-auth";
import { AdapterUser } from "next-auth/adapters";

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
        } as any; // adapter-agnostic user object for session/jwt
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
      account,
      profile,
      trigger,
      isNewUser,
      session,
    }: {
      token: JWT & { id?: string; email?: string | null; role?: string };
      user?: User | AdapterUser | null;
      account?: Account | null;
      profile?: Profile | undefined;
      trigger?: "signIn" | "signUp" | "update";
      isNewUser?: boolean;
      session?: any;
    }): Promise<JWT> {
      if (user) {
        token.id = (user as any).id ?? token.id;
        token.email = (user as any).email ?? token.email ?? null;
        token.role = (user as any).role ?? token.role;
      }
      return token;
    },

    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT & { id?: string; email?: string | null; role?: string };
    }): Promise<Session> {
      const typedSession = session as Session & {
        user: { id: string; email?: string | null; role?: string };
      };

      typedSession.user = typedSession.user || ({} as any);
      typedSession.user.id = token.id ?? typedSession.user.id ?? "";
      typedSession.user.email = token.email ?? typedSession.user.email ?? null;
      typedSession.user.role = token.role ?? typedSession.user.role ?? "";

      return typedSession;
    },
  },

  session: {
    strategy: "jwt",
  },
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
