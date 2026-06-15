import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function InstallerDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) redirect("/login");
  if (session.user.role !== "installer") redirect("/login");

  const installerId = session.user.id as string;

  // Prisma queries
  const totalOrders = await prisma.order.count({
    where: { installerId },
  });

  const totalQuotes = 0;

  const recentOrders = await prisma.order.findMany({
    where: { installerId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Installer Dashboard</p>
          <h1 className="mt-4 text-5xl font-semibold text-white">Installer Dashboard</h1>
          <p className="mt-3 text-slate-400">
            Welkom terug, {session.user.email}
          </p>
          <p className="mt-2 max-w-3xl text-slate-400">
            Overzicht van jouw recente orders en activiteiten.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-4">
          <Card title="Totaal Orders" value={totalOrders} />
          <Card title="Totaal Offertes" value={totalQuotes} />
          <Card
            title="Recente Orders"
            value={recentOrders.length > 0 ? recentOrders.length : 0}
          />
          <Card title="Dashboard" value="Live" />
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Recente Orders</h2>
              <p className="mt-2 text-slate-400">
                Bekijk de vijf meest recente orders van jouw account.
              </p>
            </div>
            <Link
              href="/installer/dashboard"
              className="inline-flex items-center rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Alles bekijken
            </Link>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60">
            <table className="min-w-full border-separate border-spacing-0 text-left">
              <thead className="bg-white/5 text-slate-400">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Datum</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actie</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                      Nog geen orders gevonden.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-t border-white/5 transition hover:bg-white/5"
                    >
                      <td className="px-6 py-5 text-sm text-white">{order.id}</td>
                      <td className="px-6 py-5 text-sm text-slate-300">
                        {new Date(order.createdAt).toLocaleDateString("nl-NL")}
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-300">Ontvangen</td>
                      <td className="px-6 py-5 text-sm">
                        <Link
                          href={`/installer/order/${order.id}`}
                          className="text-sky-300 hover:text-sky-200"
                        >
                          Bekijken →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm shadow-black/10 transition hover:border-white/20 hover:bg-white/10">
      <p className="text-sm font-medium uppercase tracking-[0.12em] text-slate-400">{title}</p>
      <p className="mt-5 text-4xl font-semibold text-white">{value}</p>
    </div>
  );
}
