"use server";

import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

function parsePositiveInt(value: FormDataEntryValue | null) {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return Math.round(parsed);
}

function parseNonNegativeNumber(value: FormDataEntryValue | null) {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
}

function parseOptions(value: FormDataEntryValue | null) {
  const raw = String(value ?? "[]");

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item));
    }
  } catch {
    return [];
  }

  return [];
}

export async function saveConfigurationAsQuoteDraft(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    redirect("/installateur/login");
  }

  const installerId = String(session.user.id ?? "");
  const quoteIdInput = String(formData.get("quoteId") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim();
  const glass = String(formData.get("glass") ?? "").trim();
  const width = parsePositiveInt(formData.get("width"));
  const height = parsePositiveInt(formData.get("height"));
  const unitPrice = parseNonNegativeNumber(formData.get("unitPrice"));
  const totalPrice = parseNonNegativeNumber(formData.get("totalPrice"));
  const options = parseOptions(formData.get("options"));

  if (!installerId || !type || !width || !height || unitPrice === null || totalPrice === null) {
    redirect("/installer/calculator/type");
  }

  const unitPriceDecimal = new Prisma.Decimal(unitPrice);
  const totalPriceDecimal = new Prisma.Decimal(totalPrice);

  await prisma.$transaction(async (tx) => {
    let quote = null;

    if (quoteIdInput) {
      quote = await tx.quote.findFirst({
        where: {
          id: quoteIdInput,
          installerId,
          status: "DRAFT",
        },
      });
    }

    if (!quote) {
      quote = await tx.quote.findFirst({
        where: {
          installerId,
          status: "DRAFT",
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    if (!quote) {
      quote = await tx.quote.create({
        data: {
          installerId,
          status: "DRAFT",
          totalPrice: new Prisma.Decimal(0),
        },
      });
    }

    await tx.quoteItem.create({
      data: {
        quoteId: quote.id,
        type,
        width,
        height,
        color,
        glass,
        options: JSON.stringify(options),
        unitPrice: unitPriceDecimal,
        totalPrice: totalPriceDecimal,
      },
    });

    await tx.quote.update({
      where: { id: quote.id },
      data: {
        totalPrice: {
          increment: totalPriceDecimal,
        },
      },
    });
  });

  redirect("/installer/quotes/current");
}
