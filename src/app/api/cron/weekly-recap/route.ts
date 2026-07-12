import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { sendWeeklyRecapEmail } from "@/lib/email/templates";
import { openai } from "@/lib/ai/openai";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 min — iterates over many users

// Vercel Cron or CCR Routine calls this every Monday 08:00 UTC
export async function GET(req: Request) {
  // Validate cron secret to prevent unauthorized calls
  const authHeader = req.headers.get("authorization");
  if (env.CRON_SECRET && authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);

  // Fetch all users who completed at least 1 workout last week
  const activeUsers = await prisma.user.findMany({
    where: {
      deletedAt: null,
      workouts: { some: { completedAt: { gte: oneWeekAgo } } },
    },
    select: {
      id: true,
      email: true,
      profile: { select: { firstName: true } },
      preferences: { select: { coachName: true } },
      streaks: { select: { current: true } },
      workouts: {
        where: { completedAt: { gte: oneWeekAgo } },
        select: { durationSec: true, caloriesKcal: true, type: true },
      },
    },
    take: 500,
  });

  let sent = 0;
  let failed = 0;

  for (const user of activeUsers) {
    try {
      const firstName = user.profile?.firstName ?? "Champion";
      const coachName = user.preferences?.coachName ?? "Pulse";
      const workouts = user.workouts;
      const workoutsCompleted = workouts.length;
      const totalMinutes = Math.round(
        workouts.reduce((s, w) => s + (w.durationSec ?? 0), 0) / 60,
      );
      const caloriesBurned = Math.round(
        workouts.reduce((s, w) => s + (w.caloriesKcal ?? 0), 0),
      );
      const currentStreak = user.streaks?.current ?? 0;

      // Most frequent workout type this week
      const typeCount: Record<string, number> = {};
      for (const w of workouts) if (w.type) typeCount[w.type] = (typeCount[w.type] ?? 0) + 1;
      const topExercise = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]?.[0];

      // Generate a brief coach message using OpenAI (GPT-4o-mini)
      let coachMessage = `Tu as réalisé ${workoutsCompleted} séance${workoutsCompleted > 1 ? "s" : ""} cette semaine — continue comme ça !`;
      if (openai) {
        const prompt = `Tu es ${coachName}, coach sportif IA de ${firstName}. En 1 phrase courte et motivante, résume sa semaine : ${workoutsCompleted} séances, ${totalMinutes} min, ${caloriesBurned} kcal, streak de ${currentStreak} jours. Réponds en français, style chaleureux.`;
        const res = await openai.chat.completions.create({
          model: env.OPENAI_MODEL_COACH,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 80,
          temperature: 0.8,
        });
        coachMessage = res.choices[0]?.message?.content?.trim() ?? coachMessage;
      }

      const ok = await sendWeeklyRecapEmail(user.email, {
        firstName,
        coachName,
        workoutsCompleted,
        totalMinutes,
        caloriesBurned,
        currentStreak,
        coachMessage,
        topExercise,
      });

      if (ok) sent++;
      else failed++;
    } catch (err) {
      console.error(`[WeeklyRecap] user ${user.id}`, err);
      failed++;
    }
  }

  return NextResponse.json({ sent, failed, total: activeUsers.length });
}
