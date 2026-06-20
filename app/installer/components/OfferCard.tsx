type OfferCardProps = {
  title: string;
  status: string;
  price: number;
  date: Date;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function OfferCard({ title, status, price, date }: OfferCardProps) {
  return (
    <li className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-xs text-slate-400">
            {date.toLocaleDateString("nl-NL")} · {status}
          </p>
        </div>
        <p className="text-sm font-semibold text-sky-300">{formatMoney(price)}</p>
      </div>
    </li>
  );
}
