import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { openai, models } from "@/lib/ai/openai";
import { coachSystemPrompt } from "@/lib/ai/personas";
import { rateLimits } from "@/lib/redis";
import { ENTITLEMENTS } from "@/lib/billing/entitlements";

export const runtime = "nodejs";
export const maxDuration = 60;

const schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().max(4000),
      }),
    )
    .min(1)
    .max(40),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const rl = await rateLimits.coachChat.limit(session.user.id);
  if (!rl.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  if (openai === null) {
    return NextResponse.json(
      { error: "Le coach IA n'est pas configuré (OPENAI_API_KEY manquant)." },
      { status: 503 },
    );
  }
  const client = openai;

  const [profile, prefs, sub] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
    prisma.preference.findUnique({ where: { userId: session.user.id } }),
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
  ]);

  const tier = sub?.tier ?? "FREE";
  const persona = prefs?.coachPersona ?? "FUN";
  const allowVoice = ENTITLEMENTS[tier].voiceCoach;

  const userContext = profile
    ? `Objectif=${profile.goal}, niveau=${profile.fitnessLevel}, env=${profile.environment}, IMC=${(profile.weightKg / Math.pow(profile.heightCm / 100, 2)).toFixed(1)}`
    : "Profil non renseigné.";

  const system =
    coachSystemPrompt(persona, userContext) +
    (allowVoice ? "" : "\n(Note: ce compte est FREE, pas de voix premium.)");

  const completion = await client.chat.completions.create({
    model: models.coach,
    stream: true,
    temperature: 0.6,
    messages: [
      { role: "system", content: system },
      ...parsed.data.messages.map((m) => ({ role: m.role, content: m.content })),
    ],
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta?.content ?? "";
          if (delta) controller.enqueue(encoder.encode(delta));
        }
      } catch (e) {
        controller.enqueue(
          encoder.encode(`\n\n[Erreur coach : ${e instanceof Error ? e.message : "inconnue"}]`),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
