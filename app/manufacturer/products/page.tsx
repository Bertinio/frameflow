import Link from "next/link";
import { requireManufacturerContext } from "@/app/manufacturer/_lib";
import { prisma } from "@/lib/prisma";

const FILTER_TYPES = ["all", "lamel", "motor", "color", "kast", "option"] as const;

type PageProps = {
  searchParams?: Promise<{
    type?: string;
  }>;
};

function formatNumber(value: unknown) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num.toFixed(2) : "-";
}

export default async function ManufacturerProductsPage({ searchParams }: PageProps) {
  const { manufacturer } = await requireManufacturerContext();
  const params = (await searchParams) ?? {};
  const typeFilter = String(params.type ?? "all").toLowerCase();
  const activeFilter = FILTER_TYPES.includes(typeFilter as (typeof FILTER_TYPES)[number])
    ? (typeFilter as (typeof FILTER_TYPES)[number])
    : "all";

  const products = await prisma.manufacturerProduct.findMany({
    where: {
      manufacturerId: manufacturer.id,
      ...(activeFilter === "all" ? {} : { type: activeFilter }),
    },
    orderBy: [
      { type: "asc" },
      { name: "asc" },
    ],
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">Producten</h2>
          <p className="mt-2 text-sm text-gray-300">Beheer alle producten van deze fabrikant.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/manufacturer/products/import"
            className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-600"
          >
            Importeren
          </Link>
          <Link
            href="/manufacturer/products/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Nieuw product
          </Link>
        </div>
      </header>

      <section className="rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          {FILTER_TYPES.map((filter) => {
            const isActive = filter === activeFilter;
            return (
              <Link
                key={filter}
                href={filter === "all" ? "/manufacturer/products" : `/manufacturer/products?type=${filter}`}
                className={[
                  "rounded-md px-3 py-1.5 text-sm",
                  isActive
                    ? "bg-gray-700 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white",
                ].join(" ")}
              >
                {filter}
              </Link>
            );
          })}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700 text-sm">
            <thead>
              <tr className="text-left text-gray-300">
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Naam</th>
                <th className="px-3 py-2">pricePerM2</th>
                <th className="px-3 py-2">fixedPrice</th>
                <th className="px-3 py-2">surcharge</th>
                <th className="px-3 py-2">Actie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-gray-300" colSpan={6}>
                    Geen producten gevonden voor deze filter.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-3 py-3">{product.type}</td>
                    <td className="px-3 py-3">{product.name}</td>
                    <td className="px-3 py-3">{product.pricePerM2 ? formatNumber(product.pricePerM2) : "-"}</td>
                    <td className="px-3 py-3">{product.fixedPrice ? formatNumber(product.fixedPrice) : "-"}</td>
                    <td className="px-3 py-3">
                      {product.surchargeType && product.surchargeValue
                        ? `${product.surchargeType}: ${formatNumber(product.surchargeValue)}`
                        : "-"}
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        href={`/manufacturer/products/${product.id}/edit`}
                        className="rounded-md bg-gray-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-600"
                      >
                        Bewerken
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
