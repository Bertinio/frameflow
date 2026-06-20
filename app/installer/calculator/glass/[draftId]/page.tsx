import { getDraft, updateDraft } from "../actions";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    draftId: string;
  }>;
};

const GLASS_OPTIONS = ["double", "triple"];

export default async function GlassStepPage({ params }: Props) {
  const { draftId } = await params;

  if (!draftId) {
    redirect("/installer/calculator");
  }

  const draft = await getDraft(draftId);
  const saveGlassAction = updateDraft.bind(null, draft.id);

  return (
    <div className="min-h-screen bg-[#030712] px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Stap 2</p>
          <h1 className="mt-4 text-4xl font-semibold">Glas kiezen</h1>
          <p className="mt-2 text-slate-400">Draft {draft.id.slice(0, 8)} geladen. Controleer stap 1 en kies glas.</p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
          <h2 className="text-xl font-semibold">Configuratie uit stap 1</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <InfoRow label="Type" value={draft.type} />
            <InfoRow label="Kleur" value={draft.color} />
            <InfoRow label="Breedte" value={String(draft.width)} />
            <InfoRow label="Hoogte" value={String(draft.height)} />
          </div>
        </section>

        <form action={saveGlassAction} className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
          <input type="hidden" name="step" value="glass" />
          <input type="hidden" name="nextPath" value={`/installer/calculator/extras/${draft.id}`} />

          <label className="block">
            <span className="text-sm text-slate-300">Glas</span>
            <select name="glass" defaultValue={draft.glass ?? "double"} className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white" required>
              {GLASS_OPTIONS.map((glass) => (
                <option key={glass} value={glass} className="bg-slate-900 text-white">
                  {glass}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="mt-6 rounded-2xl bg-sky-500 px-6 py-3 font-semibold text-black transition hover:bg-sky-400">
            Ga naar extras
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
