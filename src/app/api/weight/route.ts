import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  weightKg: z.number().min(30).max(300),
  note: z.string().max(200).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  await prisma.weightLog.create({
    data: { userId: session.user.id, weightKg: parsed.data.weightKg, note: parsed.data.note },
  });
  await prisma.profile.update({
    where: { userId: session.user.id },
    data: { weightKg: parsed.data.weightKg },
  });
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const logs = await prisma.weightLog.findMany({
    where: { userId: session.user.id },
    orderBy: { loggedAt: "desc" },
    take: 60,
  });
  return NextResponse.json({ logs });
}
