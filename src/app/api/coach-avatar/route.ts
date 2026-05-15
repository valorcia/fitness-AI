import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { buildHeyGenPhotoRequest } from "@/lib/coach/heygen-prompt";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  appearance: z.record(z.string(), z.string().nullish()).default({}),
  persona: z.enum(["STRICT", "FUN", "ZEN", "MILITARY", "ELITE"]).default("FUN"),
  coachName: z.string().max(40).optional().default("Coach"),
});

type CacheEntry = { url: string; expiresAt: number };
const CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24h
const CACHE_MAX_ENTRIES = 500;

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

/** Cache key is scoped by userId so two users with identical choices still get separate generations. */
function cacheKey(userId: string, signature: string) {
  return `${userId}::${signature}`;
}

async function persistOnPreference(userId: string, url: string) {
  await prisma.preference.upsert({
    where: { userId },
    update: {
      coachAvatarUrl: url,
      coachAvatarProvider: "heygen",
      coachAvatarGeneratedAt: new Date(),
    },
    create: {
      userId,
      coachAvatarUrl: url,
      coachAvatarProvider: "heygen",
      coachAvatarGeneratedAt: new Date(),
    },
  });
}

/**
 * Polls HeyGen for the generated image. The Photo Generation API returns a
 * task id; we poll the status endpoint until the image is ready.
 */
async function pollHeyGenPhoto(taskId: string, apiKey: string): Promise<string | null> {
  const url = `https://api.heygen.com/v2/photo_avatar/generation/${taskId}`;
  const deadline = Date.now() + 55_000;
  while (Date.now() < deadline) {
    const res = await fetch(url, { headers: { "X-Api-Key": apiKey, Accept: "application/json" } });
    if (!res.ok) {
      logger.warn("heygen_poll_http", { status: res.status });
      await new Promise((r) => setTimeout(r, 1500));
      continue;
    }
    const json = (await res.json()) as {
      data?: { status?: string; image_url_list?: string[]; image_url?: string };
    };
    const status = json.data?.status;
    if (status === "success") {
      return json.data?.image_url_list?.[0] ?? json.data?.image_url ?? null;
    }
    if (status === "failed") return null;
    await new Promise((r) => setTimeout(r, 1500));
  }
  return null;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const apiKey = process.env.HEYGEN_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Generation disabled (HEYGEN_API_KEY missing)" },
      { status: 503 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    const fieldErrors = parsed.error.issues
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("; ");
    logger.warn("coach_avatar_invalid_input", { fieldErrors, bodyKeys: json && typeof json === "object" ? Object.keys(json) : null });
    return NextResponse.json({ error: `Invalid input — ${fieldErrors}` }, { status: 400 });
  }

  // Strip null values from the appearance record before passing downstream
  // (the mapper treats undefined/missing as "any").
  const appearance = Object.fromEntries(
    Object.entries(parsed.data.appearance).filter(([, v]) => v != null),
  ) as Record<string, string>;
  const coachName = parsed.data.coachName?.trim() || "Coach";

  const { request: heygenReq, signature } = buildHeyGenPhotoRequest(
    appearance,
    parsed.data.persona,
    coachName,
  );

  const key = cacheKey(userId, signature);
  const cached = readCache(key);
  if (cached) {
    await persistOnPreference(userId, cached).catch((e) =>
      logger.warn("coach_avatar_persist_failed", { error: e instanceof Error ? e.message : String(e) }),
    );
    return NextResponse.json({ url: cached, cached: true });
  }

  try {
    const submit = await fetch("https://api.heygen.com/v2/photo_avatar/photo/generate", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(heygenReq),
    });

    if (!submit.ok) {
      const text = await submit.text();
      logger.error("coach_avatar_heygen_submit_http", {
        status: submit.status,
        body: text.slice(0, 500),
      });
      return NextResponse.json(
        { error: `HeyGen submit failed (HTTP ${submit.status})` },
        { status: 502 },
      );
    }

    const submitJson = (await submit.json()) as {
      data?: { generation_id?: string };
      error?: { message?: string } | null;
    };
    const taskId = submitJson.data?.generation_id;
    if (!taskId) {
      logger.error("coach_avatar_heygen_no_task", { body: submitJson });
      return NextResponse.json(
        { error: submitJson.error?.message ?? "HeyGen returned no task id" },
        { status: 502 },
      );
    }

    const imageUrl = await pollHeyGenPhoto(taskId, apiKey);
    if (!imageUrl) {
      return NextResponse.json({ error: "HeyGen generation timed out" }, { status: 504 });
    }

    writeCache(key, imageUrl);
    await persistOnPreference(userId, imageUrl).catch((e) =>
      logger.warn("coach_avatar_persist_failed", { error: e instanceof Error ? e.message : String(e) }),
    );

    return NextResponse.json({ url: imageUrl, cached: false });
  } catch (e) {
    logger.error("coach_avatar_failed", { error: e instanceof Error ? e.message : String(e) });
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}

/**
 * GET — returns the persisted avatar URL for the current user, if any.
 * The onboarding screen calls this on mount so users don't have to regenerate
 * after a login.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const pref = await prisma.preference.findUnique({
    where: { userId: session.user.id },
    select: { coachAvatarUrl: true, coachAvatarGeneratedAt: true, coachAvatarProvider: true },
  });
  return NextResponse.json({
    url: pref?.coachAvatarUrl ?? null,
    generatedAt: pref?.coachAvatarGeneratedAt ?? null,
    provider: pref?.coachAvatarProvider ?? null,
  });
}
