import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  calculateRolluikPrice,
  RolluikPriceError,
} from "@/lib/rolluik-price-engine";

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

export default async function RolluikSummaryPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    redirect("/installateur/login");
  }

  const { draftId } = await params;

  if (!draftId) {
    redirect("/installer/calculator");
  }

  try {
    const breakdown = await calculateRolluikPrice(draftId);

    return (
      <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
        <header className="rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Rolluik Calculator</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Prijs Samenvatting</h1>
          <p className="mt-2 text-gray-300">Breakdown voor draft {draftId}</p>
        </header>

        <section className="rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-sm">
          <div className="space-y-3">
            <Row label="Oppervlakte (m2)" value={String(breakdown.oppervlakte.toFixed(2))} />
            <Row label="Basis" value={formatCurrency(breakdown.basis)} />
            <Row label="Motor" value={formatCurrency(breakdown.motor)} />
            <Row label="Kleurtoeslag" value={formatCurrency(breakdown.kleur)} />
            <Row label="Montage" value={formatCurrency(breakdown.montage)} />
            <Row
              label="Totaal (incl. 15% marge)"
              value={formatCurrency(breakdown.totaal)}
              highlight
            />
          </div>
        </section>
      </div>
    );
  } catch (error) {
    const message =
      error instanceof RolluikPriceError
        ? `${error.code}: ${error.message}`
        : "Onbekende fout tijdens prijsberekening";

    return (
      <div className="min-h-screen bg-[#030712] px-6 py-10 text-white">
        <div className="mx-auto max-w-3xl space-y-8">
          <header className="rounded-3xl border border-red-400/30 bg-red-500/10 p-8 shadow-lg shadow-black/20">
            <p className="text-sm uppercase tracking-[0.3em] text-red-300">Rolluik Calculator</p>
            <h1 className="mt-4 text-3xl font-semibold">Prijsberekening mislukt</h1>
            <p className="mt-2 text-red-100">{message}</p>
          </header>
        </div>
      </div>
    );
  }
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
      <span className={highlight ? "text-lg font-semibold text-blue-300" : "text-sm font-semibold text-white"}>
        {value}
      </span>
    </div>
  );
}
