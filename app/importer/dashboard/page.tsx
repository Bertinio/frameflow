import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function ImporterDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return redirect("/login");
  }

  if (session.user.role !== "importer") {
    return redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#030712] px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/20">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Importer dashboard</p>
        <h1 className="mt-3 text-4xl font-semibold">Welkom terug</h1>
        <p className="mt-3 text-slate-300">
          Je bent ingelogd als importer ({session.user.email}).
        </p>
      </div>
    </div>
  );
}
