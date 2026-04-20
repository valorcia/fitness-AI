import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { GeneratedPlan } from "@/services/plan-conversational";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const schema = z.object({
  proposalId: z.string().cuid(),
  replaceExisting: z.boolean().default(true),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const proposal = await prisma.planProposal.findFirst({
    where: { id: parsed.data.proposalId, userId: session.user.id, status: "PENDING_USER" },
  });
  if (!proposal) {
    return NextResponse.json({ error: "Proposition introuvable ou expirée" }, { status: 404 });
  }

  const plan = proposal.payload as unknown as GeneratedPlan;

  const slugs = Array.from(new Set(plan.sessions.flatMap((s) => s.blocks.map((b) => b.exercise))));
  const exercises = await prisma.exercise.findMany({ where: { slug: { in: slugs } } });
  const slugToId = new Map(exercises.map((e) => [e.slug, e.id]));

  try {
    const startDate = new Date();
    await prisma.$transaction(async (tx) => {
      if (parsed.data.replaceExisting) {
        await tx.workout.deleteMany({
          where: { userId: session.user.id, status: { in: ["PLANNED"] } },
        });
      }
      const created = await tx.trainingPlan.create({
        data: {
          userId: session.user.id,
          name: plan.name,
          summary: plan.summary,
          weeks: plan.weeks,
          sessionsPerWeek: plan.sessionsPerWeek,
          goal: plan.goal,
          payload: plan as unknown as object,
          startDate,
          workouts: {
            create: plan.sessions.map((s) => ({
              userId: session.user.id,
              type: s.type,
              scheduledFor: new Date(startDate.getTime() + s.dayOffset * 24 * 3600 * 1000),
              status: "PLANNED",
              sets: {
                create: s.blocks
                  .filter((b) => slugToId.has(b.exercise))
                  .map((b, i) => ({
                    exerciseId: slugToId.get(b.exercise)!,
                    orderIndex: i,
                    targetReps: b.reps,
                    targetSets: b.sets,
                    restSec: b.restSec,
                    targetTempo: b.tempo,
                  })),
              },
            })),
          },
        },
      });
      await tx.planProposal.update({
        where: { id: proposal.id },
        data: { status: "ACCEPTED", appliedPlanId: created.id },
      });
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    logger.error("plan_apply_failed", { err: e instanceof Error ? e.message : String(e) });
    return NextResponse.json({ error: "Application impossible" }, { status: 500 });
  }
}
