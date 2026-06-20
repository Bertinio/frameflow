"use server";

import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getDraft as getSharedDraft } from "../glass/actions";

export async function getDraft(draftId: string) {
  return getSharedDraft(draftId);
}

function parseExtras(extras: string | null) {
  if (!extras) {
    return { ventilation: false, safety: false };
  }

  try {
    const parsed = JSON.parse(extras);
    return {
      ventilation: Boolean(parsed?.ventilation),
      safety: Boolean(parsed?.safety),
    };
  } catch {
    return { ventilation: false, safety: false };
  }
}

export async function createQuoteFromDraft(draftId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    redirect("/installateur/login");
  }

  const installerId = String(session.user.id ?? "");
  const safeDraftId = String(draftId ?? "").trim();

  if (!installerId || !safeDraftId) {
    throw new Error("Missing draftId");
  }

  const draft = await prisma.configDraft.findFirst({
    where: {
      id: safeDraftId,
      installerId,
    },
  });

  if (!draft) {
    throw new Error("Draft not found");
  }

  const extras = parseExtras(draft.extras);
  const glass = draft.glass ?? "double";
  const totalPrice =
    draft.width * draft.height * 0.001 +
    (glass === "triple" ? 250 : 150) +
    (extras.ventilation ? 50 : 0) +
    (extras.safety ? 75 : 0);

  const quote = await prisma.quote.create({
    data: {
      installerId,
      configId: draft.id,
      status: "DRAFT",
      totalPrice: new Prisma.Decimal(totalPrice),
      items: {
        create: {
          type: draft.type,
          width: draft.width,
          height: draft.height,
          color: draft.color,
          glass,
          options: JSON.stringify(extras),
          unitPrice: new Prisma.Decimal(totalPrice),
          totalPrice: new Prisma.Decimal(totalPrice),
        },
      },
    },
  });

  redirect(`/installer/quotes/${quote.id}`);
}
