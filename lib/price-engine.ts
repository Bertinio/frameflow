import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const IMPORTER_MARGIN_RATE = 0.18;
const INSTALLER_MARGIN_RATE = 0.15;

const EXTRA_OPTION_PRICES = {
  ventilation: 50,
  safety: 75,
  childLock: 40,
  soundProof: 120,
} as const;

export type SurchargeType = "fixed" | "percent";

export type DraftExtras = {
  ventilation: boolean;
  safety: boolean;
  childLock: boolean;
  soundProof: boolean;
};

export type PriceCalculationResult = {
  oppervlakte: number;
  profielPrijs: number;
  glasPrijs: number;
  kleurToeslag: number;
  extraOpties: number;
  importeurPrijs: number;
  installateurPrijs: number;
  totaalPrijs: number;
};

type DraftPricingConfig = {
  id: string;
  installerId: string;
  width: number;
  height: number;
  extras: string | null;
  profile: {
    id: string;
    pricePerM2: Prisma.Decimal;
  };
  color: {
    id: string;
    surchargeType: string;
    surchargeValue: Prisma.Decimal;
  };
  glass: {
    id: string;
    pricePerM2: Prisma.Decimal;
  };
};

type InstallerPriceOverride = {
  profileId: string | null;
  colorId: string | null;
  glassId: string | null;
  customPricePerM2: number | null;
  customSurchargeValue: number | null;
  customGlassPricePerM2: number | null;
};

export type PriceEngineErrorCode =
  | "INVALID_INPUT"
  | "DRAFT_NOT_FOUND"
  | "INCOMPLETE_DRAFT"
  | "MISSING_INSTALLER_ID"
  | "INVALID_DIMENSIONS"
  | "INVALID_SURCHARGE_TYPE"
  | "INVALID_EXTRAS_JSON";

export class PriceEngineError extends Error {
  code: PriceEngineErrorCode;

  constructor(code: PriceEngineErrorCode, message: string) {
    super(message);
    this.name = "PriceEngineError";
    this.code = code;
  }
}

function toNumber(value: Prisma.Decimal | number | string | null | undefined) {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return numeric;
}

function roundToTwo(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function parseSurchargeType(value: string): SurchargeType {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (normalized === "fixed") {
    return "fixed";
  }

  if (normalized === "percent") {
    return "percent";
  }

  throw new PriceEngineError(
    "INVALID_SURCHARGE_TYPE",
    `Unsupported surchargeType: ${value}`,
  );
}

function parseExtras(extrasJson: string | null): DraftExtras {
  if (!extrasJson) {
    return {
      ventilation: false,
      safety: false,
      childLock: false,
      soundProof: false,
    };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(extrasJson);
  } catch {
    throw new PriceEngineError(
      "INVALID_EXTRAS_JSON",
      "ConfigDraft extras contains invalid JSON",
    );
  }

  if (Array.isArray(parsed)) {
    const lookup = new Set(parsed.map((item) => String(item)));
    return {
      ventilation: lookup.has("ventilation"),
      safety: lookup.has("safety"),
      childLock: lookup.has("childLock"),
      soundProof: lookup.has("soundProof"),
    };
  }

  if (typeof parsed === "object" && parsed !== null) {
    const record = parsed as Record<string, unknown>;
    return {
      ventilation: Boolean(record.ventilation),
      safety: Boolean(record.safety),
      childLock: Boolean(record.childLock),
      soundProof: Boolean(record.soundProof),
    };
  }

  throw new PriceEngineError(
    "INVALID_EXTRAS_JSON",
    "ConfigDraft extras must be an object or an array",
  );
}

function calculateExtraOptionsPrice(extras: DraftExtras) {
  let total = 0;

  if (extras.ventilation) {
    total += EXTRA_OPTION_PRICES.ventilation;
  }

  if (extras.safety) {
    total += EXTRA_OPTION_PRICES.safety;
  }

  if (extras.childLock) {
    total += EXTRA_OPTION_PRICES.childLock;
  }

  if (extras.soundProof) {
    total += EXTRA_OPTION_PRICES.soundProof;
  }

  return total;
}

function calculateColorSurcharge(
  surchargeType: SurchargeType,
  surchargeValue: number,
  profielPrijs: number,
  glasPrijs: number,
) {
  if (surchargeType === "fixed") {
    return surchargeValue;
  }

  return (profielPrijs + glasPrijs) * (surchargeValue / 100);
}

function assertValidDimensions(width: number, height: number) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new PriceEngineError(
      "INVALID_DIMENSIONS",
      `Invalid dimensions for draft: width=${width}, height=${height}`,
    );
  }
}

function getProfilePricePerM2(
  draft: DraftPricingConfig,
  overrides: InstallerPriceOverride[],
) {
  const override = overrides.find(
    (item) => item.profileId === draft.profile.id && item.customPricePerM2 !== null,
  );

  if (override) {
    return toNumber(override.customPricePerM2);
  }

  return toNumber(draft.profile.pricePerM2);
}

function getColorSurchargeValue(
  draft: DraftPricingConfig,
  overrides: InstallerPriceOverride[],
) {
  const override = overrides.find(
    (item) => item.colorId === draft.color.id && item.customSurchargeValue !== null,
  );

  if (override) {
    return toNumber(override.customSurchargeValue);
  }

  return toNumber(draft.color.surchargeValue);
}

function getGlassPricePerM2(
  draft: DraftPricingConfig,
  overrides: InstallerPriceOverride[],
) {
  const override = overrides.find(
    (item) => item.glassId === draft.glass.id && item.customGlassPricePerM2 !== null,
  );

  if (override) {
    return toNumber(override.customGlassPricePerM2);
  }

  return toNumber(draft.glass.pricePerM2);
}

async function getDraftPricingConfig(draftId: string): Promise<DraftPricingConfig> {
  const draft = await prisma.configDraft.findUnique({
    where: { id: draftId },
    include: {
      profile: true,
      colorOption: true,
      glassOption: true,
    },
  });

  if (!draft) {
    throw new PriceEngineError("DRAFT_NOT_FOUND", `ConfigDraft not found: ${draftId}`);
  }

  if (!draft.profile || !draft.colorOption || !draft.glassOption) {
    throw new PriceEngineError(
      "INCOMPLETE_DRAFT",
      "ConfigDraft must have profileId, colorOptionId and glassOptionId",
    );
  }

  return {
    id: draft.id,
    installerId: draft.installerId,
    width: draft.width,
    height: draft.height,
    extras: draft.extras,
    profile: {
      id: draft.profile.id,
      pricePerM2: draft.profile.pricePerM2,
    },
    color: {
      id: draft.colorOption.id,
      surchargeType: draft.colorOption.surchargeType,
      surchargeValue: draft.colorOption.surchargeValue,
    },
    glass: {
      id: draft.glassOption.id,
      pricePerM2: draft.glassOption.pricePerM2,
    },
  };
}

async function getInstallerPriceOverrides(
  installerId: string,
): Promise<InstallerPriceOverride[]> {
  if (!installerId) {
    throw new PriceEngineError("MISSING_INSTALLER_ID", "ConfigDraft has no installerId");
  }

  const records = await prisma.installerPrice.findMany({
    where: { installerId },
    orderBy: {
      createdAt: "desc",
    },
  });

  return records.map((record) => ({
    profileId: record.profileId,
    colorId: record.colorId,
    glassId: record.glassId,
    customPricePerM2: record.customPricePerM2,
    customSurchargeValue: record.customSurchargeValue,
    customGlassPricePerM2: record.customGlassPricePerM2,
  }));
}

export async function calculatePrice(draftId: string): Promise<PriceCalculationResult> {
  const safeDraftId = String(draftId ?? "").trim();

  if (!safeDraftId) {
    throw new PriceEngineError("INVALID_INPUT", "draftId is required");
  }

  const draft = await getDraftPricingConfig(safeDraftId);
  const overrides = await getInstallerPriceOverrides(draft.installerId);

  const width = toNumber(draft.width);
  const height = toNumber(draft.height);
  assertValidDimensions(width, height);

  const gekozenProfielPrijsPerM2 = getProfilePricePerM2(draft, overrides);
  const gekozenGlasPrijsPerM2 = getGlassPricePerM2(draft, overrides);
  const gekozenKleurToeslagWaarde = getColorSurchargeValue(draft, overrides);

  const oppervlakteRaw = (width * height) / 1_000_000;
  const profielPrijsRaw = oppervlakteRaw * gekozenProfielPrijsPerM2;
  const glasPrijsRaw = oppervlakteRaw * gekozenGlasPrijsPerM2;

  const surchargeType = parseSurchargeType(draft.color.surchargeType);
  const kleurToeslagRaw = calculateColorSurcharge(
    surchargeType,
    gekozenKleurToeslagWaarde,
    profielPrijsRaw,
    glasPrijsRaw,
  );

  const extras = parseExtras(draft.extras);
  const extraOptiesRaw = calculateExtraOptionsPrice(extras);

  const netto = profielPrijsRaw + glasPrijsRaw + kleurToeslagRaw + extraOptiesRaw;
  const importeurPrijsRaw = netto * (1 + IMPORTER_MARGIN_RATE);
  const installateurPrijsRaw = importeurPrijsRaw * (1 + INSTALLER_MARGIN_RATE);

  const oppervlakte = roundToTwo(oppervlakteRaw);
  const profielPrijs = roundToTwo(profielPrijsRaw);
  const glasPrijs = roundToTwo(glasPrijsRaw);
  const kleurToeslag = roundToTwo(kleurToeslagRaw);
  const extraOpties = roundToTwo(extraOptiesRaw);
  const importeurPrijs = roundToTwo(importeurPrijsRaw);
  const installateurPrijs = roundToTwo(installateurPrijsRaw);
  const totaalPrijs = installateurPrijs;

  return {
    oppervlakte,
    profielPrijs,
    glasPrijs,
    kleurToeslag,
    extraOpties,
    importeurPrijs,
    installateurPrijs,
    totaalPrijs,
  };
}
