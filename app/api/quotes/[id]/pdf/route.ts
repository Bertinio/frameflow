import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  void req;
  const { id } = await params;
  const pdfBuffer = await generatePdfForQuote(id);

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="quote-${id}.pdf"`,
    },
  });
}

async function generatePdfForQuote(id: string) {
  const quote = await prisma.quote.findUnique({
    where: { id },
    select: {
      pdfBase64: true,
    },
  });

  if (!quote?.pdfBase64) {
    throw new Error("PDF not available for this quote");
  }

  return Buffer.from(quote.pdfBase64, "base64");
}
