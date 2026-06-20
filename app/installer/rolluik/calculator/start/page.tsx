import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { createRolluikDraft } from "./actions";

const MONTAGE_TYPES = ["opbouw", "inbouw", "voorzet"];

export default async function RolluikStartPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    redirect("/installateur/login");
  }

  const db = prisma as any;

  const [lamelTypes, colorCategories, motorTypes]: [
    Array<{ id: string; name: string }>,
    Array<{ id: string; name: string }>,
    Array<{ id: string; type: string }>,
  ] = await Promise.all([
    db.rolluikLamelType.findMany({ orderBy: { name: "asc" } }),
    db.rolluikColorCategory.findMany({ orderBy: { name: "asc" } }),
    db.rolluikMotor.findMany({ orderBy: { type: "asc" } }),
  ]);

  if (lamelTypes.length === 0 || colorCategories.length === 0 || motorTypes.length === 0) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-red-500/40 bg-gray-800 p-6 text-red-200">
        <h1 className="text-2xl font-semibold text-white">Referentiedata ontbreekt</h1>
        <p className="mt-2 text-red-200">
            Voeg eerst rolluik lameltypes, kleurcategorieen en motortypes toe in de database.
          </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
      <header className="rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Rolluik Calculator</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Nieuwe rolluik draft</h1>
        <p className="mt-2 text-gray-300">
            Kies afmetingen, lameltype, kleur, motor en montage.
          </p>
      </header>

      <form action={createRolluikDraft} className="rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm text-gray-300">Breedte (mm)</span>
            <input
              name="width"
              type="number"
              min={1}
              defaultValue={1200}
              className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-300">Hoogte (mm)</span>
            <input
              name="height"
              type="number"
              min={1}
              defaultValue={1400}
              className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-300">Lameltype</span>
            <select
              name="lamelTypeId"
              className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white"
              required
              defaultValue={lamelTypes[0].id}
            >
              {lamelTypes.map((item) => (
                <option key={item.id} value={item.id} className="bg-gray-800 text-white">
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-gray-300">Kleurcategorie</span>
            <select
              name="colorId"
              className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white"
              required
              defaultValue={colorCategories[0].id}
            >
              {colorCategories.map((item) => (
                <option key={item.id} value={item.id} className="bg-gray-800 text-white">
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-gray-300">Motortype</span>
            <select
              name="motorId"
              className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white"
              required
              defaultValue={motorTypes[0].id}
            >
              {motorTypes.map((item) => (
                <option key={item.id} value={item.id} className="bg-gray-800 text-white">
                  {item.type}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-gray-300">Montagetype</span>
            <select
              name="montageType"
              className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white"
              required
              defaultValue={MONTAGE_TYPES[0]}
            >
              {MONTAGE_TYPES.map((item) => (
                <option key={item} value={item} className="bg-gray-800 text-white">
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="submit"
          className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Bereken prijs
        </button>
      </form>
    </div>
  );
}
