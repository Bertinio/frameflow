import Link from "next/link";
import { updateOrderStatusAction } from "@/app/installer/orders/actions";

type OrderItemView = {
  id: string;
  type: string;
  width: number;
  height: number;
  color: string;
  glass: string;
  options: string;
  quantity: number;
  profileType: string | null;
  unitPrice: unknown;
  totalPrice: unknown;
};

type OrderView = {
  id: string;
  status: string;
  createdAt: Date;
  totalPrice: unknown;
  installer: {
    email: string;
  } | null;
  items: OrderItemView[];
};

function formatCurrency(value: unknown) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("nl-NL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(value);
}

const STATUS_FLOW = ["in_behandeling", "geproduceerd", "geleverd"] as const;

export default function OrderDetail({ order }: { order: OrderView }) {
  const currentIndex = STATUS_FLOW.indexOf(order.status as (typeof STATUS_FLOW)[number]);
  const nextStatus = currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIndex + 1] : null;

  const nextStatusAction = nextStatus ? updateOrderStatusAction.bind(null, order.id, nextStatus) : null;
  const resetStatusAction = updateOrderStatusAction.bind(null, order.id, "in_behandeling");
  const producedAction = updateOrderStatusAction.bind(null, order.id, "geproduceerd");
  const deliveredAction = updateOrderStatusAction.bind(null, order.id, "geleverd");

  return (
    <div className="min-h-screen bg-[#030712] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Order details</p>
              <h1 className="mt-3 text-4xl font-semibold">Order #{order.id}</h1>
              <p className="mt-2 text-slate-400">Bekijk bestelinfo en pas de status van deze order aan.</p>
            </div>
            <Link
              href="/installateur/bestellingen"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Terug naar bestellingen
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <InfoCard label="Status" value={order.status} />
          <InfoCard label="Datum" value={formatDate(order.createdAt)} />
          <InfoCard label="Bestelinfo" value={order.installer?.email ?? "Onbekend"} />
          <InfoCard label="Totaal" value={formatCurrency(order.totalPrice)} />
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Status updates</h2>
              <p className="mt-2 text-slate-400">
                Zet de order door naar de volgende fase of spring handmatig naar een status.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {nextStatusAction ? (
                <form action={nextStatusAction}>
                  <button className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-sky-400">
                    Markeer als {nextStatus}
                  </button>
                </form>
              ) : null}
              <form action={resetStatusAction}>
                <button className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                  Terug naar in_behandeling
                </button>
              </form>
              <form action={producedAction}>
                <button className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                  Geproduceerd
                </button>
              </form>
              <form action={deliveredAction}>
                <button className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                  Geleverd
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Bestelinfo</h2>
              <p className="mt-2 text-slate-400">Overzicht van de order, gekoppelde installateur en bestelde items.</p>
            </div>
            <span className="rounded-full bg-slate-900/70 px-4 py-2 text-sm text-slate-300">
              {order.items.length} items
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoRow label="Order ID" value={order.id} />
            <InfoRow label="Installateur" value={order.installer?.email ?? "Onbekend"} />
            <InfoRow label="Totaalprijs" value={formatCurrency(order.totalPrice)} />
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Order items</h2>
              <p className="mt-2 text-slate-400">Bekijk de afmetingen, opties en prijs per item.</p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
            <table className="min-w-full border-separate border-spacing-0 text-left">
              <thead className="bg-white/5 text-slate-400">
                <tr>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Afmetingen</th>
                  <th className="px-6 py-4">Kleur/Glas</th>
                  <th className="px-6 py-4">Aantal</th>
                  <th className="px-6 py-4">Prijs</th>
                </tr>
              </thead>
              <tbody>
                {order.items.length ? (
                  order.items.map((item) => (
                    <tr key={item.id} className="border-t border-white/5 hover:bg-white/5">
                      <td className="px-6 py-5 text-sm text-white">{item.type}</td>
                      <td className="px-6 py-5 text-sm text-slate-300">
                        {item.width} x {item.height} mm
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-300">{item.color || "-"} / {item.glass || "-"}</td>
                      <td className="px-6 py-5 text-sm text-slate-300">{item.quantity}</td>
                      <td className="px-6 py-5 text-sm text-slate-300">{formatCurrency(item.totalPrice)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      Geen order items gevonden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
      <p className="text-sm uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-3 text-base font-semibold text-white">{value}</p>
    </div>
  );
}
