import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { trackServer } from "@/lib/analytics/posthog-server";
import { PHEvent } from "@/lib/analytics/events";
import { sendStreakMilestoneEmail } from "@/lib/email/templates";

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
  let newStreak = streak?.current ?? 0;
  if (!streak || !streak.lastActivityOn || streak.lastActivityOn < today) {
    newStreak = (streak?.current ?? 0) + 1;
    await prisma.streak.upsert({
      where: { userId: session.user.id },
      update: {
        current: newStreak,
        longest: Math.max(streak?.longest ?? 0, newStreak),
        lastActivityOn: today,
      },
      create: { userId: session.user.id, current: 1, longest: 1, lastActivityOn: today },
    });
  }

  // Analytics + streak milestone emails (fire-and-forget)
  void trackServer(session.user.id, PHEvent.WORKOUT_COMPLETED, {
    workoutId: id,
    type: workout.type,
    durationSec,
    caloriesKcal: kcal,
    score,
    streak: newStreak,
  });

  const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 365];
  if (STREAK_MILESTONES.includes(newStreak)) {
    void (async () => {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { email: true, profile: { select: { firstName: true } }, preferences: { select: { coachName: true } } },
      });
      if (user?.email) {
        await sendStreakMilestoneEmail(
          user.email,
          user.profile?.firstName ?? "Champion",
          user.preferences?.coachName ?? "Pulse",
          newStreak,
        );
        void trackServer(session.user.id, PHEvent.STREAK_MILESTONE, { streak: newStreak });
      }
    })();
  }

  return NextResponse.json({ ok: true, score });
}
