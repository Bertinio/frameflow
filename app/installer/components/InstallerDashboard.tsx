import Link from "next/link";
import { prisma } from "@/lib/prisma";
import OfferCard from "@/app/installer/components/OfferCard";
import OrderCard from "@/app/installer/components/OrderCard";

type InstallerDashboardProps = {
  installerId: string;
  installerEmail: string;
};

type DashboardNotification = {
  id: string;
  message: string;
  createdAt: Date;
  href: string;
};

export default async function InstallerDashboard({
  installerId,
  installerEmail,
}: InstallerDashboardProps) {
  const [
    totalOrders,
    totalQuotes,
    recentOrders,
    recentQuotes,
  ] = await Promise.all([
    prisma.order.count({ where: { installerId } }),
    prisma.quote.count({ where: { installerId } }),
    prisma.order.findMany({
      where: { installerId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        totalPrice: true,
        createdAt: true,
      },
    }),
    prisma.quote.findMany({
      where: { installerId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        totalPrice: true,
        createdAt: true,
      },
    }),
  ]);

  const notifications: DashboardNotification[] = [
    ...recentOrders.map((order) => ({
      id: `order-${order.id}`,
      message: `Bestelling ${order.id.slice(0, 8)} status: ${order.status}`,
      createdAt: order.createdAt,
      href: `/installer/orders/${order.id}`,
    })),
    ...recentQuotes.map((quote) => ({
      id: `quote-${quote.id}`,
      message: `Offerte ${quote.id.slice(0, 8)} status: ${quote.status}`,
      createdAt: quote.createdAt,
      href: `/installer/quotes/${quote.id}`,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Installateur dashboard</p>
          <h1 className="mt-4 text-5xl font-semibold text-white">Dashboard</h1>
          <p className="mt-3 text-slate-400">Welkom terug, {installerEmail}</p>
          <p className="mt-2 max-w-3xl text-slate-400">
            Overzicht van recente offertes, bestellingen en notificaties.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <Card title="Totaal offertes" value={totalQuotes} />
          <Card title="Totaal bestellingen" value={totalOrders} />
          <Card title="Notificaties" value={notifications.length} />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">Recente offertes</h2>
                <p className="mt-2 text-slate-400">Laatste vijf offertes uit Prisma.</p>
              </div>
              <Link
                href="/installer/quotes"
                className="inline-flex items-center rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Alles bekijken
              </Link>
            </div>

            <ul className="space-y-3">
              {recentQuotes.length === 0 ? (
                <li className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-400">
                  Nog geen offertes gevonden.
                </li>
              ) : (
                recentQuotes.map((quote) => (
                  <OfferCard
                    key={quote.id}
                    title={`Offerte ${quote.id.slice(0, 8)}`}
                    status={quote.status}
                    price={Number(quote.totalPrice)}
                    date={quote.createdAt}
                  />
                ))
              )}
            </ul>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">Recente bestellingen</h2>
                <p className="mt-2 text-slate-400">Laatste vijf bestellingen uit Prisma.</p>
              </div>
              <Link
                href="/installer/orders"
                className="inline-flex items-center rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Alles bekijken
              </Link>
            </div>

            <ul className="space-y-3">
              {recentOrders.length === 0 ? (
                <li className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-400">
                  Nog geen bestellingen gevonden.
                </li>
              ) : (
                recentOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    orderNumber={order.id.slice(0, 8)}
                    status={order.status}
                    deliveryDate={order.createdAt}
                  />
                ))
              )}
            </ul>
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
          <h2 className="text-2xl font-semibold text-white">Notificaties</h2>
          <p className="mt-2 text-slate-400">Samengesteld op basis van recente offertes en bestellingen.</p>

          <ul className="mt-5 space-y-3">
            {notifications.length === 0 ? (
              <li className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-400">
                Geen notificaties beschikbaar.
              </li>
            ) : (
              notifications.map((notification) => (
                <li
                  key={notification.id}
                  className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-white">{notification.message}</p>
                      <p className="text-xs text-slate-400">
                        {notification.createdAt.toLocaleDateString("nl-NL")}
                      </p>
                    </div>
                    <Link href={notification.href} className="text-sm font-semibold text-sky-300 hover:text-sky-200">
                      Openen
                    </Link>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm shadow-black/10 transition hover:border-white/20 hover:bg-white/10">
      <p className="text-sm font-medium uppercase tracking-[0.12em] text-slate-400">{title}</p>
      <p className="mt-5 text-4xl font-semibold text-white">{value}</p>
    </div>
  );
}
