import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<Record<string, never>> }
) {
  await context.params;
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { quoteId?: string };
  const quoteId = String(body.quoteId ?? "").trim();
  const installerId = session.user.id as string;

  if (!quoteId) {
    return NextResponse.json({ error: "Missing quoteId" }, { status: 400 });
  }

  const quote = await prisma.quote.findFirst({
    where: {
      id: quoteId,
      installerId,
    },
  });

  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  await prisma.quote.update({
    where: { id: quoteId },
    data: {
      status: "SUBMITTED",
    },
  });

  return NextResponse.json({ quoteId, status: "SUBMITTED" });
}
