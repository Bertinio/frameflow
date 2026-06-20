import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function RedirectPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return redirect("/login");
  }

  const role = session.user.role;

  if (role === "admin") return redirect("/admin/dashboard");
  if (role === "installer") return redirect("/installateur/dashboard");
  if (role === "importer") return redirect("/importer/dashboard");
  if (role === "manufacturer") return redirect("/manufacturer/dashboard");

  return redirect("/login");
}
