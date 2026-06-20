import { redirect } from "next/navigation";

export default function InstallateurDashboardAliasPage() {
  // Keep /installateur as Dutch alias while reusing the existing installer dashboard.
  redirect("/installer/dashboard");
}
