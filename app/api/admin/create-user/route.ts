import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { email, password, role } = await req.json();

  if (!email || !password || !role) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ message: "Email bestaat al" }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      passwordHash: hash,
      role,
    },
  });

  return NextResponse.json({ message: "Gebruiker aangemaakt!" });
}
