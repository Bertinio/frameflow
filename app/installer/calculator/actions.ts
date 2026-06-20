"use server";

import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { calculatePriceWithMargin, roundPrice } from "@/lib/pricing";

type PriceInput = {
  width: number;
  height: number;
  color: string;
};

type PriceResult = {
  areaM2: number;
  basePrice: number;
  colorSurcharge: number;
  totalPrice: number;
};

const BASE_PRICE_PER_M2 = 120;

const COLOR_MULTIPLIER: Record<string, number> = {
  wit: 1,
  antraciet: 1.08,
  zwart: 1.1,
  naturel: 1.05,
};

export async function calculateWindowPriceAction({
  width,
  height,
  color,
}: PriceInput): Promise<PriceResult> {
  const safeWidth = Number.isFinite(width) && width > 0 ? width : 0;
  const safeHeight = Number.isFinite(height) && height > 0 ? height : 0;

  const areaM2 = (safeWidth * safeHeight) / 1_000_000;
  const normalizedColor = String(color || "").trim().toLowerCase();
  const multiplier = COLOR_MULTIPLIER[normalizedColor] ?? 1;

  const basePrice = areaM2 * BASE_PRICE_PER_M2;
  const totalPrice = basePrice * multiplier;
  const colorSurcharge = totalPrice - basePrice;

  return {
    areaM2,
    basePrice,
    colorSurcharge,
    totalPrice,
  };
}

type CreateDraftConfigInput = {
  type: string;
  width: number;
  height: number;
  color: string;
  glass?: string;
  extras?: string[] | string;
};

export async function createDraftConfig({
  type,
  width,
  height,
  color,
  glass,
  extras,
}: CreateDraftConfigInput) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    throw new Error("Unauthorized");
  }

  const installerId = String(session.user.id ?? "");
  const safeType = String(type ?? "").trim();
  const safeColor = String(color ?? "").trim();
  const safeGlass = typeof glass === "string" ? glass.trim() : "";
  const safeExtras = Array.isArray(extras)
    ? extras.map((item) => String(item)).filter(Boolean)
    : typeof extras === "string"
      ? extras
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
      : [];
  const safeWidth = Number.isFinite(width) && width > 0 ? Math.round(width) : 0;
  const safeHeight = Number.isFinite(height) && height > 0 ? Math.round(height) : 0;

  if (!installerId || !safeType || !safeColor || !safeWidth || !safeHeight) {
    throw new Error("Invalid draft configuration");
  }

  const draft = await prisma.configDraft.create({
    data: {
      installerId,
      type: safeType,
      width: safeWidth,
      height: safeHeight,
      color: safeColor,
      glass: safeGlass || null,
      extras: safeExtras.length ? JSON.stringify(safeExtras) : null,
    },
  });

  return {
    id: draft.id,
    type: draft.type,
    width: draft.width,
    height: draft.height,
    color: draft.color,
    glass: draft.glass,
    extras: draft.extras,
    createdAt: draft.createdAt,
  };
}

type UpdateDraftConfigInput = {
  draftId: string;
  glass?: string | null;
  extras?: string[] | string | null;
};

export async function updateDraftConfig({
  draftId,
  glass,
  extras,
}: UpdateDraftConfigInput) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    throw new Error("Unauthorized");
  }

  const installerId = String(session.user.id ?? "");
  const safeDraftId = String(draftId ?? "").trim();

  if (!installerId || !safeDraftId) {
    throw new Error("Invalid draft id");
  }

  const existingDraft = await prisma.configDraft.findFirst({
    where: {
      id: safeDraftId,
      installerId,
    },
    select: {
      id: true,
    },
  });

  if (!existingDraft) {
    throw new Error("Draft not found");
  }

  const updateData: { glass?: string | null; extras?: string | null } = {};

  if (glass !== undefined) {
    const safeGlass = String(glass ?? "").trim();
    updateData.glass = safeGlass || null;
  }

  if (extras !== undefined) {
    const safeExtras = Array.isArray(extras)
      ? extras.map((item) => String(item)).filter(Boolean)
      : typeof extras === "string"
        ? extras
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
        : [];

    updateData.extras = safeExtras.length ? JSON.stringify(safeExtras) : null;
  }

  const draft = await prisma.configDraft.update({
    where: { id: safeDraftId },
    data: updateData,
  });

  return {
    id: draft.id,
    type: draft.type,
    width: draft.width,
    height: draft.height,
    color: draft.color,
    glass: draft.glass,
    extras: draft.extras,
    createdAt: draft.createdAt,
  };
}

type CreateQuoteFromDraftInput = {
  draftId: string;
};

export async function createQuoteFromDraft({ draftId }: CreateQuoteFromDraftInput) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    throw new Error("Unauthorized");
  }

  const installerId = String(session.user.id ?? "").trim();
  const safeDraftId = String(draftId ?? "").trim();

  if (!installerId || !safeDraftId) {
    throw new Error("Invalid draft id");
  }

  const [draft, user] = await Promise.all([
    prisma.configDraft.findFirst({
      where: {
        id: safeDraftId,
        installerId,
      },
    }),
    prisma.user.findUnique({
      where: { id: installerId },
      select: { margin: true },
    }),
  ]);

  if (!draft) {
    throw new Error("Draft not found");
  }

  const materialPricing = await calculateWindowPriceAction({
    width: draft.width,
    height: draft.height,
    color: draft.color,
  });

  const baseMap: Record<string, number> = {
    draairaam: 80,
    kipraam: 70,
    schuifraam: 120,
    deur: 150,
  };

  const parsedExtras: string[] = (() => {
    if (!draft.extras) {
      return [];
    }

    try {
      const parsed = JSON.parse(draft.extras);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item)).filter(Boolean);
      }
    } catch {
      // Keep fallback behaviour for non-JSON extras values.
    }

    return draft.extras
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  })();

  const base = baseMap[draft.type] ?? 60;
  const optionsCost = parsedExtras.length * 12;
  const unitPrice = roundPrice(base + materialPricing.totalPrice + optionsCost);
  const marginRate = Number(user?.margin ?? 0.15);
  const totalPricing = calculatePriceWithMargin(unitPrice, marginRate);

  const quote = await prisma.quote.create({
    data: {
      installerId,
      status: "DRAFT",
      totalPrice: new Prisma.Decimal(totalPricing.total),
      items: {
        create: {
          type: draft.type,
          width: draft.width,
          height: draft.height,
          color: draft.color,
          glass: draft.glass ?? "Dubbel glas",
          options: JSON.stringify(parsedExtras),
          unitPrice: new Prisma.Decimal(totalPricing.price),
          totalPrice: new Prisma.Decimal(totalPricing.total),
        },
      },
    },
  });

  return {
    quoteId: quote.id,
    draftId: draft.id,
    unitPrice: totalPricing.price,
    margin: totalPricing.margin,
    totalPrice: totalPricing.total,
  };
}
