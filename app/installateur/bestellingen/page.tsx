import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export default async function InstallateurBestellingenPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    redirect("/installateur/login");
  }

  const installerId = String(session.user.id ?? "");

  const orders = await prisma.order.findMany({
    where: { installerId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      totalPrice: true,
      createdAt: true,
    },
  });

  return (
    <div className="min-h-screen bg-[#030712] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Bestellingen</p>
          <h1 className="mt-3 text-4xl font-semibold">Alle bestellingen</h1>
          <p className="mt-2 text-slate-400">Overzicht van alle bestellingen met hun actuele status.</p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Orderlijst</h2>
            <span className="rounded-full bg-slate-900/70 px-4 py-2 text-sm text-slate-300">
              {orders.length} bestellingen
            </span>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60">
            <table className="min-w-full border-separate border-spacing-0 text-left">
              <thead className="bg-white/5 text-slate-400">
                <tr>
                  <th className="px-6 py-4">Ordernummer</th>
                  <th className="px-6 py-4">Datum</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Totaal</th>
                  <th className="px-6 py-4">Actie</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                      Er zijn nog geen bestellingen.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-t border-white/5 hover:bg-white/5">
                      <td className="px-6 py-5 text-sm text-white">{order.id}</td>
                      <td className="px-6 py-5 text-sm text-slate-300">
                        {new Intl.DateTimeFormat("nl-NL", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }).format(order.createdAt)}
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-300">{order.status}</td>
                      <td className="px-6 py-5 text-sm text-slate-300">
                        €{Number(order.totalPrice ?? 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-5 text-sm">
                        <Link
                          href={`/installer/orders/${order.id}`}
                          className="font-semibold text-sky-300 transition hover:text-sky-200"
                        >
                          Bekijk
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
