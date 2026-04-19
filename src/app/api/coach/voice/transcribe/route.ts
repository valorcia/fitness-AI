import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimits } from "@/lib/redis";
import { transcribeAudio } from "@/lib/ai/voice";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rl = await rateLimits.coachChat.limit(`stt:${session.user.id}`);
  if (!rl.success) return NextResponse.json({ error: "Rate limit" }, { status: 429 });

  const form = await req.formData();
  const file = form.get("audio");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier audio requis (champ 'audio')" }, { status: 400 });
  }
  if (file.size > 15 * 1024 * 1024) {
    return NextResponse.json({ error: "Audio > 15 Mo" }, { status: 413 });
  }

  try {
    const text = await transcribeAudio(file);
    return NextResponse.json({ text });
  } catch (e) {
    logger.error("stt_failed", { err: e instanceof Error ? e.message : String(e) });
    return NextResponse.json({ error: "Transcription échouée" }, { status: 502 });
  }
}
