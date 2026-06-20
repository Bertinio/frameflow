import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { updateInstallerSettingsAction } from "./actions";

export default async function InstallerSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    redirect("/installateur/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      margin: true,
    },
  });

  if (!user) {
    redirect("/installateur/login");
  }

  return (
    <div className="min-h-screen bg-[#030712] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Instellingen</p>
          <h1 className="mt-3 text-4xl font-semibold">InstallerSettings</h1>
          <p className="mt-2 text-slate-400">Pas je naam, e-mail en marge aan.</p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
          <form action={updateInstallerSettingsAction} className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm text-slate-300">Naam</span>
                <input
                  name="name"
                  defaultValue={user.name ?? ""}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white placeholder:text-slate-500"
                  placeholder="Voor- en achternaam"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm text-slate-300">E-mail</span>
                <input
                  name="email"
                  type="email"
                  defaultValue={user.email}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white placeholder:text-slate-500"
                  placeholder="naam@voorbeeld.nl"
                  required
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm text-slate-300">Marge (%)</span>
              <input
                name="margin"
                type="number"
                step="0.01"
                min="0"
                max="1"
                defaultValue={Number(user.margin ?? 0)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white placeholder:text-slate-500"
                placeholder="0.15"
                required
              />
              <p className="mt-2 text-sm text-slate-400">
                Vul een decimale waarde in tussen 0 en 1. Bijvoorbeeld 0.15 voor 15%.
              </p>
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                className="rounded-2xl bg-sky-500 px-6 py-3 font-semibold text-black transition hover:bg-sky-400"
              >
                Instellingen opslaan
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
