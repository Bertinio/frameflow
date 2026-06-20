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

const ALLOWED_ROLES = ["installer", "importer", "admin", "manufacturer"] as const;

function isAllowedRole(role: string): role is (typeof ALLOWED_ROLES)[number] {
  return ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number]);
}

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

        if (!isAllowedRole(user.role)) {
          return null;
        }

        let manufacturerId: string | null = null;

        if (user.role === "manufacturer") {
          const manufacturer = await prisma.manufacturer.upsert({
            where: { userId: user.id },
            update: {},
            create: {
              userId: user.id,
              name: user.name?.trim() || user.email.split("@")[0] || "Fabrikant",
            },
            select: { id: true },
          });

          manufacturerId = manufacturer.id;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? null,
          role: user.role,
          manufacturerId,
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
      token: JWT & {
        id?: string;
        email?: string | null;
        role?: string;
        manufacturerId?: string | null;
      };
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
        token.name = (user as any).name ?? token.name ?? null;
        token.role = (user as any).role ?? token.role;
        token.manufacturerId = (user as any).manufacturerId ?? token.manufacturerId ?? null;
      }
      return token;
    },

    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT & {
        id?: string;
        email?: string | null;
        role?: string;
        manufacturerId?: string | null;
      };
    }): Promise<Session> {
      const typedSession = session as Session & {
        user: {
          id: string;
          email?: string | null;
          name?: string | null;
          role?: string;
          manufacturerId?: string | null;
        };
      };

      typedSession.user = typedSession.user || ({} as any);
      typedSession.user.id = token.id ?? typedSession.user.id ?? "";
      typedSession.user.email = token.email ?? typedSession.user.email ?? null;
      typedSession.user.name = token.name ?? typedSession.user.name ?? null;
      typedSession.user.role =
        token.role && isAllowedRole(token.role)
          ? token.role
          : typedSession.user.role ?? "";
      typedSession.user.manufacturerId = token.manufacturerId ?? typedSession.user.manufacturerId ?? null;

      return typedSession;
    },
  },

  session: {
    strategy: "jwt",
  },
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
