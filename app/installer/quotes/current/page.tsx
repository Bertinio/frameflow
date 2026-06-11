import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Actions from "./Actions";

type QuoteItem = {
  id: string;
  type: string;
  width: number;
  height: number;
  color: string;
  glass: string;
  options: unknown;
  unitPrice: string;
  totalPrice: string;
};

type Quote = {
  id: string;
  totalPrice: string;
  items: QuoteItem[];
};

export default async function CurrentQuotePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    redirect("/login");
  }

  const installerId = session.user.id as string;

  const quote = await prisma.quote.findFirst({
    where: { installerId, status: "DRAFT" },
    include: { items: true },
  });

  if (!quote) {
    return (
      <div className="min-h-screen bg-[#030712] text-white px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-10 shadow-lg shadow-black/20">
          <h1 className="text-3xl font-semibold text-white">Huidige Offerte</h1>
          <p className="mt-4 text-slate-300">
            Er is momenteel geen conceptofferte beschikbaar. Voeg een raam toe om te beginnen.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/installer/calculator/type"
              className="rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-black transition hover:bg-sky-400"
            >
              Nog een raam toevoegen
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Offerte</p>
          <h1 className="mt-3 text-5xl font-semibold text-white">Huidige Offerte</h1>
          <p className="mt-4 max-w-3xl text-slate-400">
            Bekijk alle ramen in je conceptofferte en controleer de totale prijs.
          </p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Raamoverzicht</h2>
              <p className="mt-2 text-slate-400">Alle ramen die zijn toegevoegd aan je huidige draft-offerte.</p>
            </div>
            <div>
              <Actions quoteId={quote.id} />
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60">
            <table className="min-w-full border-separate border-spacing-0 text-left">
              <thead className="bg-white/5 text-slate-400">
                <tr>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Breedte</th>
                  <th className="px-6 py-4">Hoogte</th>
                  <th className="px-6 py-4">Kleur</th>
                  <th className="px-6 py-4">Glas</th>
                  <th className="px-6 py-4">Prijs</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      Er staan nog geen ramen in deze offerte.
                    </td>
                  </tr>
                ) : (
                  quote.items.map((item) => (
                    <tr key={item.id} className="border-t border-white/5 hover:bg-white/5">
                      <td className="px-6 py-5 text-sm text-white">{item.type}</td>
                      <td className="px-6 py-5 text-sm text-slate-300">{item.width} mm</td>
                      <td className="px-6 py-5 text-sm text-slate-300">{item.height} mm</td>
                      <td className="px-6 py-5 text-sm text-slate-300">{item.color}</td>
                      <td className="px-6 py-5 text-sm text-slate-300">{item.glass}</td>
                      <td className="px-6 py-5 text-sm font-semibold text-white">€{Number(item.totalPrice).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Totaal</p>
              <p className="mt-2 text-3xl font-semibold text-white">€{quote.totalPrice.toString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
