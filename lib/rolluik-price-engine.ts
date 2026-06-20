import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const INSTALLER_MARGIN_RATE = 0.15;

export type RolluikSurchargeType = "percent" | "fixed";

export type RolluikPriceBreakdown = {
  oppervlakte: number;
  basis: number;
  motor: number;
  kleur: number;
  montage: number;
  totaal: number;
};

export type RolluikPriceErrorCode =
  | "INVALID_INPUT"
  | "DRAFT_NOT_FOUND"
  | "INVALID_DIMENSIONS"
  | "INVALID_SURCHARGE_TYPE"
  | "MISSING_INSTALLER_ID";

export class RolluikPriceError extends Error {
  code: RolluikPriceErrorCode;

  constructor(code: RolluikPriceErrorCode, message: string) {
    super(message);
    this.name = "RolluikPriceError";
    this.code = code;
  }
}

type RolluikDraftConfig = {
  id: string;
  installerId: string;
  width: number;
  height: number;
  motorType: string;
  montageType: string;
  lamelType: {
    id: string;
    pricePerM2: Prisma.Decimal;
  };
  colorCategory: {
    id: string;
    surchargeType: string;
    surchargeValue: Prisma.Decimal;
  };
};

type InstallerRolluikPriceOverride = {
  lamelTypeId: string | null;
  colorId: string | null;
  motorType: string | null;
  montageType: string | null;
  customPricePerM2: number | null;
  customSurchargeValue: number | null;
  customMotorPrice: number | null;
  customMontagePrice: number | null;
};

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

function assertPositiveDimensions(width: number, height: number) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new RolluikPriceError(
      "INVALID_DIMENSIONS",
      `Invalid rolluik dimensions: width=${width}, height=${height}`,
    );
  }
}

function parseSurchargeType(value: string): RolluikSurchargeType {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (normalized === "percent") {
    return "percent";
  }

  if (normalized === "fixed") {
    return "fixed";
  }

  throw new RolluikPriceError(
    "INVALID_SURCHARGE_TYPE",
    `Unsupported surchargeType: ${value}`,
  );
}

function pickLamelPricePerM2(
  draft: RolluikDraftConfig,
  overrides: InstallerRolluikPriceOverride[],
) {
  const override = overrides.find(
    (item) => item.lamelTypeId === draft.lamelType.id && item.customPricePerM2 !== null,
  );

  if (override) {
    return toNumber(override.customPricePerM2);
  }

  return toNumber(draft.lamelType.pricePerM2);
}

function pickColorSurchargeValue(
  draft: RolluikDraftConfig,
  overrides: InstallerRolluikPriceOverride[],
) {
  const override = overrides.find(
    (item) => item.colorId === draft.colorCategory.id && item.customSurchargeValue !== null,
  );

  if (override) {
    return toNumber(override.customSurchargeValue);
  }

  return toNumber(draft.colorCategory.surchargeValue);
}

function pickMotorPrice(
  draft: RolluikDraftConfig,
  overrides: InstallerRolluikPriceOverride[],
) {
  const normalizedMotorType = draft.motorType.trim().toLowerCase();

  const override = overrides.find(
    (item) =>
      item.motorType?.trim().toLowerCase() === normalizedMotorType &&
      item.customMotorPrice !== null,
  );

  if (override) {
    return toNumber(override.customMotorPrice);
  }

  return 0;
}

function pickMontagePrice(
  draft: RolluikDraftConfig,
  overrides: InstallerRolluikPriceOverride[],
) {
  const normalizedMontageType = draft.montageType.trim().toLowerCase();

  const override = overrides.find(
    (item) =>
      item.montageType?.trim().toLowerCase() === normalizedMontageType &&
      item.customMontagePrice !== null,
  );

  if (override) {
    return toNumber(override.customMontagePrice);
  }

  return 0;
}

function calculateColorSurcharge(
  surchargeType: RolluikSurchargeType,
  surchargeValue: number,
  basis: number,
) {
  if (surchargeType === "fixed") {
    return surchargeValue;
  }

  return basis * (surchargeValue / 100);
}

async function getRolluikDraftConfig(draftId: string): Promise<RolluikDraftConfig> {
  const draft = await prisma.rolluikDraft.findUnique({
    where: { id: draftId },
    include: {
      lamelType: true,
      colorCategory: true,
    },
  });

  if (!draft) {
    throw new RolluikPriceError("DRAFT_NOT_FOUND", `RolluikDraft not found: ${draftId}`);
  }

  return {
    id: draft.id,
    installerId: draft.installerId,
    width: draft.width,
    height: draft.height,
    motorType: draft.motorType,
    montageType: draft.montageType,
    lamelType: {
      id: draft.lamelType.id,
      pricePerM2: draft.lamelType.pricePerM2,
    },
    colorCategory: {
      id: draft.colorCategory.id,
      surchargeType: draft.colorCategory.surchargeType,
      surchargeValue: draft.colorCategory.surchargeValue,
    },
  };
}

async function getInstallerRolluikOverrides(
  installerId: string,
): Promise<InstallerRolluikPriceOverride[]> {
  if (!installerId) {
    throw new RolluikPriceError("MISSING_INSTALLER_ID", "RolluikDraft has no installerId");
  }

  const records = await prisma.installerRolluikPrice.findMany({
    where: { installerId },
    orderBy: {
      createdAt: "desc",
    },
  });

  return records.map((record) => ({
    lamelTypeId: record.lamelTypeId,
    colorId: record.colorId,
    motorType: record.motorType,
    montageType: record.montageType,
    customPricePerM2: record.customPricePerM2,
    customSurchargeValue: record.customSurchargeValue,
    customMotorPrice: record.customMotorPrice,
    customMontagePrice: record.customMontagePrice,
  }));
}

export async function calculateRolluikPrice(
  draftId: string,
): Promise<RolluikPriceBreakdown> {
  const safeDraftId = String(draftId ?? "").trim();

  if (!safeDraftId) {
    throw new RolluikPriceError("INVALID_INPUT", "draftId is required");
  }

  const draft = await getRolluikDraftConfig(safeDraftId);
  const overrides = await getInstallerRolluikOverrides(draft.installerId);

  const width = toNumber(draft.width);
  const height = toNumber(draft.height);
  assertPositiveDimensions(width, height);

  const lamelPrijsPerM2 = pickLamelPricePerM2(draft, overrides);
  const motorPrijs = pickMotorPrice(draft, overrides);
  const montagePrijs = pickMontagePrice(draft, overrides);
  const kleurToeslagWaarde = pickColorSurchargeValue(draft, overrides);
  const surchargeType = parseSurchargeType(draft.colorCategory.surchargeType);

  const oppervlakteRaw = (width * height) / 1_000_000;
  const basisRaw = oppervlakteRaw * lamelPrijsPerM2;
  const kleurRaw = calculateColorSurcharge(surchargeType, kleurToeslagWaarde, basisRaw);

  const totaalZonderMarge = basisRaw + motorPrijs + kleurRaw + montagePrijs;
  const totaalRaw = totaalZonderMarge * (1 + INSTALLER_MARGIN_RATE);

  return {
    oppervlakte: roundToTwo(oppervlakteRaw),
    basis: roundToTwo(basisRaw),
    motor: roundToTwo(motorPrijs),
    kleur: roundToTwo(kleurRaw),
    montage: roundToTwo(montagePrijs),
    totaal: roundToTwo(totaalRaw),
  };
}
