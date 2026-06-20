import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";

type AddQuoteItemRequestBody = {
  quoteId?: string;
  type?: string;
  material?: string;
  width?: number | string;
  height?: number | string;
  quantity?: number | string;
  color?: string;
  glass?: string;
  options?: Prisma.InputJsonValue | string;
  unitPrice?: number | string;
  totalPrice?: number | string;
};

function toStringValue(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return "";
}

function toNumberValue(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : NaN;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  return NaN;
}

function parseJsonValue(value: AddQuoteItemRequestBody["options"]): Prisma.InputJsonValue {
  if (value === undefined || value === null || value === "") {
    return {};
  }

  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value) as Prisma.InputJsonValue;
  } catch {
    return value;
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<Record<string, never>> }
) {
  await context.params;
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = (await req.json()) as AddQuoteItemRequestBody;
  const installerId = session.user.id as string;
  const quoteId = toStringValue(body.quoteId);
  const type = toStringValue(body.type);
  const material = toStringValue(body.material);
  const width = toNumberValue(body.width);
  const height = toNumberValue(body.height);
  const quantity = toNumberValue(body.quantity || 1);
  const color = toStringValue(body.color);
  const glass = toStringValue(body.glass);
  const options = parseJsonValue(body.options);
  const unitPrice = toNumberValue(body.unitPrice);
  const totalPrice = toNumberValue(body.totalPrice);

  if (
    !type ||
    !Number.isFinite(width) || width <= 0 ||
    !Number.isFinite(height) || height <= 0 ||
    !Number.isFinite(unitPrice) || unitPrice <= 0 ||
    !Number.isFinite(totalPrice) || totalPrice <= 0 ||
    !Number.isFinite(quantity) || quantity <= 0
  ) {
    return NextResponse.json(
      { error: "Missing or invalid quote item data." },
      { status: 400 }
    );
  }

  const unitPriceDecimal = new Prisma.Decimal(unitPrice.toString());
  const totalPriceDecimal = new Prisma.Decimal(totalPrice.toString());

  let quote = null;

  if (quoteId) {
    quote = await prisma.quote.findFirst({
      where: {
        id: quoteId,
        installerId,
      },
    });
  }

  if (!quote) {
    quote = await prisma.quote.findFirst({
      where: {
        installerId,
        items: {
          none: {},
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  if (!quote) {
    quote = await prisma.quote.create({
      data: {
        installerId,
        totalPrice: new Prisma.Decimal(0),
      },
    });
  }

  await prisma.quoteItem.create({
    data: {
      quoteId: quote.id,
      type,
      width,
      height,
      ...(material ? { material } : {}),
      color,
      glass,
      options,
      unitPrice: unitPriceDecimal,
      totalPrice: totalPriceDecimal,
    },
  });

  await prisma.quote.update({
    where: { id: quote.id },
    data: {
      totalPrice: {
        increment: totalPriceDecimal,
      },
    },
  });

  return NextResponse.json({ quoteId: quote.id });
}
