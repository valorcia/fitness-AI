import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimits } from "@/lib/redis";
import { generateConstrainedPlan, type PlanConstraints } from "@/services/plan-conversational";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 60;

const schema = z.object({
  weeks: z.number().int().min(1).max(16).optional(),
  sessionsPerWeek: z.number().int().min(1).max(7).optional(),
  sessionDurationMin: z.number().int().min(15).max(180).optional(),
  focus: z.string().max(200).optional(),
  avoid: z.array(z.string().max(80)).max(20).optional(),
  daysOff: z.array(z.string()).max(60).optional(),
  intensityBias: z.enum(["light", "balanced", "intense"]).optional(),
  goalOverride: z
    .enum(["WEIGHT_LOSS", "MUSCLE_GAIN", "ENDURANCE", "FITNESS", "HEALTH"])
    .optional(),
  extraContext: z.string().max(1200).optional(),
  startDate: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rl = await rateLimits.coachChat.limit(`plan-propose:${session.user.id}`);
  if (!rl.success) return NextResponse.json({ error: "Rate limit" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const constraints: PlanConstraints = parsed.data;

  const [profile, health, catalog] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
    prisma.healthProfile.findUnique({ where: { userId: session.user.id } }),
    prisma.exercise.findMany({ select: { slug: true, name: true, category: true, equipment: true } }),
  ]);
  if (!profile || !health) {
    return NextResponse.json({ error: "Profil santé requis." }, { status: 400 });
  }

  try {
    const plan = await generateConstrainedPlan({
      profile,
      health,
      exerciseCatalog: catalog,
      constraints,
    });
    const proposal = await prisma.planProposal.create({
      data: {
        userId: session.user.id,
        status: "PENDING_USER",
        summary: plan.summary,
        constraints: constraints as unknown as object,
        payload: plan as unknown as object,
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
      },
    });
    return NextResponse.json({ proposal, plan });
  } catch (e) {
    logger.error("plan_propose_failed", { err: e instanceof Error ? e.message : String(e) });
    return NextResponse.json({ error: "Génération impossible" }, { status: 502 });
  }
}
