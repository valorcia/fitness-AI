import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimits } from "@/lib/redis";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
  name: z.string().min(1).max(120).optional(),
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "anon";
  const rl = await rateLimits.auth.limit(`register:${ip}`);
  if (!rl.success) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Email ou mot de passe invalide.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const email = parsed.data.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: { email, name: parsed.data.name ?? null, hashedPassword },
  });
  await prisma.preference.create({ data: { userId: user.id } });
  await prisma.subscription.create({
    data: { userId: user.id, tier: "FREE", status: "ACTIVE" },
  });

  return NextResponse.json({ ok: true });
}
