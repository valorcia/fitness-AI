import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeAdjustment } from "@/services/adaptive-engine";

const schema = z.object({
  difficulty: z.number().int().min(1).max(10),
  pain: z.boolean(),
  soreness: z.number().int().min(0).max(10),
  motivation: z.number().int().min(1).max(10),
  energy: z.number().int().min(1).max(10),
  comment: z.string().max(500).optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const workout = await prisma.workout.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!workout) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const feedback = await prisma.workoutFeedback.upsert({
    where: { workoutId: id },
    update: parsed.data,
    create: { workoutId: id, userId: session.user.id, ...parsed.data },
  });

  const adjustment = computeAdjustment(feedback, workout);

  await prisma.notification.create({
    data: {
      userId: session.user.id,
      title: "Plan ajusté",
      body: adjustment.recommendation,
    },
  });

  return NextResponse.json({ ok: true, adjustment });
}
