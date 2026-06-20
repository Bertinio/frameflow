import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

function fallbackManufacturerName(name: string | null, email: string | null) {
  if (name && name.trim()) {
    return name.trim();
  }

  if (email && email.includes("@")) {
    return email.split("@")[0];
  }

  return "Fabrikant";
}

export async function requireManufacturerContext() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "manufacturer") {
    redirect("/login");
  }

  const userId = String(session.user.id ?? "").trim();

  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const manufacturer = await prisma.manufacturer.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      name: fallbackManufacturerName(user.name, user.email),
    },
  });

  return {
    session,
    user,
    manufacturer,
  };
}
