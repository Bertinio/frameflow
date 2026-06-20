import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function RolluikCalculatorPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    redirect("/installateur/login");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-8">
      <header className="rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Rolluik Calculator</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Start een nieuwe rolluik configuratie</h1>
        <p className="mt-2 text-gray-300">
            Maak een draft aan en bereken de prijs via de database-gedreven rolluik engine.
          </p>
      </header>

      <section className="rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-sm">
        <Link
          href="/installer/rolluik/calculator/start"
          className="inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Nieuwe rolluik draft
        </Link>
      </section>
    </div>
  );
}
