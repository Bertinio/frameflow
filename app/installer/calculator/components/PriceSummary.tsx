type PriceSummaryProps = {
  price: number;
  margin: number;
  total: number;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

function SummaryRow({ label, value, isTotal = false }: { label: string; value: number; isTotal?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${isTotal ? "border-sky-300/40 bg-sky-500/10" : "border-white/10 bg-transparent"}`}>
      <span className={`text-sm ${isTotal ? "text-sky-200" : "text-slate-300"}`}>{label}</span>
      <span className={`font-semibold ${isTotal ? "text-white" : "text-slate-100"}`}>{formatCurrency(value)}</span>
    </div>
  );
}

export default function PriceSummary({ price, margin, total }: PriceSummaryProps) {
  return (
    <div className="space-y-2">
      <SummaryRow label="Prijs" value={price} />
      <SummaryRow label="Marge" value={margin} />
      <SummaryRow label="Totaal" value={total} isTotal />
    </div>
  );
}
