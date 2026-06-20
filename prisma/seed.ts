import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const profiles: Prisma.ProfileCreateInput[] = [
  { name: "Aliplast Star75", pricePerM2: new Prisma.Decimal(260) },
  { name: "Aliplast Genesis 75", pricePerM2: new Prisma.Decimal(240) },
  { name: "Aliplast MaxLight", pricePerM2: new Prisma.Decimal(285) },
  { name: "Reynaers Masterline 8", pricePerM2: new Prisma.Decimal(310) },
  { name: "Reynaers SlimLine 38", pricePerM2: new Prisma.Decimal(295) },
  { name: "Reynaers CS77", pricePerM2: new Prisma.Decimal(270) },
  { name: "Aliplast Ideal 4000", pricePerM2: new Prisma.Decimal(185) },
  { name: "Aliplast Ideal 7000", pricePerM2: new Prisma.Decimal(210) },
];

const colorOptions: Prisma.ColorOptionCreateInput[] = [
  {
    name: "Wit",
    surchargeType: "percent",
    surchargeValue: new Prisma.Decimal(0),
  },
  {
    name: "Creme",
    surchargeType: "percent",
    surchargeValue: new Prisma.Decimal(5),
  },
  {
    name: "Antraciet",
    surchargeType: "percent",
    surchargeValue: new Prisma.Decimal(12),
  },
  {
    name: "Houtlook",
    surchargeType: "percent",
    surchargeValue: new Prisma.Decimal(18),
  },
];

const glassOptions: Prisma.GlassOptionCreateInput[] = [
  { name: "Dubbel glas", pricePerM2: new Prisma.Decimal(150) },
  { name: "Triple glas", pricePerM2: new Prisma.Decimal(250) },
  { name: "Superisolerend glas", pricePerM2: new Prisma.Decimal(350) },
];

async function main() {
  console.log("[seed] Start seeding raamconfigurator referentiedata...");

  await prisma.$transaction([
    prisma.profile.deleteMany(),
    prisma.colorOption.deleteMany(),
    prisma.glassOption.deleteMany(),
  ]);

  const createdProfiles = await prisma.$transaction(
    profiles.map((data) => prisma.profile.create({ data })),
  );

  const createdColors = await prisma.$transaction(
    colorOptions.map((data) => prisma.colorOption.create({ data })),
  );

  const createdGlass = await prisma.$transaction(
    glassOptions.map((data) => prisma.glassOption.create({ data })),
  );

  const profileCount = createdProfiles.length;
  const colorCount = createdColors.length;
  const glassCount = createdGlass.length;

  console.log(`[seed] Profiles seeded: ${profileCount}`);
  console.log(`[seed] Color options seeded: ${colorCount}`);
  console.log(`[seed] Glass options seeded: ${glassCount}`);
  console.log("[seed] Klaar.");
}

main()
  .catch((error) => {
    console.error("[seed] Fout tijdens seeden:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("[seed] Prisma disconnected.");
  });
