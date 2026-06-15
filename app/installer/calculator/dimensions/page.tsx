import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function DimensionsPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "installer") {
    redirect("/login");
  }

  const type = String(searchParams.type ?? "");
  const defaultWidth = String(searchParams.width ?? "");
  const defaultHeight = String(searchParams.height ?? "");

  return (
    <div className="min-h-screen bg-[#030712] text-white px-6 py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Calculator</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Kies afmetingen</h1>
          <p className="mt-4 text-slate-400">Vul de breedte en hoogte in (mm) voor het geselecteerde raamtype.</p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
          <form method="get" action="/installer/calculator/color" className="grid gap-4">
            <input type="hidden" name="type" value={type} />

            <label className="flex flex-col">
              <span className="text-sm text-slate-300">Breedte (mm)</span>
              <input
                name="width"
                type="number"
                defaultValue={defaultWidth}
                className="mt-2 rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white"
                required
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-slate-300">Hoogte (mm)</span>
              <input
                name="height"
                type="number"
                defaultValue={defaultHeight}
                className="mt-2 rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white"
                required
              />
            </label>

            <div className="mt-4 flex gap-3">
              <button type="submit" className="rounded-2xl bg-sky-500 px-6 py-3 font-semibold text-black">Volgende</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
