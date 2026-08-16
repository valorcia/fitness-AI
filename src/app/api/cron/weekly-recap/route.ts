import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { sendWeeklyRecapEmail } from "@/lib/email/templates";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 300;

const PERSONA_NAMES: Record<string, string> = {
  FUN: "Alex",
  STRICT: "Anya",
  ZEN: "Maya",
  MILITARY: "Victor",
  ELITE: "Julian",
};

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!env.CRON_SECRET || auth !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000);

  const activeUserIds = await prisma.workout.findMany({
    where: { status: "COMPLETED", completedAt: { gte: since } },
    select: { userId: true },
    distinct: ["userId"],
  });
  const ids = activeUserIds.map((r) => r.userId);

  const oai = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;
  let sent = 0;
  let failed = 0;

  for (const { userId } of activeUserIds) {
    const [user, prefs, streak, weekWorkouts] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.preference.findUnique({ where: { userId } }),
      prisma.streak.findUnique({ where: { userId } }),
      prisma.workout.findMany({
        where: { userId, status: "COMPLETED", completedAt: { gte: since } },
        select: { durationSec: true, caloriesKcal: true },
      }),
    ]);

    if (!user?.email) { failed++; continue; }

    const wCount = weekWorkouts.length;
    const totalMin = Math.round(weekWorkouts.reduce((a, w) => a + (w.durationSec ?? 0), 0) / 60);
    const totalKcal = weekWorkouts.reduce((a, w) => a + (w.caloriesKcal ?? 0), 0);
    const currentStreak = streak?.current ?? 0;
    const persona = prefs?.coachPersona ?? "FUN";
    const firstName = (user.name ?? user.email.split("@")[0] ?? "Champion").split(" ")[0]!;
    const coachName = PERSONA_NAMES[persona] ?? "Coach";

    let coachQuote = "Continue comme ça, tu es sur la bonne voie !";
    if (oai) {
      try {
        const res = await oai.chat.completions.create({
          model: env.OPENAI_MODEL_COACH,
          max_tokens: 80,
          messages: [
            {
              role: "system",
              content: `Tu es ${coachName}, coach sportif IA de style ${persona}. Génère UN message de motivation court (max 2 phrases) en français pour ${firstName} qui a fait ${wCount} séance(s) cette semaine et a une série de ${currentStreak} jour(s).`,
            },
          ],
        });
        coachQuote = res.choices[0]?.message?.content?.trim() ?? coachQuote;
      } catch { /* use default */ }
    }

    const ok = await sendWeeklyRecapEmail(user.email, {
      firstName,
      coachName,
      workoutsCount: wCount,
      totalMinutes: totalMin,
      caloriesKcal: totalKcal,
      streakDays: currentStreak,
      coachQuote,
    });

    if (ok) sent++; else failed++;
  }

  return NextResponse.json({ sent, failed, total: ids.length });
}
