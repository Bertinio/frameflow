"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function deleteDraftAction(draftId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    throw new Error("Unauthorized");
  }

  const installerId = String(session.user.id ?? "").trim();
  const safeDraftId = String(draftId ?? "").trim();

  if (!installerId || !safeDraftId) {
    throw new Error("Invalid draft id");
  }

  await prisma.configDraft.deleteMany({
    where: {
      id: safeDraftId,
      installerId,
    },
  });

  revalidatePath("/installer/calculator");
}