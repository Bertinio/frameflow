"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export type RolluikPriceBreakdown = {
  oppervlakte: number;
  basis: number;
  motor: number;
  kleur: number;
  fabrikantPrijs: number;
  marge: number;
  kleinMateriaal: number;
  arbeid: number;
  totaal: number;
};

export type InstallerSettingsView = {
  installerId: string;
  marginPercent: number;
  hourlyRate: number;
  smallMaterialCost: number;
  defaultLaborHours: number;
};

type SurchargeType = "percent" | "fixed";

class RolluikFlowError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "RolluikFlowError";
  }
}

function toNumber(value: Prisma.Decimal | number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return parsed;
}

function roundToTwo(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function parsePercent(value: FormDataEntryValue | null) {
  const parsed = Number(value ?? NaN);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    return null;
  }
  return parsed;
}

function parsePositiveNumber(value: FormDataEntryValue | null) {
  const parsed = Number(value ?? NaN);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
}

function parseSurchargeType(value: string): SurchargeType {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (normalized === "percent") {
    return "percent";
  }

  if (normalized === "fixed") {
    return "fixed";
  }

  throw new RolluikFlowError(
    "INVALID_SURCHARGE_TYPE",
    `Unsupported surchargeType: ${value}`,
  );
}

async function requireInstaller() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    redirect("/installateur/login");
  }

  const installerId = String(session.user.id ?? "").trim();

  if (!installerId) {
    throw new RolluikFlowError("MISSING_INSTALLER", "Installer id ontbreekt in sessie");
  }

  return installerId;
}

async function getOrCreateInstallerSettings(installerId: string) {
  const existing = await prisma.installerSettings.findUnique({
    where: { installerId },
  });

  if (existing) {
    return existing;
  }

  return prisma.installerSettings.create({
    data: {
      installerId,
      marginPercent: 15,
      hourlyRate: 65,
      smallMaterialCost: 35,
      defaultLaborHours: 2,
    },
  });
}

export async function getInstallerSettings(): Promise<InstallerSettingsView> {
  const installerId = await requireInstaller();
  const settings = await getOrCreateInstallerSettings(installerId);

  return {
    installerId,
    marginPercent: settings.marginPercent,
    hourlyRate: settings.hourlyRate,
    smallMaterialCost: settings.smallMaterialCost,
    defaultLaborHours: settings.defaultLaborHours,
  };
}

export async function updateInstallerSettings(formData: FormData) {
  const installerId = await requireInstaller();

  const marginPercent = parsePercent(formData.get("marginPercent"));
  const hourlyRate = parsePositiveNumber(formData.get("hourlyRate"));
  const smallMaterialCost = parsePositiveNumber(formData.get("smallMaterialCost"));
  const defaultLaborHours = parsePositiveNumber(formData.get("defaultLaborHours"));

  if (
    marginPercent === null ||
    hourlyRate === null ||
    smallMaterialCost === null ||
    defaultLaborHours === null
  ) {
    throw new RolluikFlowError("INVALID_SETTINGS", "Ongeldige pricing instellingen");
  }

  await prisma.installerSettings.upsert({
    where: { installerId },
    update: {
      marginPercent,
      hourlyRate,
      smallMaterialCost,
      defaultLaborHours,
    },
    create: {
      installerId,
      marginPercent,
      hourlyRate,
      smallMaterialCost,
      defaultLaborHours,
    },
  });

  revalidatePath("/installer/settings/pricing");
  revalidatePath("/installer/rolluiken");
  redirect("/installer/settings/pricing");
}

export async function calculateRolluikPrice(
  draftId: string,
): Promise<RolluikPriceBreakdown> {
  const installerId = await requireInstaller();
  const safeDraftId = String(draftId ?? "").trim();

  if (!safeDraftId) {
    throw new RolluikFlowError("INVALID_DRAFT_ID", "draftId is verplicht");
  }

  const draft = await prisma.rolluikDraft.findFirst({
    where: {
      id: safeDraftId,
      installerId,
    },
    include: {
      lamelType: true,
      colorCategory: true,
      motor: true,
    },
  });

  if (!draft) {
    throw new RolluikFlowError("DRAFT_NOT_FOUND", "RolluikDraft niet gevonden");
  }

  const settings = await getOrCreateInstallerSettings(installerId);

  const width = toNumber(draft.width);
  const height = toNumber(draft.height);

  if (width <= 0 || height <= 0) {
    throw new RolluikFlowError("INVALID_DIMENSIONS", "Breedte/hoogte moeten > 0 zijn");
  }

  const oppervlakte = (width * height) / 1_000_000;
  const basis = oppervlakte * toNumber(draft.lamelType.pricePerM2);

  const motorPriceFromDraft = draft.motor ? toNumber(draft.motor.price) : 0;
  let motorPrice = motorPriceFromDraft;

  if (!draft.motor && draft.motorType) {
    const fallbackMotor = await prisma.rolluikMotor.findUnique({
      where: { type: draft.motorType },
      select: { price: true },
    });

    motorPrice = fallbackMotor ? toNumber(fallbackMotor.price) : 0;
  }

  const surchargeType = parseSurchargeType(draft.colorCategory.surchargeType);
  const surchargeValue = toNumber(draft.colorCategory.surchargeValue);
  const colorBase = basis + motorPrice;
  const kleur =
    surchargeType === "percent"
      ? colorBase * (surchargeValue / 100)
      : surchargeValue;

  const fabrikantPrijs = basis + motorPrice + kleur;
  const marge = fabrikantPrijs * (settings.marginPercent / 100);
  const kleinMateriaal = settings.smallMaterialCost;
  const arbeid = settings.defaultLaborHours * settings.hourlyRate;
  const totaal = fabrikantPrijs + marge + kleinMateriaal + arbeid;

  return {
    oppervlakte: roundToTwo(oppervlakte),
    basis: roundToTwo(basis),
    motor: roundToTwo(motorPrice),
    kleur: roundToTwo(kleur),
    fabrikantPrijs: roundToTwo(fabrikantPrijs),
    marge: roundToTwo(marge),
    kleinMateriaal: roundToTwo(kleinMateriaal),
    arbeid: roundToTwo(arbeid),
    totaal: roundToTwo(totaal),
  };
}
