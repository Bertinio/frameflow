import { createQuoteFromDraft, getDraft } from "../actions";
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

export default async function SummaryStepPage({ params }: Props) {
  const { draftId } = await params;

  if (!draftId) {
    redirect("/installer/calculator");
  }

  const draft = await getDraft(draftId);
  const extras = parseExtras(draft.extras);
  const glass = draft.glass ?? "double";

  const totalPrice =
    draft.width * draft.height * 0.001 +
    (glass === "triple" ? 250 : 150) +
    (extras.ventilation ? 50 : 0) +
    (extras.safety ? 75 : 0);

  const createQuoteAction = createQuoteFromDraft.bind(null, draft.id);

  return (
    <div className="min-h-screen bg-[#030712] px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Stap 4</p>
          <h1 className="mt-4 text-4xl font-semibold">Samenvatting</h1>
          <p className="mt-2 text-slate-400">Controleer alle configuratievelden en maak de offerte aan.</p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
          <div className="grid gap-3 md:grid-cols-2">
            <InfoRow label="Draft" value={draft.id} />
            <InfoRow label="Type" value={draft.type} />
            <InfoRow label="Breedte" value={String(draft.width)} />
            <InfoRow label="Hoogte" value={String(draft.height)} />
            <InfoRow label="Kleur" value={draft.color} />
            <InfoRow label="Glas" value={glass} />
            <InfoRow label="Extras" value={`ventilation: ${extras.ventilation ? "ja" : "nee"}, safety: ${extras.safety ? "ja" : "nee"}`} />
            <InfoRow label="Totaalprijs" value={`€${totalPrice.toFixed(2)}`} />
          </div>
        </section>

        <form action={createQuoteAction} className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
          <button type="submit" className="rounded-2xl bg-sky-500 px-6 py-3 font-semibold text-black transition hover:bg-sky-400">
            Maak offerte van draft
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
      <p className="mt-2 text-sm font-semibold text-white break-all">{value}</p>
    </div>
  );
}
