"use server";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

export async function exportQuoteToPdfAndSave(quoteId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    throw new Error("Unauthorized");
  }

  const installerId = String(session.user.id ?? "");
  const safeQuoteId = String(quoteId ?? "").trim();

  if (!safeQuoteId) {
    throw new Error("Missing quoteId");
  }

  const quote = await prisma.quote.findFirst({
    where: {
      id: safeQuoteId,
      installerId,
    },
    include: {
      items: true,
    },
  });

  if (!quote) {
    throw new Error("Quote not found");
  }

  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let cursorY = 800;

  function writeLine(text: string, opts?: { size?: number; bold?: boolean; indent?: number }) {
    const size = opts?.size ?? 11;
    const selectedFont = opts?.bold ? fontBold : font;
    const indent = opts?.indent ?? 50;

    page.drawText(text, {
      x: indent,
      y: cursorY,
      size,
      font: selectedFont,
      color: rgb(0.1, 0.12, 0.16),
    });

    cursorY -= size + 8;
  }

  writeLine("FrameFlow Offerte", { size: 18, bold: true });
  writeLine(`Offerte ID: ${quote.id}`, { bold: true });
  writeLine(`Status: ${quote.status}`);
  writeLine(`Aangemaakt op: ${new Date(quote.createdAt).toLocaleDateString("nl-NL")}`);
  writeLine("");

  writeLine("Items", { size: 14, bold: true });

  if (quote.items.length === 0) {
    writeLine("Geen items aanwezig in deze offerte.");
  } else {
    quote.items.forEach((item, index) => {
      writeLine(`${index + 1}. ${item.type} (${item.width} x ${item.height} mm)`, { bold: true });
      writeLine(`Kleur: ${item.color || "-"} | Glas: ${item.glass || "-"}`, { indent: 65 });
      writeLine(`Opties: ${item.options || "-"}`, { indent: 65 });
      writeLine(`Prijs: ${formatCurrency(Number(item.totalPrice || 0))}`, { indent: 65 });
      writeLine("");

      if (cursorY < 90) {
        cursorY = 800;
        page = pdfDoc.addPage([595.28, 841.89]);
      }
    });
  }

  writeLine("Samenvatting", { size: 14, bold: true });
  writeLine(`Totaal: ${formatCurrency(Number(quote.totalPrice || 0))}`, { bold: true });

  const pdfBytes = await pdfDoc.save();
  const pdfBase64 = Buffer.from(pdfBytes).toString("base64");
  const pdfFileName = `offerte-${quote.id}.pdf`;

  await prisma.quote.update({
    where: { id: quote.id },
    data: {
      pdfBase64,
      pdfFileName,
      pdfMimeType: "application/pdf",
      pdfCreatedAt: new Date(),
    },
  });

  revalidatePath(`/installer/quotes/${quote.id}`);
  revalidatePath(`/installateur/offertes/${quote.id}`);
}

export async function convertQuoteToOrderAction(quoteId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    throw new Error("Unauthorized");
  }

  const installerId = String(session.user.id ?? "");
  const safeQuoteId = String(quoteId ?? "").trim();

  if (!safeQuoteId) {
    throw new Error("Missing quoteId");
  }

  const result = await prisma.$transaction(async (tx) => {
    const quote = await tx.quote.findFirst({
      where: {
        id: safeQuoteId,
        installerId,
      },
      include: {
        items: true,
      },
    });

    if (!quote) {
      throw new Error("Quote not found");
    }

    const order = await tx.order.create({
      data: {
        installerId,
        status: "in_behandeling",
        totalPrice: quote.totalPrice,
        items: {
          create: quote.items.map((item) => ({
            type: item.type,
            width: item.width,
            height: item.height,
            color: item.color,
            glass: item.glass,
            options: item.options,
            quantity: 1,
            profileType: "",
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
      },
    });

    return {
      quoteId: quote.id,
      orderId: order.id,
      status: order.status,
      createdItems: quote.items.length,
    };
  });

  revalidatePath(`/installer/orders/${result.orderId}`);
  revalidatePath("/installer/orders");
  revalidatePath("/installateur/bestellingen");
  revalidatePath(`/installer/quotes/${result.quoteId}`);

  return result;
}
