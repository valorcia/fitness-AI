import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { rateLimits } from "@/lib/redis";

export const runtime = "nodejs";
// Upload (~2s) + group creation (~1s) + a few status polls (up to ~10s) = ~13s max
export const maxDuration = 30;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const HEYGEN_READY_STATUSES = new Set(["success", "ready", "done", "completed"]);
const HEYGEN_FAILED_STATUSES = new Set(["failed", "error", "cancelled"]);

/**
 * POST — receives a user-supplied face photo (any photographic style),
 * uploads it to HeyGen as an asset, then creates a "Photo Avatar Group".
 * We poll the group's training status for up to ~12s; if it finishes we
 * mark it ready immediately, otherwise we store the group_id so the
 * generation endpoint can check again later.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // Protect HeyGen credits: cap photo uploads (each one creates an avatar
  // group, which counts against your quota).
  const rl = await rateLimits.coachAvatarUpload.limit(userId);
  if (!rl.success) {
    return NextResponse.json(
      {
        error:
          "Limite d'uploads atteinte (3 / heure). Réessayez plus tard pour protéger vos crédits HeyGen.",
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

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const file = form.get("photo");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing `photo` field" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: `Type non supporté (${file.type}). Utilise JPEG, PNG ou WebP.` },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      {
        error: `Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} Mo). Max 5 Mo.`,
      },
      { status: 413 },
    );
  }

  // ── 1. Upload binary to HeyGen asset endpoint ──────────────────────────────
  let imageKey: string;
  let sourceUrl: string;
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const uploadRes = await fetch("https://upload.heygen.com/v1/asset", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": file.type,
      },
      body: buf,
    });
    const uploadText = await uploadRes.text();
    logger.info("coach_avatar_asset_upload_raw", {
      status: uploadRes.status,
      body: uploadText.slice(0, 500),
    });
    if (!uploadRes.ok) {
      return NextResponse.json(
        { error: `HeyGen asset upload failed (HTTP ${uploadRes.status})` },
        { status: 502 },
      );
    }
    const j = JSON.parse(uploadText) as {
      data?: { image_key?: string; url?: string; id?: string };
      code?: number;
    };
    const key = j.data?.image_key;
    const url = j.data?.url;
    if (!key || !url) {
      logger.error("coach_avatar_upload_no_key", { body: j });
      return NextResponse.json(
        { error: "HeyGen asset upload returned no image_key" },
        { status: 502 },
      );
    }
    imageKey = key;
    sourceUrl = url;
  } catch (e) {
    logger.error("coach_avatar_upload_failed", {
      error: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  // ── 2. Create the photo avatar group ──────────────────────────────────────
  let groupId: string | null = null;
  let groupReady = false;
  let groupFailReason: string | null = null;

  try {
    const groupRes = await fetch("https://api.heygen.com/v2/photo_avatar/avatar_group/create", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: `coach-${userId.slice(0, 8)}-${Date.now()}`,
        image_key: imageKey,
      }),
    });
    const groupText = await groupRes.text();
    logger.info("coach_avatar_group_create_raw", {
      status: groupRes.status,
      body: groupText.slice(0, 500),
    });

    if (groupRes.ok) {
      const j = JSON.parse(groupText) as {
        data?: {
          group_id?: string;
          id?: string;
          train_status?: string;
          status?: string;
        };
      };
      // HeyGen may return `group_id` or `id` depending on API version
      groupId = j.data?.group_id ?? j.data?.id ?? null;
      const initialStatus = j.data?.train_status ?? j.data?.status ?? null;
      if (groupId && initialStatus && HEYGEN_READY_STATUSES.has(initialStatus)) {
        groupReady = true;
      }
    } else {
      logger.warn("coach_avatar_group_create_failed", {
        status: groupRes.status,
        body: groupText.slice(0, 300),
      });
      groupFailReason = `Group creation HTTP ${groupRes.status}`;
    }
  } catch (e) {
    logger.warn("coach_avatar_group_create_exception", {
      error: e instanceof Error ? e.message : String(e),
    });
  }

  // ── 3. Poll training status for up to ~12s ────────────────────────────────
  // HeyGen trains the group immediately for single-image uploads; the
  // typical wait is 2–8s.
  if (groupId && !groupReady) {
    const POLL_INTERVAL_MS = 2500;
    const POLL_DEADLINE = Date.now() + 12_000;
    while (Date.now() < POLL_DEADLINE) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      try {
        const statusRes = await fetch(
          `https://api.heygen.com/v2/photo_avatar/avatar_group/${groupId}`,
          { headers: { "X-Api-Key": apiKey, Accept: "application/json" } },
        );
        if (!statusRes.ok) continue;
        const statusText = await statusRes.text();
        logger.info("coach_avatar_group_status_raw", { body: statusText.slice(0, 300), groupId });
        const statusData = JSON.parse(statusText) as {
          data?: { train_status?: string; status?: string };
        };
        const ts = statusData.data?.train_status ?? statusData.data?.status ?? null;
        if (ts && HEYGEN_READY_STATUSES.has(ts)) {
          groupReady = true;
          break;
        }
        if (ts && HEYGEN_FAILED_STATUSES.has(ts)) {
          groupFailReason = `Group training ${ts}`;
          groupId = null; // unusable
          break;
        }
      } catch {
        // transient poll error, retry on next interval
      }
    }
  }

  // ── 4. Persist on Preference ──────────────────────────────────────────────
  await prisma.preference.upsert({
    where: { userId },
    update: {
      coachAvatarSourceUrl: sourceUrl,
      coachAvatarSourceImageKey: imageKey,
      coachAvatarGroupId: groupId, // null if training failed
    },
    create: {
      userId,
      coachAvatarSourceUrl: sourceUrl,
      coachAvatarSourceImageKey: imageKey,
      coachAvatarGroupId: groupId,
    },
  });

  return NextResponse.json({
    sourceUrl,
    imageKey,
    groupId,
    groupReady,
    /** Populated when HeyGen could not train the group (e.g. face not detected). */
    groupFailReason,
  });
}

/**
 * DELETE — clears the source photo + group from the user's Preference.
 */
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await prisma.preference
    .update({
      where: { userId: session.user.id },
      data: {
        coachAvatarSourceUrl: null,
        coachAvatarSourceImageKey: null,
        coachAvatarGroupId: null,
      },
    })
    .catch(() => null);
  return NextResponse.json({ ok: true });
}
