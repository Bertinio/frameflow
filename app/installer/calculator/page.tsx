import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function InstallerCalculatorPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-10">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-10 shadow-lg shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Raamcalculator</p>
          <h1 className="mt-4 text-5xl font-semibold text-white">Raamcalculator</h1>
          <p className="mt-4 max-w-3xl text-slate-400">
            Start een nieuwe configuratie of bekijk eerdere configuraties.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <Link
            href="/installer/calculator/type"
            className="group rounded-3xl border border-white/10 bg-white/5 p-10 text-left shadow-sm shadow-black/10 transition hover:border-sky-400 hover:bg-white/10"
          >
            <p className="text-sm uppercase tracking-[0.24em] text-sky-300">Nieuw</p>
            <h2 className="mt-5 text-3xl font-semibold text-white">Nieuw raam configureren</h2>
            <p className="mt-4 text-slate-300">
              Begin een nieuwe raamconfiguratie en bepaal alle specificaties voor jouw klant.
            </p>
          </Link>

          <Link
            href="/installer/calculator/history"
            className="group rounded-3xl border border-white/10 bg-white/5 p-10 text-left shadow-sm shadow-black/10 transition hover:border-sky-400 hover:bg-white/10"
          >
            <p className="text-sm uppercase tracking-[0.24em] text-sky-300">Historie</p>
            <h2 className="mt-5 text-3xl font-semibold text-white">Mijn configuraties</h2>
            <p className="mt-4 text-slate-300">
              Bekijk eerder gemaakte configuraties en ga verder waar je gebleven bent.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
