import { requireManufacturerContext } from "@/app/manufacturer/_lib";
import ImportToolClient from "@/app/manufacturer/products/import/ImportToolClient";

export default async function ManufacturerProductsImportPage() {
  await requireManufacturerContext();

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-2xl font-semibold text-white">Producten importeren</h2>
        <p className="mt-2 text-sm text-gray-300">
          Upload een CSV of Excel bestand om fabrikantproducten in bulk toe te voegen.
        </p>
      </header>

      <ImportToolClient />
    </div>
  );
}
