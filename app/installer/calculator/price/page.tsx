import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

function buildQuery(params: Record<string, any>) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) {
      v.forEach((val) => qs.append(k, String(val)));
    } else {
      qs.set(k, String(v));
    }
  });
  return qs.toString();
}

export default async function PricePage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "installer") {
    redirect("/login");
  }

  const type = String(searchParams.type ?? "");
  const width = Number(searchParams.width ?? 0);
  const height = Number(searchParams.height ?? 0);
  const color = String(searchParams.color ?? "");
  const glass = String(searchParams.glass ?? "");

  const optionsArr = searchParams.options
    ? Array.isArray(searchParams.options)
      ? searchParams.options
      : [String(searchParams.options)]
    : [];

  const areaM2 = (width * height) / 1_000_000;

  const baseMap: Record<string, number> = {
    draairaam: 80,
    kipraam: 70,
    schuifraam: 120,
    deur: 150,
  };

  const base = baseMap[type] ?? 60;
  const optionsCost = optionsArr.length * 12;
  const unitPrice = base + areaM2 * 40 + optionsCost;
  const totalPrice = unitPrice; // single unit

  const query = buildQuery({ type, width, height, color, glass, options: optionsArr });

  return (
    <div className="min-h-screen bg-[#030712] text-white px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Calculator</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Prijs overzicht</h1>
          <p className="mt-4 text-slate-400">Controleer de berekende prijs en voeg het raam toe aan de offerte.</p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
          <div className="grid gap-4">
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-transparent px-4 py-4">
              <div>
                <div className="text-sm text-slate-400">Type</div>
                <div className="font-semibold text-white">{type}</div>
              </div>
              <div className="text-white">{width}×{height} mm</div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-transparent px-4 py-4">
              <div>
                <div className="text-sm text-slate-400">Kleur</div>
                <div className="font-semibold text-white">{color || "Standaard"}</div>
              </div>
              <div className="text-white">{glass || "Standaard"}</div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-transparent px-4 py-4">
              <div>
                <div className="text-sm text-slate-400">Opties</div>
                <div className="font-semibold text-white">{optionsArr.length ? optionsArr.join(", ") : "Geen"}</div>
              </div>
              <div className="text-white">€{optionsArr.length * 12}</div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-transparent px-4 py-4">
              <div>
                <div className="text-sm text-slate-400">Eenheidsprijs</div>
                <div className="font-semibold text-white">€{unitPrice.toFixed(2)}</div>
              </div>
              <div className="text-white">Aantal: 1</div>
            </div>

            <div className="mt-4 flex gap-3">
              <Link
                href={`/installer/calculator/add?${query}&unitPrice=${unitPrice.toFixed(2)}&totalPrice=${totalPrice.toFixed(2)}`}
                className="rounded-2xl bg-sky-500 px-6 py-3 font-semibold text-black"
              >
                Raam toevoegen aan offerte
              </Link>

              <Link
                href="/installer/calculator/type"
                className="rounded-2xl border border-white/10 px-6 py-3 font-semibold text-white"
              >
                Nog een raam configureren
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
