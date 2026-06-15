import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

const OPTIONS = [
  { key: "hor", label: "Hor" },
  { key: "rooster", label: "Rooster" },
  { key: "vent", label: "Ventilatierooster" },
];

export default async function OptionsPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "installer") {
    redirect("/login");
  }

  const type = String(searchParams.type ?? "");
  const width = String(searchParams.width ?? "");
  const height = String(searchParams.height ?? "");
  const color = String(searchParams.color ?? "");
  const glass = String(searchParams.glass ?? "");

  const selected = searchParams.options
    ? Array.isArray(searchParams.options)
      ? searchParams.options
      : [String(searchParams.options)]
    : [];

  return (
    <div className="min-h-screen bg-[#030712] text-white px-6 py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Calculator</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Extra opties</h1>
          <p className="mt-4 text-slate-400">Selecteer eventuele extra&apos;s voor dit raam.</p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
          <form method="get" action="/installer/calculator/price" className="grid gap-4">
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="width" value={width} />
            <input type="hidden" name="height" value={height} />
            <input type="hidden" name="color" value={color} />
            <input type="hidden" name="glass" value={glass} />

            <div className="grid gap-3">
              {OPTIONS.map((opt) => (
                <label key={opt.key} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="options"
                    value={opt.key}
                    defaultChecked={selected.includes(opt.key)}
                    className="h-4 w-4"
                  />
                  <div>
                    <div className="text-white">{opt.label}</div>
                    <div className="text-slate-400 text-sm">Extra optie</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-4 flex gap-3">
              <button type="submit" className="rounded-2xl bg-sky-500 px-6 py-3 font-semibold text-black">Bereken prijs</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
