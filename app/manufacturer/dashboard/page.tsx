import { requireManufacturerContext } from "@/app/manufacturer/_lib";
import { prisma } from "@/lib/prisma";

const PRODUCT_TYPES = ["lamel", "motor", "color", "kast", "option"] as const;

export default async function ManufacturerDashboardPage() {
  const { manufacturer } = await requireManufacturerContext();

  const products = await prisma.manufacturerProduct.findMany({
    where: { manufacturerId: manufacturer.id },
    select: { type: true },
  });

  const counts = PRODUCT_TYPES.reduce<Record<string, number>>((acc, item) => {
    acc[item] = 0;
    return acc;
  }, {});

  for (const product of products) {
    if (counts[product.type] !== undefined) {
      counts[product.type] += 1;
    }
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-2xl font-semibold text-white">Dashboard</h2>
        <p className="mt-2 text-sm text-gray-300">Overzicht van aantal producten per type.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {PRODUCT_TYPES.map((item) => (
          <article key={item} className="rounded-xl border border-gray-700 bg-gray-800 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-300">{item}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{counts[item]}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
