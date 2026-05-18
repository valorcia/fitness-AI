import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { rateLimits } from "@/lib/redis";
import { buildCoachPrompt, appearanceSignature } from "@/lib/coach/prompt";
import { generateFromText, generateFromPhoto } from "@/lib/coach/fal";
import { ENTITLEMENTS } from "@/lib/billing/entitlements";

export const runtime = "nodejs";
// fal.ai Flux Dev: ~5s, PuLID Flux: ~8s. Vercel Pro maxDuration 60s safe.
export const maxDuration = 30;

const bodySchema = z.object({
  appearance: z.record(z.string(), z.string().nullish()).default({}),
  persona: z.enum(["STRICT", "FUN", "ZEN", "MILITARY", "ELITE"]).default("FUN"),
  coachName: z.string().max(40).optional().default("Coach"),
});

type CacheEntry = { url: string; expiresAt: number };
const CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24;
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

async function persistOnPreference(userId: string, url: string) {
  await prisma.preference.upsert({
    where: { userId },
    update: {
      coachAvatarUrl: url,
      coachAvatarProvider: "fal",
      coachAvatarGeneratedAt: new Date(),
    },
    create: {
      userId,
      coachAvatarUrl: url,
      coachAvatarProvider: "fal",
      coachAvatarGeneratedAt: new Date(),
    },
  });
}

async function getUserTier(userId: string) {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  return sub?.tier ?? "FREE";
}

/**
 * POST — Generate an avatar synchronously via fal.ai and return the URL.
 *
 *   - If the user has uploaded a source photo (Preference.coachAvatarSourceUrl),
 *     uses PuLID Flux to generate a face-locked coach.
 *   - Otherwise uses Flux Dev with the textual appearance description.
 *
 * Custom generation is gated to PREMIUM+ tiers. FREE users select from the
 * 10 standard coaches via /api/standard-coaches.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // Gate: only PREMIUM+ can spend credits on custom generation.
  const tier = await getUserTier(userId);
  if (!ENTITLEMENTS[tier].customAvatar) {
    return NextResponse.json(
      {
        error: "Personnalisation réservée aux abonnés Premium. Sélectionnez un coach standard.",
        upgrade: true,
      },
      { status: 402 },
    );
  }

  const rl = await rateLimits.coachAvatarGenerate.limit(userId);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Limite de générations atteinte (5 / heure). Réessayez plus tard." },
      { status: 429 },
    );
  }

  if (!process.env.FAL_KEY) {
    return NextResponse.json(
      { error: "Génération désactivée (FAL_KEY manquant)." },
      { status: 503 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    const fieldErrors = parsed.error.issues
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("; ");
    return NextResponse.json({ error: `Invalid input — ${fieldErrors}` }, { status: 400 });
  }

  const appearance = Object.fromEntries(
    Object.entries(parsed.data.appearance).filter(([, v]) => v != null),
  ) as Record<string, string>;
  const coachName = parsed.data.coachName?.trim() || "Coach";

  const pref = await prisma.preference.findUnique({
    where: { userId },
    select: { coachAvatarSourceUrl: true },
  });
  const sourcePhotoUrl = pref?.coachAvatarSourceUrl ?? null;

  const { prompt } = buildCoachPrompt(appearance, parsed.data.persona, coachName, {
    omitFaceTraits: Boolean(sourcePhotoUrl),
  });

  const signature = appearanceSignature(appearance, parsed.data.persona);
  const fullSignature = sourcePhotoUrl ? `${signature}::p:${sourcePhotoUrl}` : signature;
  const cacheKey = `${userId}::${fullSignature}`;

  const cached = readCache(cacheKey);
  if (cached) {
    await persistOnPreference(userId, cached).catch(() => null);
    return NextResponse.json({ url: cached, cached: true });
  }

  try {
    const url = sourcePhotoUrl
      ? await generateFromPhoto(prompt, sourcePhotoUrl)
      : await generateFromText(prompt);

    writeCache(cacheKey, url);
    await persistOnPreference(userId, url).catch((e) =>
      logger.warn("coach_avatar_persist_failed", {
        error: e instanceof Error ? e.message : String(e),
      }),
    );

    return NextResponse.json({ url, cached: false, faceLocked: Boolean(sourcePhotoUrl) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logger.error("coach_avatar_fal_failed", { error: msg, sourcePhotoUrl: Boolean(sourcePhotoUrl) });
    return NextResponse.json(
      { error: `Génération fal.ai échouée — ${msg}` },
      { status: 502 },
    );
  }
}

/**
 * GET — returns the persisted avatar URL for the current user (used by the
 * onboarding step on mount to skip regeneration).
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const pref = await prisma.preference.findUnique({
    where: { userId },
    select: {
      coachAvatarUrl: true,
      coachAvatarGeneratedAt: true,
      coachAvatarProvider: true,
      coachAvatarSourceUrl: true,
    },
  });

  const tier = await getUserTier(userId);

  return NextResponse.json({
    url: pref?.coachAvatarUrl ?? null,
    generatedAt: pref?.coachAvatarGeneratedAt ?? null,
    provider: pref?.coachAvatarProvider ?? null,
    sourcePhotoUrl: pref?.coachAvatarSourceUrl ?? null,
    hasFaceLockedGroup: Boolean(pref?.coachAvatarSourceUrl),
    canCustomize: ENTITLEMENTS[tier].customAvatar,
  });
}
