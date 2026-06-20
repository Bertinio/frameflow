import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { logout } from "@/app/installer/actions";
import InstallerLayoutClient from "@/components/installer/InstallerLayoutClient";

export default async function InstallerLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    redirect("/login");
  }

  const installerName = String(session.user.name ?? "Gebruiker");

  return (
    <InstallerLayoutClient installerName={installerName} logoutAction={logout}>
      {children}
    </InstallerLayoutClient>
  );
}
