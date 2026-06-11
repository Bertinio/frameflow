import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function InstallerPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return redirect("/login");
  }

  if (session.user.role !== "installer") {
    return redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-sky-300">Installer portal</p>
          <h1 className="text-4xl font-semibold sm:text-5xl">Welkom bij FrameFlow</h1>
          <p className="mx-auto max-w-2xl text-slate-300 sm:text-lg">
            Kies een route om verder te gaan: beheer offertes en orders of start de raamconfigurator.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Link
            href="/installer/dashboard"
            className="group flex h-72 flex-col justify-between rounded-3xl border border-slate-700 bg-slate-900/90 p-8 transition duration-300 hover:-translate-y-1 hover:border-sky-400 hover:bg-slate-900"
          >
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300">Installer Dashboard</p>
              <h2 className="mt-5 text-3xl font-semibold">Offertes & orders</h2>
              <p className="mt-4 text-slate-400">
                Bekijk je lopende offertes, open orders en beheer het volledige installatieproces.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-sky-300 group-hover:text-sky-200">
              Ga naar dashboard →
            </span>
          </Link>

          <Link
            href="/installer/calculator"
            className="group flex h-72 flex-col justify-between rounded-3xl border border-slate-700 bg-slate-900/90 p-8 transition duration-300 hover:-translate-y-1 hover:border-sky-400 hover:bg-slate-900"
          >
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300">Calculator</p>
              <h2 className="mt-5 text-3xl font-semibold">Raamconfigurator</h2>
              <p className="mt-4 text-slate-400">
                Stel complete ramen samen, bereken prijzen en genereer offertes voor klanten.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-sky-300 group-hover:text-sky-200">
              Naar de calculator →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
