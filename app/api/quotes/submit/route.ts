import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function parseRequestBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return request.json();
  }

  const formData = await request.formData();
  const body: Record<string, string> = {};

  formData.forEach((value, key) => {
    if (typeof value === "string") {
      body[key] = value;
    }
  });

  return body;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await parseRequestBody(request);
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
