"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const ALLOWED_STATUSES = ["in_behandeling", "geproduceerd", "geleverd"] as const;

type OrderStatus = (typeof ALLOWED_STATUSES)[number];

export async function updateOrderStatusAction(orderId: string, nextStatus: OrderStatus) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    throw new Error("Unauthorized");
  }

  const installerId = String(session.user.id ?? "");
  const safeOrderId = String(orderId ?? "").trim();

  if (!safeOrderId) {
    throw new Error("Missing orderId");
  }

  if (!ALLOWED_STATUSES.includes(nextStatus)) {
    throw new Error("Invalid order status");
  }

  const order = await prisma.order.findFirst({
    where: {
      id: safeOrderId,
      installerId,
    },
    select: { id: true },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: nextStatus,
    },
  });

  revalidatePath(`/installer/orders/${order.id}`);
  revalidatePath("/installer/orders");
  revalidatePath("/installateur/bestellingen");
}
