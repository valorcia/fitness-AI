import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const workout = await prisma.workout.findFirst({
    where: { id, userId: session.user.id },
    include: { sets: true },
  });
  if (!workout) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const completedSets = workout.sets.filter((s) => s.completed).length;
  const totalSets = workout.sets.length;
  const score = totalSets === 0 ? 0 : Math.round((completedSets / totalSets) * 100);
  const durationSec = workout.startedAt
    ? Math.max(0, Math.floor((Date.now() - workout.startedAt.getTime()) / 1000))
    : 0;
  const kcal = Math.round(durationSec / 60 * 7.5); // rough

  await prisma.$transaction([
    prisma.workout.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        durationSec,
        caloriesKcal: kcal,
        score,
      },
    }),
    prisma.xPEntry.create({
      data: { userId: session.user.id, amount: 50 + score, reason: `Séance ${workout.type} terminée` },
    }),
  ]);

  // Streak bump (naive: one per day)
  const streak = await prisma.streak.findUnique({ where: { userId: session.user.id } });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (!streak || !streak.lastActivityOn || streak.lastActivityOn < today) {
    await prisma.streak.upsert({
      where: { userId: session.user.id },
      update: {
        current: { increment: 1 },
        longest: Math.max(streak?.longest ?? 0, (streak?.current ?? 0) + 1),
        lastActivityOn: today,
      },
      create: { userId: session.user.id, current: 1, longest: 1, lastActivityOn: today },
    });
  }

  return NextResponse.json({ ok: true, score });
}
