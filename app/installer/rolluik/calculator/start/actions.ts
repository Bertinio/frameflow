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

export async function createRolluikDraft(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    redirect("/installateur/login");
  }

  const installerId = String(session.user.id ?? "").trim();
  const width = parsePositiveInt(formData.get("width"));
  const height = parsePositiveInt(formData.get("height"));
  const lamelTypeId = String(formData.get("lamelTypeId") ?? "").trim();
  const colorId = String(formData.get("colorId") ?? "").trim();
  const motorId = String(formData.get("motorId") ?? "").trim();
  const montageType = String(formData.get("montageType") ?? "").trim();

  if (!installerId || !width || !height || !lamelTypeId || !colorId || !motorId || !montageType) {
    throw new Error("Ongeldige rolluik configuratie");
  }

  const motor = await prisma.rolluikMotor.findUnique({
    where: { id: motorId },
    select: {
      id: true,
      type: true,
    },
  });

  if (!motor) {
    throw new Error("Ongeldig motortype");
  }

  const draft = await prisma.rolluikDraft.create({
    data: {
      installerId,
      width,
      height,
      lamelTypeId,
      colorId,
      motorId: motor.id,
      motorType: motor.type,
      montageType,
    },
  });

  redirect(`/installer/rolluiken/summary/${draft.id}`);
}
