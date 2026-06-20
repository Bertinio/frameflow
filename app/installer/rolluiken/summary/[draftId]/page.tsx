import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { calculateRolluikPrice } from "@/app/installer/rolluiken/actions";

type PageProps = {
  params: Promise<{
    draftId: string;
  }>;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function RolluikenSummaryPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    redirect("/installateur/login");
  }

  const { draftId } = await params;

  if (!draftId) {
    redirect("/installer/rolluik/calculator");
  }

  const breakdown = await calculateRolluikPrice(draftId);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Rolluiken</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Prijsbreakdown</h1>
        <p className="mt-2 text-sm text-gray-300">Berekening voor draft {draftId}</p>
      </header>

      <section className="rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-sm">
        <div className="space-y-3">
          <Row label="Oppervlakte" value={`${breakdown.oppervlakte.toFixed(2)} m2`} />
          <Row label="Basis (lamel)" value={formatCurrency(breakdown.basis)} />
          <Row label="Motor" value={formatCurrency(breakdown.motor)} />
          <Row label="Kleurtoeslag" value={formatCurrency(breakdown.kleur)} />
          <Row label="Fabrikantprijs" value={formatCurrency(breakdown.fabrikantPrijs)} />
          <Row label="Marge" value={formatCurrency(breakdown.marge)} />
          <Row label="Klein materiaal" value={formatCurrency(breakdown.kleinMateriaal)} />
          <Row label="Arbeid" value={formatCurrency(breakdown.arbeid)} />
          <Row label="Totaal" value={formatCurrency(breakdown.totaal)} highlight />
        </div>
      </section>
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-700 bg-gray-800 px-4 py-3">
      <span className="text-sm text-gray-300">{label}</span>
      <span
        className={
          highlight ? "text-lg font-semibold text-blue-300" : "text-sm font-semibold text-white"
        }
      >
        {value}
      </span>
    </div>
  );
}
