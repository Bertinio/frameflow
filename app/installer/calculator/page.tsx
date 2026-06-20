import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteDraftAction } from "./overview-actions";

function getResumePath(draft: { id: string; glass: string | null; extras: string | null }) {
  if (!draft.glass) {
    return `/installer/calculator/glass/${draft.id}`;
  }

  if (!draft.extras) {
    return `/installer/calculator/extras/${draft.id}`;
  }

  return `/installer/calculator/summary/${draft.id}`;
}

export default async function InstallerCalculatorPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    redirect("/installateur/login");
  }

  const installerId = String(session.user.id ?? "").trim();

  const drafts = await prisma.configDraft.findMany({
    where: {
      installerId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-[#030712] text-white px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-10">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-10 shadow-lg shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Raamcalculator</p>
          <h1 className="mt-4 text-5xl font-semibold text-white">Mijn configuratie drafts</h1>
          <p className="mt-4 max-w-3xl text-slate-400">
            Start een nieuwe configuratie of ga verder met een bestaande draft.
          </p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-sky-300">Actie</p>
              <h2 className="mt-2 text-2xl font-semibold">Nieuwe configuratie</h2>
            </div>
            <Link
              href="/installer/calculator/start"
              className="rounded-2xl bg-sky-500 px-6 py-3 font-semibold text-black transition hover:bg-sky-400"
            >
              Start nieuwe draft
            </Link>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
          <h2 className="text-2xl font-semibold">Bestaande drafts</h2>

          {drafts.length === 0 ? (
            <p className="mt-4 text-slate-300">Je hebt nog geen configuratie drafts.</p>
          ) : (
            <div className="mt-5 space-y-4">
              {drafts.map((draft) => {
                const resumePath = getResumePath(draft);
                const deleteAction = deleteDraftAction.bind(null, draft.id);

                return (
                  <div key={draft.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                    <div className="grid gap-3 md:grid-cols-2">
                      <p className="text-sm text-slate-300">Draft: {draft.id}</p>
                      <p className="text-sm text-slate-300">Aangemaakt: {new Date(draft.createdAt).toLocaleString("nl-NL")}</p>
                      <p className="text-sm text-slate-300">Type: {draft.type}</p>
                      <p className="text-sm text-slate-300">Maat: {draft.width} x {draft.height}</p>
                      <p className="text-sm text-slate-300">Kleur: {draft.color}</p>
                      <p className="text-sm text-slate-300">Glas: {draft.glass ?? "niet gekozen"}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        href={resumePath}
                        className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-sky-400"
                      >
                        Verder met draft
                      </Link>
                      <form action={deleteAction}>
                        <button
                          type="submit"
                          className="rounded-xl border border-red-300/40 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
                        >
                          Verwijderen
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
