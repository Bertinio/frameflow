import { getDraft, updateDraft } from "../actions";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    draftId: string;
  }>;
};

function parseExtras(extras: string | null) {
  if (!extras) {
    return { ventilation: false, safety: false };
  }

  try {
    const parsed = JSON.parse(extras);
    return {
      ventilation: Boolean(parsed?.ventilation),
      safety: Boolean(parsed?.safety),
    };
  } catch {
    return { ventilation: false, safety: false };
  }
}

export default async function ExtrasStepPage({ params }: Props) {
  const { draftId } = await params;

  if (!draftId) {
    redirect("/installer/calculator");
  }

  const draft = await getDraft(draftId);
  const extras = parseExtras(draft.extras);
  const saveExtrasAction = updateDraft.bind(null, draft.id);

  return (
    <div className="min-h-screen bg-[#030712] px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Stap 3</p>
          <h1 className="mt-4 text-4xl font-semibold">Extras kiezen</h1>
          <p className="mt-2 text-slate-400">Kies extra opties voor draft {draft.id.slice(0, 8)}.</p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
          <h2 className="text-xl font-semibold">Huidige configuratie</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <InfoRow label="Type" value={draft.type} />
            <InfoRow label="Glas" value={draft.glass ?? "double"} />
            <InfoRow label="Breedte" value={String(draft.width)} />
            <InfoRow label="Hoogte" value={String(draft.height)} />
          </div>
        </section>

        <form action={saveExtrasAction} className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
          <input type="hidden" name="step" value="extras" />
          <input type="hidden" name="nextPath" value={`/installer/calculator/summary/${draft.id}`} />

          <div className="space-y-3">
            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3">
              <input type="checkbox" name="ventilation" defaultChecked={extras.ventilation} className="h-4 w-4" />
              <span className="text-sm text-white">ventilation</span>
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3">
              <input type="checkbox" name="safety" defaultChecked={extras.safety} className="h-4 w-4" />
              <span className="text-sm text-white">safety</span>
            </label>
          </div>

          <button type="submit" className="mt-6 rounded-2xl bg-sky-500 px-6 py-3 font-semibold text-black transition hover:bg-sky-400">
            Ga naar samenvatting
          </button>
        </form>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
