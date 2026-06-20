"use server";

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

export async function createDraft(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    redirect("/installateur/login");
  }

  const installerId = String(session.user.id ?? "");
  const type = String(formData.get("type") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim();
  const width = parsePositiveInt(formData.get("width"));
  const height = parsePositiveInt(formData.get("height"));

  if (!installerId || !type || !color || !width || !height) {
    throw new Error("Ongeldige configuratie");
  }

  const draft = await prisma.configDraft.create({
    data: {
      installerId,
      type,
      width,
      height,
      color,
    },
  });

  redirect(`/installer/calculator/glass/${draft.id}`);
}
