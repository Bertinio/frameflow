import Link from "next/link";
import { exportQuoteToPdfAndSave } from "@/app/installer/quotes/actions";

type QuoteItemView = {
  id: string;
  type: string;
  width: number;
  height: number;
  color: string;
  glass: string;
  options: string;
  totalPrice: unknown;
};

type QuoteView = {
  id: string;
  status: string;
  createdAt: Date;
  totalPrice: unknown;
  pdfFileName: string | null;
  pdfCreatedAt: Date | null;
  items: QuoteItemView[];
};

function formatCurrency(value: unknown) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function formatDate(value: Date | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("nl-NL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(value);
}

export default function OfferteDetail({ quote }: { quote: QuoteView }) {
  const generatePdfAction = exportQuoteToPdfAndSave.bind(null, quote.id);

  return (
    <div className="min-h-screen bg-[#030712] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Offerte details</p>
              <h1 className="mt-3 text-4xl font-semibold">Offerte #{quote.id}</h1>
              <p className="mt-2 text-slate-400">Bekijk alle items en download de PDF van deze offerte.</p>
            </div>
            <Link
              href="/installer/quotes"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Terug naar offertes
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <InfoCard label="Status" value={quote.status} />
          <InfoCard label="Datum" value={formatDate(quote.createdAt)} />
          <InfoCard label="Items" value={String(quote.items.length)} />
          <InfoCard label="Totaal" value={formatCurrency(quote.totalPrice)} />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">PDF</h2>
              <p className="mt-1 text-slate-400">
                {quote.pdfFileName
                  ? `Beschikbaar: ${quote.pdfFileName} (${formatDate(quote.pdfCreatedAt)})`
                  : "Nog geen PDF beschikbaar. Genereer een nieuwe PDF op basis van de actuele offerte."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <form action={generatePdfAction}>
                <button
                  type="submit"
                  className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-sky-400"
                >
                  PDF genereren
                </button>
              </form>

              {quote.pdfFileName ? (
                <a
                  href={`/api/quotes/${quote.id}/pdf`}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  PDF downloaden
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Offerte items</h2>
              <p className="mt-2 text-slate-400">Afmetingen, opties en prijs per item.</p>
            </div>
            <span className="rounded-full bg-slate-900/70 px-4 py-2 text-sm text-slate-300">
              {quote.items.length} items
            </span>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
            <table className="min-w-full border-separate border-spacing-0 text-left">
              <thead className="bg-white/5 text-slate-400">
                <tr>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Afmetingen</th>
                  <th className="px-6 py-4">Kleur/Glas</th>
                  <th className="px-6 py-4">Opties</th>
                  <th className="px-6 py-4">Prijs</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.length ? (
                  quote.items.map((item) => (
                    <tr key={item.id} className="border-t border-white/5 hover:bg-white/5">
                      <td className="px-6 py-5 text-sm text-white">{item.type}</td>
                      <td className="px-6 py-5 text-sm text-slate-300">{item.width} x {item.height} mm</td>
                      <td className="px-6 py-5 text-sm text-slate-300">{item.color || "-"} / {item.glass || "-"}</td>
                      <td className="px-6 py-5 text-sm text-slate-300">{item.options || "-"}</td>
                      <td className="px-6 py-5 text-sm text-slate-300">{formatCurrency(item.totalPrice)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      Geen offerte items gevonden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
      <p className="text-sm uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-3 text-base font-semibold text-white">{value}</p>
    </div>
  );
}
