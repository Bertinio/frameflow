import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

const COLORS = ["Wit", "Antraciet", "Zwart", "Naturel"];

export default async function ColorPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "installer") {
    redirect("/login");
  }

  const type = String(searchParams.type ?? "");
  const width = String(searchParams.width ?? "");
  const height = String(searchParams.height ?? "");
  const defaultColor = String(searchParams.color ?? "");

  return (
    <div className="min-h-screen bg-[#030712] text-white px-6 py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Calculator</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Kleur kiezen</h1>
          <p className="mt-4 text-slate-400">Kies de kleur voor het profiel van het raam.</p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
          <form method="get" action="/installer/calculator/glass" className="grid gap-4">
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="width" value={width} />
            <input type="hidden" name="height" value={height} />

            <div className="grid gap-3 md:grid-cols-2">
              {COLORS.map((c) => (
                <label key={c} className={`flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 p-4 ${defaultColor === c ? "bg-white/10" : "bg-transparent"}`}>
                  <input type="radio" name="color" value={c} defaultChecked={defaultColor === c} />
                  <div>
                    <div className="text-white font-semibold">{c}</div>
                    <div className="text-slate-400 text-sm">Profiel kleur</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-4 flex gap-3">
              <button type="submit" className="rounded-2xl bg-sky-500 px-6 py-3 font-semibold text-black">Volgende</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
