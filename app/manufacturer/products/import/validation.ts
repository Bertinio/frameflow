import {
  isManufacturerProductType,
  type ManufacturerProductType,
} from "@/app/manufacturer/products/types";

export type ImportRowInput = Record<string, unknown>;

export type NormalizedImportRow = {
  type: ManufacturerProductType;
  name: string;
  pricePerM2: number | null;
  fixedPrice: number | null;
  surchargeType: "percent" | "fixed" | null;
  surchargeValue: number | null;
  metadata: string | null;
};

export type RowValidationIssue = {
  row: number;
  message: string;
};

function normalizeKey(key: string) {
  return key.trim().toLowerCase();
}

function normalizeValue(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function parseOptionalNumber(value: string) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

function parseSurchargeType(value: string) {
  const normalized = value.toLowerCase();
  if (normalized === "percent" || normalized === "fixed") {
    return normalized;
  }
  return null;
}

export function normalizeInputRow(row: ImportRowInput) {
  const normalized: Record<string, string> = {};

  for (const [key, value] of Object.entries(row)) {
    normalized[normalizeKey(key)] = normalizeValue(value);
  }

  return normalized;
}

export function validateImportRow(row: ImportRowInput, rowNumber: number): {
  data: NormalizedImportRow | null;
  errors: RowValidationIssue[];
} {
  const normalized = normalizeInputRow(row);

  const typeRaw = normalized.type.toLowerCase();
  const name = normalized.name;
  const pricePerM2Raw = normalized.priceperm2;
  const fixedPriceRaw = normalized.fixedprice;
  const surchargeTypeRaw = normalized.surchargetype;
  const surchargeValueRaw = normalized.surchargevalue;
  const metadataRaw = normalized.metadata;

  const errors: RowValidationIssue[] = [];

  if (!isManufacturerProductType(typeRaw)) {
    errors.push({
      row: rowNumber,
      message: "type moet een van lamel, motor, color, kast, option zijn.",
    });
  }

  if (!name) {
    errors.push({
      row: rowNumber,
      message: "name is verplicht.",
    });
  }

  const pricePerM2 = parseOptionalNumber(pricePerM2Raw);
  const fixedPrice = parseOptionalNumber(fixedPriceRaw);
  const surchargeType = parseSurchargeType(surchargeTypeRaw);
  const surchargeValue = parseOptionalNumber(surchargeValueRaw);

  if (typeRaw === "lamel") {
    if (pricePerM2 === null || pricePerM2 <= 0) {
      errors.push({
        row: rowNumber,
        message: "pricePerM2 is verplicht en moet > 0 voor lamel.",
      });
    }
  }

  if (typeRaw === "motor" || typeRaw === "kast" || typeRaw === "option") {
    if (fixedPrice === null || fixedPrice <= 0) {
      errors.push({
        row: rowNumber,
        message: "fixedPrice is verplicht en moet > 0 voor motor/kast/option.",
      });
    }
  }

  if (typeRaw === "color") {
    if (!surchargeType) {
      errors.push({
        row: rowNumber,
        message: "surchargeType is verplicht en moet percent of fixed zijn voor color.",
      });
    }

    if (surchargeValue === null || surchargeValue < 0) {
      errors.push({
        row: rowNumber,
        message: "surchargeValue is verplicht en moet >= 0 voor color.",
      });
    }
  }

  if (errors.length > 0 || !isManufacturerProductType(typeRaw)) {
    return {
      data: null,
      errors,
    };
  }

  return {
    data: {
      type: typeRaw,
      name,
      pricePerM2,
      fixedPrice,
      surchargeType,
      surchargeValue,
      metadata: metadataRaw || null,
    },
    errors: [],
  };
}
