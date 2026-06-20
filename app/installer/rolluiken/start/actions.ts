"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

function parsePositiveInt(value: FormDataEntryValue | null) {
  const parsed = Number(value ?? NaN);

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

  if (!installerId || !width || !height || !lamelTypeId || !colorId || !motorId) {
    throw new Error("Vul alle verplichte velden in.");
  }

  const [lamelType, colorCategory, motor] = await Promise.all([
    prisma.rolluikLamelType.findUnique({ where: { id: lamelTypeId }, select: { id: true } }),
    prisma.rolluikColorCategory.findUnique({ where: { id: colorId }, select: { id: true } }),
    prisma.rolluikMotor.findUnique({ where: { id: motorId }, select: { id: true, type: true } }),
  ]);

  if (!lamelType || !colorCategory || !motor) {
    throw new Error("Ongeldige configuratiekeuze.");
  }

  const draft = await prisma.rolluikDraft.create({
    data: {
      installerId,
      width,
      height,
      lamelTypeId: lamelType.id,
      colorId: colorCategory.id,
      motorId: motor.id,
      motorType: motor.type,
      montageType: "opbouw",
      extras: null,
    },
  });

  redirect(`/installer/rolluiken/options/${draft.id}`);
}
