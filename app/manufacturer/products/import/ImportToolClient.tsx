"use client";

import { useActionState, useMemo, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  downloadTemplate,
  importManufacturerProducts,
  initialImportState,
} from "@/app/manufacturer/products/import/actions";
import {
  validateImportRow,
  type RowValidationIssue,
} from "@/app/manufacturer/products/import/validation";

type PreviewRow = {
  row: number;
  type: string;
  name: string;
  pricePerM2: string;
  fixedPrice: string;
  surchargeType: string;
  surchargeValue: string;
};

async function parseFileForPreview(file: File) {
  const name = file.name.toLowerCase();

  if (name.endsWith(".csv")) {
    const text = await file.text();
    const parsed = Papa.parse<Record<string, unknown>>(text, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      throw new Error(`CSV parse fout: ${parsed.errors[0].message}`);
    }

    return parsed.data;
  }

  if (name.endsWith(".xlsx")) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheet = workbook.SheetNames[0];

    if (!firstSheet) {
      throw new Error("Excel bestand bevat geen worksheet.");
    }

    return XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[firstSheet], {
      defval: "",
    });
  }

  throw new Error("Alleen .csv en .xlsx zijn toegestaan.");
}

export default function ImportToolClient() {
  const [state, formAction, pending] = useActionState(
    importManufacturerProducts,
    initialImportState,
  );
  const [clientErrors, setClientErrors] = useState<RowValidationIssue[]>([]);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [previewMessage, setPreviewMessage] = useState("");

  async function handleTemplateDownload() {
    const csv = await downloadTemplate();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "manufacturer-products-template.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function handleFilePreview(file: File | null) {
    setClientErrors([]);
    setPreviewRows([]);
    setPreviewMessage("");

    if (!file) {
      return;
    }

    try {
      const rows = await parseFileForPreview(file);
      const validationErrors: RowValidationIssue[] = [];
      const validRows: PreviewRow[] = [];

      rows.forEach((row, index) => {
        const rowNumber = index + 2;
        const result = validateImportRow(row, rowNumber);

        if (result.errors.length > 0 || !result.data) {
          validationErrors.push(...result.errors);
          return;
        }

        validRows.push({
          row: rowNumber,
          type: result.data.type,
          name: result.data.name,
          pricePerM2: result.data.pricePerM2 === null ? "" : String(result.data.pricePerM2),
          fixedPrice: result.data.fixedPrice === null ? "" : String(result.data.fixedPrice),
          surchargeType: result.data.surchargeType ?? "",
          surchargeValue:
            result.data.surchargeValue === null ? "" : String(result.data.surchargeValue),
        });
      });

      setClientErrors(validationErrors);
      setPreviewRows(validRows);
      setPreviewMessage(
        `Preview: ${validRows.length} geldige rijen, ${validationErrors.length} fouten.`,
      );
    } catch (error) {
      setClientErrors([
        {
          row: 0,
          message: error instanceof Error ? error.message : "Onbekende parse fout.",
        },
      ]);
      setPreviewRows([]);
      setPreviewMessage("");
    }
  }

  const mergedErrors = useMemo(
    () => [...clientErrors, ...(state.errors ?? [])],
    [clientErrors, state.errors],
  );

  return (
    <div className="space-y-6">
      <form action={formAction} className="rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700">
            <input
              name="file"
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={(event) => handleFilePreview(event.target.files?.[0] ?? null)}
              required
            />
            Bestand kiezen (.csv/.xlsx)
          </label>

          <button
            type="button"
            onClick={handleTemplateDownload}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Voorbeeldbestand downloaden
          </button>

          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {pending ? "Importeren..." : "Importeren"}
          </button>
        </div>

        {previewMessage ? <p className="mt-4 text-sm text-gray-300">{previewMessage}</p> : null}
        {state.message ? (
          <p className={`mt-2 text-sm ${state.success ? "text-green-300" : "text-red-300"}`}>
            {state.message}
            {state.success ? ` (${state.importedCount} rijen)` : ""}
          </p>
        ) : null}
      </form>

      {mergedErrors.length > 0 ? (
        <section className="rounded-2xl border border-red-400/40 bg-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white">Fouten</h2>
          <div className="mt-3 space-y-2">
            {mergedErrors.map((error, index) => (
              <article key={`${error.row}-${index}`} className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                {error.row > 0 ? `Rij ${error.row}: ` : ""}
                {error.message}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {previewRows.length > 0 ? (
        <section className="rounded-2xl border border-gray-700 bg-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white">Preview geldige rijen</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700 text-sm">
              <thead>
                <tr className="text-left text-gray-300">
                  <th className="px-3 py-2">Rij</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Naam</th>
                  <th className="px-3 py-2">pricePerM2</th>
                  <th className="px-3 py-2">fixedPrice</th>
                  <th className="px-3 py-2">surchargeType</th>
                  <th className="px-3 py-2">surchargeValue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 text-gray-100">
                {previewRows.map((row) => (
                  <tr key={`${row.row}-${row.name}`}>
                    <td className="px-3 py-2">{row.row}</td>
                    <td className="px-3 py-2">{row.type}</td>
                    <td className="px-3 py-2">{row.name}</td>
                    <td className="px-3 py-2">{row.pricePerM2 || "-"}</td>
                    <td className="px-3 py-2">{row.fixedPrice || "-"}</td>
                    <td className="px-3 py-2">{row.surchargeType || "-"}</td>
                    <td className="px-3 py-2">{row.surchargeValue || "-"}</td>
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
