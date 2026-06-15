import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  const totalUsers = await prisma.user.count();
  const totalAdmins = await prisma.user.count({ where: { role: "admin" } });
  const totalInstallers = await prisma.user.count({ where: { role: "installer" } });
  const totalManufacturers = await prisma.user.count({ where: { role: "manufacturer" } });
  const totalImporters = await prisma.user.count({ where: { role: "importer" } });

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-10 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/20 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Admin dashboard</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Dashboard</h1>
            <p className="mt-3 max-w-2xl text-slate-400">
              Overzicht van gebruikers, rollen en systeemstatistieken in één plek.
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Terug naar Admin Panel
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Card title="Totaal gebruikers" value={totalUsers} />
          <Card title="Admins" value={totalAdmins} />
          <Card title="Installers" value={totalInstallers} />
          <Card title="Manufacturers" value={totalManufacturers} />
          <Card title="Importers" value={totalImporters} />
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm shadow-black/10 transition hover:border-white/20 hover:bg-white/10">
      <p className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">{title}</p>
      <p className="mt-4 text-4xl font-semibold text-white">{value}</p>
    </div>
  );
}
