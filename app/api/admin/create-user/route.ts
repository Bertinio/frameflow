import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
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
