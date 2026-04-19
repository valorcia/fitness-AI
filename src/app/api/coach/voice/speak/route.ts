import { z } from "zod";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimits } from "@/lib/redis";
import { synthesize } from "@/lib/ai/voice";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 30;

const schema = z.object({
  text: z.string().min(1).max(2000),
  provider: z.enum(["openai", "elevenlabs"]).optional(),
  openaiVoice: z.string().optional(),
  elevenLabsVoiceId: z.string().optional(),
  stability: z.number().min(0).max(1).optional(),
  similarityBoost: z.number().min(0).max(1).optional(),
  style: z.number().min(0).max(1).optional(),
  emotion: z
    .enum(["motivational", "supportive", "analytic", "celebratory", "corrective", "checkin"])
    .optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rl = await rateLimits.coachChat.limit(`tts:${session.user.id}`);
  if (!rl.success) return NextResponse.json({ error: "Rate limit" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  try {
    const stream = await synthesize(parsed.data);
    return new Response(stream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=600",
      },
    });
  } catch (e) {
    logger.error("tts_failed", { err: e instanceof Error ? e.message : String(e) });
    return NextResponse.json({ error: "TTS failed" }, { status: 502 });
  }
}
