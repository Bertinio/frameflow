import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createDraft } from "./actions";

const WINDOW_TYPES = ["draairaam", "kipraam", "schuifraam", "deur"];
const COLORS = ["wit", "antraciet", "zwart", "naturel"];

export default async function CalculatorStartPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    redirect("/installateur/login");
  }

  return (
    <div className="min-h-screen bg-[#030712] px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Calculator</p>
          <h1 className="mt-4 text-4xl font-semibold">Stap 1: Start configuratie</h1>
          <p className="mt-2 text-slate-400">Kies type, afmetingen en kleur om een nieuwe ConfigDraft te starten.</p>
        </header>

        <form action={createDraft} className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm text-slate-300">Type</span>
              <select name="type" defaultValue="draairaam" className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white" required>
                {WINDOW_TYPES.map((type) => (
                  <option key={type} value={type} className="bg-slate-900 text-white">
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm text-slate-300">Kleur</span>
              <select name="color" defaultValue="wit" className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white" required>
                {COLORS.map((color) => (
                  <option key={color} value={color} className="bg-slate-900 text-white">
                    {color}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm text-slate-300">Breedte</span>
              <input name="width" type="number" min={1} defaultValue={1200} className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white" required />
            </label>

            <label className="block">
              <span className="text-sm text-slate-300">Hoogte</span>
              <input name="height" type="number" min={1} defaultValue={1400} className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white" required />
            </label>
          </div>

          <button type="submit" className="mt-6 rounded-2xl bg-sky-500 px-6 py-3 font-semibold text-black transition hover:bg-sky-400">
            Ga naar glas
          </button>
        </form>
      </div>
    </div>
  );
}
