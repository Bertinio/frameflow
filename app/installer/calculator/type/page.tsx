import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function CalculatorTypePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    redirect("/login");
  }

  const cards = [
    { label: "Draairaam", type: "draairaam" },
    { label: "Kipraam", type: "kipraam" },
    { label: "Schuifraam", type: "schuifraam" },
    { label: "Deur", type: "deur" },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-white px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-10">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-10 shadow-lg shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Calculator</p>
          <h1 className="mt-4 text-5xl font-semibold text-white">Kies het type raam</h1>
          <p className="mt-4 max-w-3xl text-slate-400">
            Selecteer het raamtype dat je wilt configureren en ga verder met de afmetingen.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {cards.map((card) => (
            <Link
              key={card.type}
              href={`/installer/calculator/dimensions?type=${encodeURIComponent(card.type)}`}
              className="group rounded-3xl border border-white/10 bg-white/5 p-10 shadow-sm shadow-black/10 transition duration-200 hover:border-sky-400 hover:bg-white/10"
            >
              <div className="flex h-full flex-col justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-sky-300">{card.label}</p>
                  <h2 className="mt-6 text-3xl font-semibold text-white">{card.label}</h2>
                </div>
                <div className="mt-8 text-slate-400">Kies dit raamtype om door te gaan naar de afmetingen.</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
