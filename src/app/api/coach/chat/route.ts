import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic, anthropicModels } from "@/lib/ai/anthropic";
import { rateLimits } from "@/lib/redis";
import { logger } from "@/lib/logger";
import { buildCoachSystem } from "@/lib/coach/system-prompt";
import { retrieveMemories, recordMemories, extractMemoriesFromConversation } from "@/lib/coach/memory";
import { applyHealthFilter } from "@/lib/coach/health-filter";
import { getCurrentCoach } from "@/lib/coach/current-coach";

export const runtime = "nodejs";
export const maxDuration = 60;

const schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000),
      }),
    )
    .min(1)
    .max(40),
});

/**
 * Compute the coach's current relationship level from the user's history.
 * Cheap heuristic — runs every chat call but the queries are all indexed.
 */
async function computeCoachLevel(userId: string): Promise<1 | 2 | 3 | 4 | 5> {
  const [workouts, daysSinceCreation] = await Promise.all([
    prisma.workout.count({ where: { userId, status: "COMPLETED" } }),
    prisma.user
      .findUnique({ where: { id: userId }, select: { createdAt: true } })
      .then((u) =>
        u?.createdAt
          ? Math.floor((Date.now() - u.createdAt.getTime()) / (24 * 3600 * 1000))
          : 0,
      ),
  ]);

  if (daysSinceCreation >= 365) return 5;
  if (daysSinceCreation >= 90 && workouts >= 50) return 4;
  if (workouts >= 30) return 3;
  if (workouts >= 10 || daysSinceCreation >= 14) return 2;
  return 1;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const rl = await rateLimits.coachChat.limit(userId);
  if (!rl.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  if (!anthropic) {
    return NextResponse.json(
      { error: "Le coach IA n'est pas configuré (ANTHROPIC_API_KEY manquant)." },
      { status: 503 },
    );
  }
  const client = anthropic;

  const userMessages = parsed.data.messages;
  const lastUserTurn = [...userMessages].reverse().find((m) => m.role === "user");
  const queryText = lastUserTurn?.content ?? "";

  // ── Fetch everything in parallel ────────────────────────────────────────
  const [profile, health, coach, memories, coachLevel] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.healthProfile.findUnique({ where: { userId } }),
    getCurrentCoach(userId),
    retrieveMemories(userId, queryText, 6),
    computeCoachLevel(userId),
  ]);

  const heightCm = profile?.heightCm;
  const weightKg = profile?.weightKg;
  const bmi = heightCm && weightKg ? weightKg / Math.pow(heightCm / 100, 2) : null;

  const system = buildCoachSystem({
    persona: coach.persona,
    coachName: coach.displayName,
    profile: {
      firstName: profile?.firstName,
      ageYears: profile?.birthDate
        ? Math.floor((Date.now() - profile.birthDate.getTime()) / (365.25 * 24 * 3600 * 1000))
        : null,
      sex: profile?.sex,
      heightCm,
      weightKg,
      bmi,
      fitnessLevel: profile?.fitnessLevel,
      goal: profile?.goal,
      goals: profile?.goals,
      environment: profile?.environment,
      environments: profile?.environments,
      sessionsPerWeek: health?.sessionsPerWeek,
      sessionDurationMin: health?.sessionDurationMin,
      injuries: health?.injuries,
      conditions: health?.conditions,
      coachLevel,
    },
    memories,
  });

  // ── Stream Claude response ──────────────────────────────────────────────
  const encoder = new TextEncoder();
  let collected = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const claudeStream = client.messages.stream({
          model: anthropicModels.coach,
          max_tokens: 800,
          temperature: 0.6,
          system,
          messages: userMessages.map((m) => ({ role: m.role, content: m.content })),
        });

        for await (const event of claudeStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const delta = event.delta.text;
            collected += delta;
            controller.enqueue(encoder.encode(delta));
          }
        }
        controller.close();
      } catch (e) {
        logger.error("coach_chat_stream_failed", {
          error: e instanceof Error ? e.message : String(e),
        });
        controller.enqueue(
          encoder.encode(
            `\n\n[Coach indisponible : ${e instanceof Error ? e.message : "inconnue"}]`,
          ),
        );
        controller.close();
        return;
      }

      // ── Post-stream: safety filter + async memory extraction ─────────────
      const filtered = applyHealthFilter(collected);
      if (filtered.rewrote || filtered.appendedUrgency) {
        logger.warn("coach_chat_safety_rewrite", {
          rewrote: filtered.rewrote,
          urgency: filtered.appendedUrgency,
          userId,
        });
      }

      // Best-effort memory extraction — fire-and-forget so it never blocks
      // the user-facing response.
      const excerpt = userMessages
        .slice(-6)
        .map((m) => `${m.role === "user" ? "Utilisateur" : coach.displayName}: ${m.content}`)
        .concat([`${coach.displayName}: ${collected}`])
        .join("\n");

      Promise.resolve()
        .then(async () => {
          const candidates = await extractMemoriesFromConversation(excerpt);
          if (candidates.length > 0) {
            await recordMemories(userId, candidates, "chat");
          }
        })
        .catch((e) =>
          logger.warn("coach_memory_pipeline_failed", {
            error: e instanceof Error ? e.message : String(e),
          }),
        );
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
