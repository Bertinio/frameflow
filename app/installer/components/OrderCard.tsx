type OrderCardProps = {
  orderNumber: string;
  status: string;
  deliveryDate: Date;
};

export default function OrderCard({ orderNumber, status, deliveryDate }: OrderCardProps) {
  return (
    <li className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-white">Bestelling {orderNumber}</p>
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-sky-300">{status}</p>
      </div>
      <p className="mt-2 text-xs text-slate-400">
        Leverdatum: {deliveryDate.toLocaleDateString("nl-NL")}
      </p>
    </li>
  );
}
