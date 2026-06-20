import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import InstallerDashboardView from "@/app/installer/components/InstallerDashboard";

export default async function InstallerDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) redirect("/login");
  if (session.user.role !== "installer") redirect("/login");

  return (
    <InstallerDashboardView
      installerId={session.user.id as string}
      installerEmail={session.user.email ?? ""}
    />
  );
}
