"use server";

import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

function parseMargin(value: FormDataEntryValue | null) {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    return null;
  }
  return parsed;
}

export async function updateInstallerSettingsAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    redirect("/installateur/login");
  }

  const userId = String(session.user.id ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const margin = parseMargin(formData.get("margin"));

  if (!userId || !name || !email || margin === null) {
    throw new Error("Ongeldige instellingen");
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      email,
      NOT: {
        id: userId,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    throw new Error("E-mailadres is al in gebruik");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      email,
      margin: new Prisma.Decimal(margin),
    },
  });

  revalidatePath("/installer/settings");
  revalidatePath("/installateur/settings");
  revalidatePath("/installer/dashboard");
  revalidatePath("/installateur/dashboard");
}
