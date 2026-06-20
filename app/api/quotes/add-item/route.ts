import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";

function parseJsonValue(value: string): unknown {
  if (!value) {
    return {};
  }

  try {
    return JSON.parse(value);
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

  const body = (await req.json()) as Record<string, unknown>;
  const installerId = session.user.id as string;
  const quoteId = String(body.quoteId ?? "").trim();
  const type = String(body.type ?? "").trim();
  const width = Number(body.width ?? "");
  const height = Number(body.height ?? "");
  const color = String(body.color ?? "").trim();
  const glass = String(body.glass ?? "").trim();
  const options = parseJsonValue(String(body.options ?? ""));
  const unitPrice = String(body.unitPrice ?? "0").trim();
  const totalPrice = String(body.totalPrice ?? "0").trim();

  if (!type || !width || !height || !unitPrice || !totalPrice) {
    return NextResponse.json(
      { error: "Missing or invalid quote item data." },
      { status: 400 }
    );
  }

  const unitPriceDecimal = new Prisma.Decimal(unitPrice);
  const totalPriceDecimal = new Prisma.Decimal(totalPrice);

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
