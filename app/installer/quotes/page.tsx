import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function InstallerQuotesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    redirect("/login");
  }

  const installerId = session.user.id as string;

  const quotes = await prisma.quote.findMany({
    where: { installerId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#030712] text-white px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Offertes</p>
          <h1 className="mt-3 text-5xl font-semibold text-white">Offertes</h1>
          <p className="mt-4 max-w-3xl text-slate-400">
            Bekijk je recente offertes en open de details voor meer informatie.
          </p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Jouw offertes</h2>
              <p className="mt-2 text-slate-400">
                Alle offertes gesorteerd op nieuwste eerst.
              </p>
            </div>
            <Link
              href="/installer/dashboard"
              className="inline-flex items-center rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Terug naar dashboard
            </Link>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70">
            <table className="min-w-full border-separate border-spacing-0 text-left">
              <thead className="bg-white/5 text-slate-400">
                <tr>
                  <th className="px-6 py-4">Quote ID</th>
                  <th className="px-6 py-4">Datum</th>
                  <th className="px-6 py-4">Klantnaam</th>
                  <th className="px-6 py-4">Totaalprijs</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actie</th>
                </tr>
              </thead>
              <tbody>
                {quotes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      Geen offertes gevonden.
                    </td>
                  </tr>
                ) : (
                  quotes.map((quote) => (
                    <tr key={quote.id} className="border-t border-white/5 hover:bg-white/5">
                      <td className="px-6 py-5 text-sm text-white">{quote.id}</td>
                      <td className="px-6 py-5 text-sm text-slate-300">
                        {new Intl.DateTimeFormat("nl-NL", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }).format(quote.createdAt)}
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-300">-</td>
                      <td className="px-6 py-5 text-sm text-slate-300">€{quote.totalPrice.toFixed(2)}</td>
                      <td className="px-6 py-5 text-sm text-slate-300">{quote.status}</td>
                      <td className="px-6 py-5 text-sm">
                        <Link
                          href={`/installer/quotes/${quote.id}`}
                          className="text-sky-300 hover:text-sky-200"
                        >
                          Bekijk →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
