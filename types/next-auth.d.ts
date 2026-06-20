import NextAuth, { DefaultSession } from "next-auth";

type AppRole = "installer" | "importer" | "admin" | "manufacturer";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: AppRole;
      manufacturerId?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string | null;
    name?: string | null;
    role?: AppRole;
    manufacturerId?: string | null;
  }
}
