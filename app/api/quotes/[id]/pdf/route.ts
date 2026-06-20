import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

type Context = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, context: Context) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const installerId = String(session.user.id ?? "");
  const quoteId = String(context.params.id ?? "").trim();

  if (!quoteId) {
    return NextResponse.json({ error: "Missing quoteId" }, { status: 400 });
  }

  const quote = await prisma.quote.findFirst({
    where: {
      id: quoteId,
      installerId,
    },
    select: {
      id: true,
      pdfBase64: true,
      pdfFileName: true,
      pdfMimeType: true,
    },
  });

  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  if (!quote.pdfBase64) {
    return NextResponse.json({ error: "PDF not available" }, { status: 404 });
  }

  const buffer = Buffer.from(quote.pdfBase64, "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": quote.pdfMimeType ?? "application/pdf",
      "Content-Disposition": `attachment; filename="${quote.pdfFileName ?? `offerte-${quote.id}.pdf`}"`,
      "Cache-Control": "no-store",
    },
  });
}
