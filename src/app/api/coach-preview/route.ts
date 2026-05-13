import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { buildCoachPrompt, COACH_NEGATIVE_PROMPT } from "@/lib/coach/prompt-builder";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  appearance: z.record(z.string(), z.string().optional()),
  persona: z.enum(["STRICT", "FUN", "ZEN", "MILITARY", "ELITE"]).default("FUN"),
});

type CacheEntry = { url: string; expiresAt: number };
const CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24h
const CACHE_MAX_ENTRIES = 200;

function readCache(key: string): string | null {
  const hit = CACHE.get(key);
  if (!hit) return null;
  if (hit.expiresAt < Date.now()) {
    CACHE.delete(key);
    return null;
  }
  return hit.url;
}

function writeCache(key: string, url: string) {
  if (CACHE.size >= CACHE_MAX_ENTRIES) {
    const oldest = CACHE.keys().next().value;
    if (oldest) CACHE.delete(oldest);
  }
  CACHE.set(key, { url, expiresAt: Date.now() + CACHE_TTL_MS });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Generation disabled (REPLICATE_API_TOKEN missing)" }, { status: 503 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { prompt, signature } = buildCoachPrompt(parsed.data.appearance, parsed.data.persona);

  const cached = readCache(signature);
  if (cached) {
    return NextResponse.json({ url: cached, cached: true });
  }

  try {
    const res = await fetch(
      "https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "wait=55",
        },
        body: JSON.stringify({
          input: {
            prompt,
            negative_prompt: COACH_NEGATIVE_PROMPT,
            aspect_ratio: "2:3",
            num_outputs: 1,
            output_format: "webp",
            output_quality: 85,
            go_fast: true,
            num_inference_steps: 4,
          },
        }),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      logger.error("coach_preview_replicate_http", { status: res.status, body: text.slice(0, 500) });
      return NextResponse.json({ error: "Generation failed" }, { status: 502 });
    }

    const data = (await res.json()) as {
      status: string;
      output?: string[] | string;
      error?: string;
    };

    if (data.status !== "succeeded") {
      logger.warn("coach_preview_not_succeeded", { status: data.status, error: data.error });
      return NextResponse.json({ error: data.error ?? "Generation pending" }, { status: 504 });
    }

    const output = Array.isArray(data.output) ? data.output[0] : data.output;
    if (!output) {
      return NextResponse.json({ error: "No image returned" }, { status: 502 });
    }

    writeCache(signature, output);
    return NextResponse.json({ url: output, cached: false });
  } catch (e) {
    logger.error("coach_preview_failed", { error: e instanceof Error ? e.message : String(e) });
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
