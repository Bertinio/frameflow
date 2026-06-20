"use server";

import { Prisma } from "@prisma/client";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import {
  validateImportRow,
  type RowValidationIssue,
} from "@/app/manufacturer/products/import/validation";

export type ImportActionState = {
  success: boolean;
  message: string;
  importedCount: number;
  errors: RowValidationIssue[];
};

export const initialImportState: ImportActionState = {
  success: false,
  message: "",
  importedCount: 0,
  errors: [],
};

async function requireManufacturerIdFromSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "manufacturer") {
    throw new Error("Unauthorized");
  }

  const fromSession = String(session.user.manufacturerId ?? "").trim();

  if (fromSession) {
    return fromSession;
  }

  const userId = String(session.user.id ?? "").trim();
  if (!userId) {
    throw new Error("Invalid session");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const manufacturer = await prisma.manufacturer.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      name: user.name?.trim() || user.email.split("@")[0] || "Fabrikant",
    },
    select: { id: true },
  });

  return manufacturer.id;
}

async function parseImportFile(file: File) {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".csv")) {
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

  if (fileName.endsWith(".xlsx")) {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      throw new Error("Excel bestand bevat geen worksheet.");
    }

    const worksheet = workbook.Sheets[firstSheetName];
    return XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: "",
    });
  }

  throw new Error("Alleen .csv en .xlsx bestanden zijn toegestaan.");
}

export async function downloadTemplate() {
  const header = "type,name,pricePerM2,fixedPrice,surchargeType,surchargeValue,metadata";
  const sampleRows = [
    "lamel,Standaard Lamel 42,125.50,,,,{\"series\":\"A\"}",
    "motor,Somfy RS100,,320.00,,,{\"power\":\"120W\"}",
    "color,Antraciet,,,percent,12,{\"ral\":\"7016\"}",
    "kast,Kast 180,,90.00,,,{\"material\":\"aluminium\"}",
    "option,Veiligheidspakket,,55.00,,,{\"bundle\":true}",
  ];

  return [header, ...sampleRows].join("\n");
}

export async function importManufacturerProducts(
  _prevState: ImportActionState,
  formData: FormData,
): Promise<ImportActionState> {
  try {
    const manufacturerId = await requireManufacturerIdFromSession();
    const maybeFile = formData.get("file");

    if (!(maybeFile instanceof File)) {
      return {
        success: false,
        message: "Geen bestand ontvangen.",
        importedCount: 0,
        errors: [],
      };
    }

    if (maybeFile.size === 0) {
      return {
        success: false,
        message: "Leeg bestand geupload.",
        importedCount: 0,
        errors: [],
      };
    }

    const rows = await parseImportFile(maybeFile);

    if (rows.length === 0) {
      return {
        success: false,
        message: "Bestand bevat geen data-rijen.",
        importedCount: 0,
        errors: [],
      };
    }

    const errors: RowValidationIssue[] = [];
    const validRows: Array<{
      type: string;
      name: string;
      pricePerM2: number | null;
      fixedPrice: number | null;
      surchargeType: string | null;
      surchargeValue: number | null;
    }> = [];

    rows.forEach((row, index) => {
      const rowNumber = index + 2;
      const { data, errors: rowErrors } = validateImportRow(row, rowNumber);

      if (rowErrors.length > 0 || !data) {
        errors.push(...rowErrors);
        return;
      }

      validRows.push({
        type: data.type,
        name: data.name,
        pricePerM2: data.pricePerM2,
        fixedPrice: data.fixedPrice,
        surchargeType: data.surchargeType,
        surchargeValue: data.surchargeValue,
      });
    });

    if (errors.length > 0) {
      return {
        success: false,
        message: "Import bevat fouten. Los deze op en probeer opnieuw.",
        importedCount: 0,
        errors,
      };
    }

    await prisma.$transaction(
      validRows.map((row) =>
        prisma.manufacturerProduct.create({
          data: {
            manufacturerId,
            type: row.type,
            name: row.name,
            pricePerM2: row.pricePerM2 === null ? null : new Prisma.Decimal(row.pricePerM2),
            fixedPrice: row.fixedPrice === null ? null : new Prisma.Decimal(row.fixedPrice),
            surchargeType: row.surchargeType,
            surchargeValue:
              row.surchargeValue === null ? null : new Prisma.Decimal(row.surchargeValue),
          },
        }),
      ),
    );

    revalidatePath("/manufacturer/products");
    revalidatePath("/manufacturer/dashboard");

    return {
      success: true,
      message: "Import succesvol voltooid.",
      importedCount: validRows.length,
      errors: [],
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Onbekende importfout.",
      importedCount: 0,
      errors: [],
    };
  }
}
