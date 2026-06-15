import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

type Props = {
  params: {
    id: string;
  };
};

export default async function QuoteDetailsPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    redirect("/login");
  }

  const quoteId = params.id;

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { items: true },
  });

  if (!quote) {
    return (
      <div className="min-h-screen bg-[#030712] text-white px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-10 shadow-lg shadow-black/20">
          <h1 className="text-3xl font-semibold text-white">Offerte niet gevonden</h1>
          <p className="mt-4 text-slate-300">
            De opgevraagde offerte bestaat niet of is niet beschikbaar.
          </p>
          <Link
            href="/installer/quotes"
            className="mt-8 inline-flex rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Terug naar offertes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Offerte Details</p>
              <h1 className="mt-3 text-4xl font-semibold text-white">Offerte #{quote.id}</h1>
              <p className="mt-2 text-slate-400">Details van deze offerte en de bijbehorende items.</p>
            </div>
            <Link
              href="/installer/quotes"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Terug naar offertes
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <InfoCard label="Status" value={quote.status} />
          <InfoCard label="Datum" value={new Intl.DateTimeFormat("nl-NL", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }).format(quote.createdAt)} />
          <InfoCard label="Totaalprijs" value={`€${quote.totalPrice?.toString() ?? "0"}`} />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Offerte items</h2>
              <p className="mt-2 text-slate-400">Bekijk de afmetingen, opties en prijzen per item.</p>
            </div>
            <span className="rounded-full bg-slate-900/70 px-4 py-2 text-sm text-slate-300">
              {quote.items?.length ?? 0} items
            </span>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
            <table className="min-w-full border-separate border-spacing-0 text-left">
              <thead className="bg-white/5 text-slate-400">
                <tr>
                  <th className="px-6 py-4">Afmetingen</th>
                  <th className="px-6 py-4">Aantal</th>
                  <th className="px-6 py-4">Opties</th>
                  <th className="px-6 py-4">Prijs</th>
                </tr>
              </thead>
              <tbody>
                {quote.items?.length ? (
                  quote.items.map((item) => (
                    <tr key={item.id} className="border-t border-white/5 hover:bg-white/5">
                      <td className="px-6 py-5 text-sm text-white">
                        {item.width}x{item.height} mm
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-300">1</td>
                      <td className="px-6 py-5 text-sm text-slate-300">
                        {item.color || "-"} / {item.glass || "-"}
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-300">€{item.totalPrice?.toString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
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
