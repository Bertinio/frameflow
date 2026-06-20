"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireManufacturerContext } from "@/app/manufacturer/_lib";

export const PRODUCT_TYPES = ["lamel", "motor", "color", "kast", "option"] as const;
export type ManufacturerProductType = (typeof PRODUCT_TYPES)[number];

function isProductType(value: string): value is ManufacturerProductType {
  return PRODUCT_TYPES.includes(value as ManufacturerProductType);
}

function parsePositiveDecimal(value: FormDataEntryValue | null) {
  const parsed = Number(value ?? NaN);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function parseNonNegativeDecimal(value: FormDataEntryValue | null) {
  const parsed = Number(value ?? NaN);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

function parseSurchargeType(value: FormDataEntryValue | null) {
  const parsed = String(value ?? "").trim().toLowerCase();
  if (parsed === "percent" || parsed === "fixed") {
    return parsed;
  }
  return null;
}

function buildProductPayload(formData: FormData) {
  const type = String(formData.get("type") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();

  if (!isProductType(type)) {
    throw new Error("Ongeldig producttype.");
  }

  if (!name) {
    throw new Error("Naam is verplicht.");
  }

  let pricePerM2: number | null = null;
  let fixedPrice: number | null = null;
  let surchargeType: "percent" | "fixed" | null = null;
  let surchargeValue: number | null = null;

  if (type === "lamel") {
    pricePerM2 = parsePositiveDecimal(formData.get("pricePerM2"));
    if (pricePerM2 === null) {
      throw new Error("pricePerM2 is verplicht voor lamel.");
    }
  }

  if (type === "motor" || type === "kast" || type === "option") {
    fixedPrice = parsePositiveDecimal(formData.get("fixedPrice"));
    if (fixedPrice === null) {
      throw new Error("fixedPrice is verplicht voor motor/kast/option.");
    }
  }

  if (type === "color") {
    surchargeType = parseSurchargeType(formData.get("surchargeType"));
    surchargeValue = parseNonNegativeDecimal(formData.get("surchargeValue"));

    if (!surchargeType || surchargeValue === null) {
      throw new Error("surchargeType en surchargeValue zijn verplicht voor color.");
    }

    if (surchargeType === "percent" && surchargeValue > 100) {
      throw new Error("surchargeValue voor percent mag maximaal 100 zijn.");
    }
  }

  return {
    type,
    name,
    pricePerM2,
    fixedPrice,
    surchargeType,
    surchargeValue,
  };
}

export async function createManufacturerProduct(formData: FormData) {
  const { manufacturer } = await requireManufacturerContext();
  const payload = buildProductPayload(formData);

  await prisma.manufacturerProduct.create({
    data: {
      manufacturerId: manufacturer.id,
      type: payload.type,
      name: payload.name,
      pricePerM2: payload.pricePerM2 === null ? null : new Prisma.Decimal(payload.pricePerM2),
      fixedPrice: payload.fixedPrice === null ? null : new Prisma.Decimal(payload.fixedPrice),
      surchargeType: payload.surchargeType,
      surchargeValue:
        payload.surchargeValue === null ? null : new Prisma.Decimal(payload.surchargeValue),
    },
  });

  revalidatePath("/manufacturer/products");
  revalidatePath("/manufacturer/dashboard");
  redirect("/manufacturer/products");
}

export async function updateManufacturerProduct(productId: string, formData: FormData) {
  const { manufacturer } = await requireManufacturerContext();
  const safeProductId = String(productId ?? "").trim();

  if (!safeProductId) {
    throw new Error("Product id ontbreekt.");
  }

  const existing = await prisma.manufacturerProduct.findFirst({
    where: {
      id: safeProductId,
      manufacturerId: manufacturer.id,
    },
    select: { id: true },
  });

  if (!existing) {
    throw new Error("Product niet gevonden.");
  }

  const payload = buildProductPayload(formData);

  await prisma.manufacturerProduct.update({
    where: { id: safeProductId },
    data: {
      type: payload.type,
      name: payload.name,
      pricePerM2: payload.pricePerM2 === null ? null : new Prisma.Decimal(payload.pricePerM2),
      fixedPrice: payload.fixedPrice === null ? null : new Prisma.Decimal(payload.fixedPrice),
      surchargeType: payload.surchargeType,
      surchargeValue:
        payload.surchargeValue === null ? null : new Prisma.Decimal(payload.surchargeValue),
    },
  });

  revalidatePath("/manufacturer/products");
  revalidatePath(`/manufacturer/products/${safeProductId}/edit`);
  revalidatePath("/manufacturer/dashboard");
  redirect("/manufacturer/products");
}
