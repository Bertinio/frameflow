import Link from "next/link";
import { saveConfigurationAsQuoteDraft } from "./actions";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default function CalculatorAddPage({ searchParams }: Props) {
  const width = String(searchParams.width ?? "");
  const height = String(searchParams.height ?? "");
  const type = String(searchParams.type ?? "");
  const color = String(searchParams.color ?? "");
  const glass = String(searchParams.glass ?? "");
  const options = searchParams.options
    ? Array.isArray(searchParams.options)
      ? searchParams.options
      : [String(searchParams.options)]
    : [];
  const optionsLabel = options.length > 0 ? options.join(", ") : "Geen extra opties";
  const unitPrice = String(searchParams.unitPrice ?? "0");
  const totalPrice = String(searchParams.totalPrice ?? "0");
  const quoteId = String(searchParams.quoteId ?? "");

  if (!width || !height || !type) {
    return (
      <div className="min-h-screen bg-[#030712] text-white px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-10 shadow-lg shadow-black/20">
          <h1 className="text-3xl font-semibold text-white">Raam configuratie ontbreekt</h1>
          <p className="mt-4 text-slate-300">
            Er ontbreken één of meerdere configuratieparameters. Ga terug naar de calculator om het raam opnieuw te configureren.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/installer/calculator/type"
              className="rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-black transition hover:bg-sky-400 text-center"
            >
              Nog een raam configureren
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 shadow-lg shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Raamcalculator</p>
          <h1 className="mt-4 text-5xl font-semibold text-white">Raam toevoegen aan offerte</h1>
          <p className="mt-4 max-w-3xl text-slate-400">
            Controleer de configuratie van je raam en voeg het toe aan de huidige offerte.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
            <h2 className="text-2xl font-semibold text-white">Raam overzicht</h2>
            <div className="mt-6 space-y-4 text-sm text-slate-300">
              <DetailRow label="Type" value={type} />
              <DetailRow label="Breedte" value={`${width} mm`} />
              <DetailRow label="Hoogte" value={`${height} mm`} />
              <DetailRow label="Kleur" value={color || "Standaard"} />
              <DetailRow label="Glas" value={glass || "Standaard"} />
              <DetailRow label="Opties" value={optionsLabel} />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
            <h2 className="text-2xl font-semibold text-white">Prijs overzicht</h2>
            <div className="mt-6 space-y-4 text-sm text-slate-300">
              <DetailRow label="Prijs per stuk" value={`€${Number(unitPrice).toFixed(2)}`} />
              <DetailRow label="Totale prijs" value={`€${Number(totalPrice).toFixed(2)}`} />
              <DetailRow label="Offerte" value={quoteId ? quoteId : "Nieuwe offerte"} />
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <form action={saveConfigurationAsQuoteDraft} className="grid gap-3">
            <input type="hidden" name="quoteId" value={quoteId} />
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="width" value={width} />
            <input type="hidden" name="height" value={height} />
            <input type="hidden" name="color" value={color} />
            <input type="hidden" name="glass" value={glass} />
            <input type="hidden" name="options" value={JSON.stringify(options)} />
            <input type="hidden" name="unitPrice" value={unitPrice} />
            <input type="hidden" name="totalPrice" value={totalPrice} />

            <button
              type="submit"
              className="rounded-3xl bg-sky-500 px-6 py-4 text-base font-semibold text-black transition hover:bg-sky-400"
            >
              Opslaan als offerteDraft
            </button>
          </form>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/installer/calculator/type"
              className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-base font-semibold text-white transition hover:bg-white/10 text-center"
            >
              Nog een raam configureren
            </Link>
            <Link
              href="/installer/quotes/current"
              className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-base font-semibold text-white transition hover:bg-white/10 text-center"
            >
              Offerte bekijken
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}
