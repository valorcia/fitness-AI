import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { rateLimits } from "@/lib/redis";
import { buildHeyGenPhotoRequest } from "@/lib/coach/heygen-prompt";

export const runtime = "nodejs";
// Each request to this route hits HeyGen once (submit OR a single status
// poll). Both calls finish well under the Vercel Hobby 10s limit.
export const maxDuration = 15;

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
 * POST — submit a HeyGen generation request and return the task id immediately.
 * Polling for completion is the client's job (GET ?id=…) so we never get
 * killed by Vercel Hobby's 10s function timeout.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // Protect HeyGen credits: hard cap on generations per user per hour.
  const rl = await rateLimits.coachAvatarGenerate.limit(userId);
  if (!rl.success) {
    return NextResponse.json(
      {
        error:
          "Limite de générations atteinte (5 / heure). Réessayez plus tard pour protéger vos crédits HeyGen.",
      },
      { status: 429 },
    );
  }

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
    logger.warn("coach_avatar_invalid_input", {
      fieldErrors,
      bodyKeys: json && typeof json === "object" ? Object.keys(json) : null,
    });
    return NextResponse.json({ error: `Invalid input — ${fieldErrors}` }, { status: 400 });
  }

  const appearance = Object.fromEntries(
    Object.entries(parsed.data.appearance).filter(([, v]) => v != null),
  ) as Record<string, string>;
  const coachName = parsed.data.coachName?.trim() || "Coach";

  const { request: heygenReq, signature } = buildHeyGenPhotoRequest(
    appearance,
    parsed.data.persona,
    coachName,
  );

  // If the user uploaded a source photo, HeyGen returns a group_id we reuse
  // to generate face-conditioned looks. Bring in both that id and the source
  // URL so we can fall back to the photo when generation fails.
  const pref = await prisma.preference.findUnique({
    where: { userId },
    select: { coachAvatarGroupId: true, coachAvatarSourceUrl: true },
  });
  const groupId = pref?.coachAvatarGroupId ?? null;

  // Cache key incorporates the group so identical text params on different
  // source photos don't collide.
  const fullSignature = groupId ? `${signature}::g:${groupId}` : signature;
  const key = cacheKey(userId, fullSignature);
  const cached = readCache(key);
  if (cached) {
    await persistOnPreference(userId, cached).catch((e) =>
      logger.warn("coach_avatar_persist_failed", {
        error: e instanceof Error ? e.message : String(e),
      }),
    );
    return NextResponse.json({ url: cached, cached: true });
  }

  // ── Branch A — photo-conditioned look generation ────────────────────────
  // We have a HeyGen avatar group; let it generate a new fitness coach look
  // whose face is inspired by the uploaded photo. Facial attributes from the
  // wizard are intentionally absent from the prompt (the face comes from the
  // group); we only describe body, outfit, scene, and persona vibe.
  //
  // If the group isn't ready yet (training) or the call fails for any reason
  // we fall through silently to Branch B (text-only). This makes generation
  // always succeed regardless of group state.
  let usedFaceLock = false;
  if (groupId) {
    // 1. Verify the avatar group is trained/ready before calling look/generate.
    let groupIsReady = false;
    try {
      const statusRes = await fetch(
        `https://api.heygen.com/v2/photo_avatar/avatar_group/${groupId}`,
        { headers: { "X-Api-Key": apiKey, Accept: "application/json" } },
      );
      if (statusRes.ok) {
        const statusText = await statusRes.text();
        logger.info("coach_avatar_group_status_check", { body: statusText.slice(0, 300), groupId });
        const statusData = JSON.parse(statusText) as {
          data?: { train_status?: string; status?: string };
        };
        const ts = statusData.data?.train_status ?? statusData.data?.status ?? null;
        groupIsReady = Boolean(ts && ["success", "ready", "done", "completed"].includes(ts));
        // If group training failed (e.g. face not detected), evict it from DB
        // so future requests don't waste time checking it.
        if (ts && ["failed", "error", "cancelled"].includes(ts)) {
          await prisma.preference
            .update({ where: { userId }, data: { coachAvatarGroupId: null } })
            .catch(() => null);
        }
      }
    } catch (e) {
      logger.warn("coach_avatar_group_status_check_failed", {
        error: e instanceof Error ? e.message : String(e),
      });
    }

    if (groupIsReady) {
      // 2. Submit look generation
      try {
        const submit = await fetch("https://api.heygen.com/v2/photo_avatar/look/generate", {
          method: "POST",
          headers: {
            "X-Api-Key": apiKey,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            group_id: groupId,
            prompt: heygenReq.appearance,
            orientation: heygenReq.orientation,
            pose: heygenReq.pose,
            style: heygenReq.style,
            name: heygenReq.name,
          }),
        });
        const submitText = await submit.text();
        logger.info("coach_avatar_look_submit_raw", {
          status: submit.status,
          body: submitText.slice(0, 500),
          groupId,
        });
        if (submit.ok) {
          const submitJson = JSON.parse(submitText) as {
            data?: { generation_id?: string; id?: string };
          };
          const generationId = submitJson.data?.generation_id ?? submitJson.data?.id;
          if (generationId) {
            usedFaceLock = true;
            return NextResponse.json({
              generationId,
              signature: fullSignature,
              cached: false,
              faceLocked: true,
            });
          }
        }
        // look/generate failed — DO NOT fall through to Branch B: that would
        // burn a second HeyGen credit. Surface the error so the user can retry
        // explicitly (after removing the photo if they want text generation).
        logger.warn("coach_avatar_look_failed", {
          status: submit.status,
          body: submitText.slice(0, 300),
          groupId,
        });
        return NextResponse.json(
          {
            error: `Génération photo-locked impossible (HTTP ${submit.status}). Retirez la photo pour générer un avatar à partir des critères texte.`,
            heygenRaw: submitText.slice(0, 500),
          },
          { status: 502 },
        );
      } catch (e) {
        logger.warn("coach_avatar_look_exception", {
          error: e instanceof Error ? e.message : String(e),
        });
        return NextResponse.json(
          { error: "La génération photo-locked a échoué. Retirez la photo et réessayez." },
          { status: 502 },
        );
      }
    } else {
      logger.info("coach_avatar_group_not_ready", { groupId });
      return NextResponse.json(
        {
          error:
            "Le modèle de votre photo est encore en cours de préparation chez HeyGen. Réessayez dans 30 secondes.",
        },
        { status: 503 },
      );
    }
  }
  void usedFaceLock; // used above when returning early

  // ── Branch B — text-only generation (no source photo uploaded) ──
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
        body: text, // full body — keep visibility into HeyGen's actual error
        sentPayload: heygenReq,
      });
      let detail: string | null = null;
      try {
        const j = JSON.parse(text) as {
          error?: { message?: string; code?: string } | string;
          message?: string;
        };
        detail =
          typeof j.error === "string"
            ? j.error
            : j.error?.message ?? j.message ?? null;
      } catch {
        detail = text.slice(0, 200);
      }
      return NextResponse.json(
        {
          error: `HeyGen submit failed (HTTP ${submit.status})${detail ? ` — ${detail}` : ""}`,
          // Ship the unparsed body too so the UI can show it when `detail` is
          // empty or generic (e.g. "invalid_parameter" with no specific message).
          heygenRaw: text.slice(0, 1000),
          sentPayload: heygenReq,
        },
        { status: 502 },
      );
    }

    const submitJson = (await submit.json()) as {
      data?: { generation_id?: string };
      error?: { message?: string } | null;
    };
    const generationId = submitJson.data?.generation_id;
    if (!generationId) {
      logger.error("coach_avatar_heygen_no_task", { body: submitJson });
      return NextResponse.json(
        { error: submitJson.error?.message ?? "HeyGen returned no task id" },
        { status: 502 },
      );
    }

    return NextResponse.json({ generationId, signature, cached: false });
  } catch (e) {
    logger.error("coach_avatar_failed", { error: e instanceof Error ? e.message : String(e) });
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}

/**
 * GET — two modes:
 *
 *  - no query params → returns the persisted avatar URL for the current user
 *    (used by the onboarding step on mount to skip regeneration)
 *  - ?id=<generation_id>&sig=<signature> → polls HeyGen *once* for the task
 *    status. The client loops this every ~1.5s until status is "success" or
 *    "failed". Each call stays well under the Vercel Hobby timeout.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const url = new URL(req.url);
  const generationId = url.searchParams.get("id");
  const signature = url.searchParams.get("sig");

  if (!generationId) {
    const pref = await prisma.preference.findUnique({
      where: { userId },
      select: {
        coachAvatarUrl: true,
        coachAvatarGeneratedAt: true,
        coachAvatarProvider: true,
        coachAvatarSourceUrl: true,
        coachAvatarGroupId: true,
      },
    });
    return NextResponse.json({
      url: pref?.coachAvatarUrl ?? null,
      generatedAt: pref?.coachAvatarGeneratedAt ?? null,
      provider: pref?.coachAvatarProvider ?? null,
      sourcePhotoUrl: pref?.coachAvatarSourceUrl ?? null,
      hasFaceLockedGroup: Boolean(pref?.coachAvatarGroupId),
    });
  }

  const apiKey = process.env.HEYGEN_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Generation disabled (HEYGEN_API_KEY missing)" },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(
      `https://api.heygen.com/v2/photo_avatar/generation/${generationId}`,
      { headers: { "X-Api-Key": apiKey, Accept: "application/json" } },
    );
    if (!res.ok) {
      const text = await res.text();
      logger.warn("coach_avatar_poll_http", { status: res.status, body: text.slice(0, 200) });
      return NextResponse.json(
        { status: "pending", error: `HeyGen poll HTTP ${res.status}` },
        { status: 200 },
      );
    }
    const json = (await res.json()) as {
      data?: { status?: string; image_url_list?: string[]; image_url?: string; msg?: string | null };
    };
    const status = json.data?.status ?? "pending";

    if (status === "success") {
      const imageUrl = json.data?.image_url_list?.[0] ?? json.data?.image_url ?? null;
      if (!imageUrl) {
        return NextResponse.json(
          { status: "failed", error: "HeyGen success without image_url" },
          { status: 200 },
        );
      }
      if (signature) writeCache(cacheKey(userId, signature), imageUrl);
      await persistOnPreference(userId, imageUrl).catch((e) =>
        logger.warn("coach_avatar_persist_failed", {
          error: e instanceof Error ? e.message : String(e),
        }),
      );
      return NextResponse.json({ status: "success", url: imageUrl });
    }

    if (status === "failed") {
      return NextResponse.json(
        { status: "failed", error: json.data?.msg ?? "HeyGen generation failed" },
        { status: 200 },
      );
    }

    return NextResponse.json({ status: "pending" });
  } catch (e) {
    logger.error("coach_avatar_poll_failed", {
      error: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json(
      { status: "pending", error: "Poll request failed" },
      { status: 200 },
    );
  }
}
