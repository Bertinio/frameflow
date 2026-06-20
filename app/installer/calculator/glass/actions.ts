"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

type DraftView = {
  id: string;
  installerId: string;
  type: string;
  width: number;
  height: number;
  color: string;
  glass: string | null;
  extras: string | null;
  createdAt: Date;
};

async function requireInstaller() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    redirect("/installateur/login");
  }

  return String(session.user.id ?? "");
}

export async function getDraft(draftId: string): Promise<DraftView> {
  const installerId = await requireInstaller();
  const safeDraftId = String(draftId ?? "").trim();

  if (!safeDraftId) {
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

  return draft;
}

export async function updateDraft(draftId: string, formData: FormData) {
  const installerId = await requireInstaller();
  const safeDraftId = String(draftId ?? "").trim();

  if (!safeDraftId) {
    throw new Error("Missing draftId");
  }

  const existing = await prisma.configDraft.findFirst({
    where: {
      id: safeDraftId,
      installerId,
    },
    select: { id: true },
  });

  if (!existing) {
    throw new Error("Draft not found");
  }

  const step = String(formData.get("step") ?? "").trim();
  const nextPath = String(formData.get("nextPath") ?? "").trim();

  if (step === "glass") {
    const glass = String(formData.get("glass") ?? "").trim();

    if (!glass) {
      throw new Error("Kies een glasoptie");
    }

    await prisma.configDraft.update({
      where: { id: safeDraftId },
      data: {
        glass,
      },
    });
  }

  if (step === "extras") {
    const ventilation = formData.get("ventilation") === "on";
    const safety = formData.get("safety") === "on";

    await prisma.configDraft.update({
      where: { id: safeDraftId },
      data: {
        extras: JSON.stringify({ ventilation, safety }),
      },
    });
  }

  if (!nextPath) {
    throw new Error("Missing next path");
  }

  redirect(nextPath);
}
