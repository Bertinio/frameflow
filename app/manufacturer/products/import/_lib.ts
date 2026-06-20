import Papa from "papaparse";
import * as XLSX from "xlsx";

export type ManufacturerImportProductType = "lamel" | "motor" | "color" | "kast" | "option";

export type ManufacturerImportRow = {
  rowNumber: number;
  type: ManufacturerImportProductType;
  name: string;
  pricePerM2?: number | null;
  fixedPrice?: number | null;
  surchargeType?: "percent" | "fixed" | null;
  surchargeValue?: number | null;
  metadata?: string | null;
};

export type ManufacturerImportRowError = {
  rowNumber: number;
  errors: string[];
  raw?: Record<string, unknown>;
};

export type ManufacturerImportResult = {
  rows: ManufacturerImportRow[];
  errors: ManufacturerImportRowError[];
};

const VALID_TYPES: ManufacturerImportProductType[] = ["lamel", "motor", "color", "kast", "option"];

function normalizeCell(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function parseNumberOrNull(value: unknown) {
  const normalized = normalizeCell(value);

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseRow(rawRow: Record<string, unknown>, rowNumber: number): ManufacturerImportResult {
  const errors: string[] = [];
  const type = normalizeCell(rawRow.type).toLowerCase();
  const name = normalizeCell(rawRow.name);
  const pricePerM2 = parseNumberOrNull(rawRow.pricePerM2);
  const fixedPrice = parseNumberOrNull(rawRow.fixedPrice);
  const surchargeTypeRaw = normalizeCell(rawRow.surchargeType).toLowerCase();
  const surchargeValue = parseNumberOrNull(rawRow.surchargeValue);
  const metadata = normalizeCell(rawRow.metadata);

  if (!VALID_TYPES.includes(type as ManufacturerImportProductType)) {
    errors.push("type moet lamel, motor, color, kast of option zijn");
  }

  if (!name) {
    errors.push("name is verplicht");
  }

  if (type === "lamel") {
    if (pricePerM2 === null || pricePerM2 <= 0) {
      errors.push("pricePerM2 is verplicht voor lamel");
    }
  }

  if (type === "motor" || type === "kast" || type === "option") {
    if (fixedPrice === null || fixedPrice <= 0) {
      errors.push("fixedPrice is verplicht voor motor/kast/option");
    }
  }

  if (type === "color") {
    if (surchargeTypeRaw !== "percent" && surchargeTypeRaw !== "fixed") {
      errors.push("surchargeType is verplicht en moet percent of fixed zijn voor color");
    }
    if (surchargeValue === null || surchargeValue < 0) {
      errors.push("surchargeValue is verplicht voor color");
    }
  }

  const resultRow: ManufacturerImportRow = {
    rowNumber,
    type: type as ManufacturerImportProductType,
    name,
    pricePerM2,
    fixedPrice,
    surchargeType:
      surchargeTypeRaw === "percent" || surchargeTypeRaw === "fixed"
        ? (surchargeTypeRaw as "percent" | "fixed")
        : null,
    surchargeValue,
    metadata: metadata || null,
  };

  return {
    rows: errors.length === 0 ? [resultRow] : [],
    errors: errors.length > 0 ? [{ rowNumber, errors, raw: rawRow }] : [],
  };
}

export function parseManufacturerImportFile(fileName: string, fileBuffer: Buffer) {
  const lowerName = fileName.toLowerCase();
  let rows: Record<string, unknown>[] = [];

  if (lowerName.endsWith(".csv")) {
    const parsed = Papa.parse<Record<string, unknown>>(fileBuffer.toString("utf8"), {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    rows = (parsed.data || []).filter((row) => Object.keys(row).length > 0);
  } else if (lowerName.endsWith(".xlsx")) {
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return { rows: [], errors: [{ rowNumber: 1, errors: ["Geen werkblad gevonden"], raw: {} }] };
    }

    const sheet = workbook.Sheets[sheetName];
    rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  } else {
    return {
      rows: [],
      errors: [{ rowNumber: 1, errors: ["Alleen .csv of .xlsx bestanden zijn toegestaan"], raw: {} }],
    };
  }

  const validRows: ManufacturerImportRow[] = [];
  const errors: ManufacturerImportRowError[] = [];

  rows.forEach((row, index) => {
    const parsed = parseRow(row, index + 2);
    validRows.push(...parsed.rows);
    errors.push(...parsed.errors);
  });

  return { rows: validRows, errors };
}

export function buildTemplateCsv() {
  return [
    "type,name,pricePerM2,fixedPrice,surchargeType,surchargeValue,metadata",
    'lamel,Rolluik lamel A,225,,,,{"note":"voorbeeld"}',
    'motor,Motor X,,1200,,,{"note":"voorbeeld"}',
    'color,Antraciet mat,,,percent,12,{"note":"voorbeeld"}',
    'kast,Kast type 1,,180,,,{"note":"voorbeeld"}',
    'option,Extra optie,,45,,,{"note":"voorbeeld"}',
  ].join("\n");
}
