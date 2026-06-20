import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import StartFormClient from "./StartFormClient";

export default async function RolluikenStartPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    redirect("/installateur/login");
  }

  const db = prisma as any;

  const [lamelTypes, colorCategories, motors]: [
    Array<{ id: string; name: string; pricePerM2: any }>,
    Array<{ id: string; name: string; surchargeType: string; surchargeValue: any }>,
    Array<{ id: string; type: string; price: any }>,
  ] = await Promise.all([
    db.rolluikLamelType.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, pricePerM2: true },
    }),
    db.rolluikColorCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, surchargeType: true, surchargeValue: true },
    }),
    db.rolluikMotor.findMany({
      orderBy: { type: "asc" },
      select: { id: true, type: true, price: true },
    }),
  ]);

  if (!lamelTypes.length || !colorCategories.length || !motors.length) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-red-500/40 bg-gray-800 p-6 text-red-200">
        <h1 className="text-xl font-semibold text-white">Referentiedata ontbreekt</h1>
        <p className="mt-2 text-sm text-red-200">
          Voeg eerst lameltypes, kleurcategorieen en motortypes toe in de database.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.25em] text-blue-300">Rolluiken Configurator</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Stap 1: Basisconfiguratie</h1>
        <p className="mt-1 text-sm text-gray-300">
          Kies afmetingen, lameltype, kleur en motor om je rolluik-draft te starten.
        </p>
      </header>

      <StartFormClient
        lamelTypes={lamelTypes.map((item) => ({
          id: item.id,
          name: item.name,
          pricePerM2: Number(item.pricePerM2 ?? 0),
        }))}
        colorCategories={colorCategories.map((item) => ({
          id: item.id,
          name: item.name,
          surchargeType: item.surchargeType,
          surchargeValue: Number(item.surchargeValue ?? 0),
        }))}
        motors={motors.map((item) => ({
          id: item.id,
          type: item.type,
          price: Number(item.price ?? 0),
        }))}
      />
    </div>
  );
}
