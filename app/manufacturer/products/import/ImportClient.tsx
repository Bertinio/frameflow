"use client";

import { useRef, useState } from "react";
import {
  downloadTemplate,
  importManufacturerProducts,
  initialImportState,
} from "@/app/manufacturer/products/import/actions";
import { parseManufacturerImportFile, type ManufacturerImportResult } from "./_lib";

type PreviewState = ManufacturerImportResult & {
  fileName?: string;
  imported?: number;
};

function formatCell(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

export default function ImportClient() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<PreviewState>({ rows: [], errors: [] });
  const [serverMessage, setServerMessage] = useState<string>("");
  const [isImporting, setIsImporting] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setServerMessage("");
    const file = event.target.files?.[0];

    if (!file) {
      setPreview({ rows: [], errors: [] });
      return;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = parseManufacturerImportFile(file.name, buffer);
    setPreview({ ...result, fileName: file.name });
  }

  async function handleImport() {
    const file = inputRef.current?.files?.[0];

    if (!file) {
      setServerMessage("Kies eerst een bestand.");
      return;
    }

    if (preview.errors.length > 0 || preview.rows.length === 0) {
      setServerMessage("Los eerst de validatiefouten op voordat je importeert.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsImporting(true);
    try {
      const result = await importManufacturerProducts(initialImportState, formData);
      if (result.errors.length > 0) {
        setPreview((current) => ({
          ...current,
          errors: result.errors.map((error) => ({
            rowNumber: error.row,
            errors: [error.message],
          })),
        }));
        setServerMessage("Import geannuleerd vanwege fouten.");
      } else {
        setServerMessage(`Succesvol ${result.importedCount} producten geïmporteerd.`);
        setPreview({ rows: [], errors: [] });
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }
    } catch (error) {
      setServerMessage(error instanceof Error ? error.message : "Import mislukt");
    } finally {
      setIsImporting(false);
    }
  }

  async function handleTemplateDownload() {
    const template = await downloadTemplate();
    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "manufacturer-products-template.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h1 className="text-2xl font-semibold text-white">Producten importeren</h1>
        <p className="mt-2 text-sm text-gray-300">
          Upload CSV of Excel bestanden om ManufacturerProduct records aan te maken.
        </p>
      </header>

      <section className="rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleTemplateDownload}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Voorbeeldbestand downloaden
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileChange}
            className="block w-full max-w-md rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-white hover:file:bg-blue-700"
          />
          <button
            type="button"
            onClick={handleImport}
            disabled={isImporting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isImporting ? "Importeren..." : "Importeren"}
          </button>
        </div>
        {serverMessage ? <p className="mt-4 text-sm text-gray-300">{serverMessage}</p> : null}
      </section>

      {preview.errors.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Fouten</h2>
          {preview.errors.map((error) => (
            <article key={error.rowNumber} className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-100">
              <p className="font-semibold">Rij {error.rowNumber}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {error.errors.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      ) : null}

      {preview.rows.length > 0 ? (
        <section className="rounded-2xl border border-gray-700 bg-gray-800 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Preview</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700 text-sm text-gray-100">
              <thead>
                <tr className="text-left text-gray-300">
                  <th className="px-3 py-2">Rij</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Naam</th>
                  <th className="px-3 py-2">pricePerM2</th>
                  <th className="px-3 py-2">fixedPrice</th>
                  <th className="px-3 py-2">surchargeType</th>
                  <th className="px-3 py-2">surchargeValue</th>
                  <th className="px-3 py-2">metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {preview.rows.map((row) => (
                  <tr key={row.rowNumber}>
                    <td className="px-3 py-2">{row.rowNumber}</td>
                    <td className="px-3 py-2">{row.type}</td>
                    <td className="px-3 py-2">{row.name}</td>
                    <td className="px-3 py-2">{formatCell(row.pricePerM2)}</td>
                    <td className="px-3 py-2">{formatCell(row.fixedPrice)}</td>
                    <td className="px-3 py-2">{formatCell(row.surchargeType)}</td>
                    <td className="px-3 py-2">{formatCell(row.surchargeValue)}</td>
                    <td className="px-3 py-2">{formatCell(row.metadata)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
