import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
// Upload + avatar-group creation. Both calls are short; well within 15s.
export const maxDuration = 15;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * POST — receives a user-supplied face photo, uploads it to HeyGen as an asset,
 * then creates a "Photo Avatar Group" so HeyGen can generate face-conditioned
 * coach looks from it. We persist the resulting IDs on the user's Preference so
 * subsequent /api/coach-avatar generations reuse the same group (no retraining).
 */
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
      { error: `Unsupported type ${file.type}. Use JPEG, PNG, or WebP.` },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 5 MB.` },
      { status: 413 },
    );
  }

  // ── 1. Upload to HeyGen asset endpoint ────────────────────────────────────
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
    if (!uploadRes.ok) {
      const text = await uploadRes.text();
      logger.error("coach_avatar_upload_heygen_http", {
        status: uploadRes.status,
        body: text.slice(0, 500),
      });
      return NextResponse.json(
        { error: `HeyGen asset upload failed (HTTP ${uploadRes.status})` },
        { status: 502 },
      );
    }
    const j = (await uploadRes.json()) as {
      data?: { image_key?: string; url?: string; id?: string };
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

  // ── 2. Create the photo avatar group from that image ──────────────────────
  // Result: a `group_id` we can later pass to /look/generate.
  let groupId: string | null = null;
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
    if (groupRes.ok) {
      const j = (await groupRes.json()) as {
        data?: { group_id?: string; id?: string };
      };
      groupId = j.data?.group_id ?? j.data?.id ?? null;
    } else {
      // Group creation may require a paid tier — we degrade gracefully and let
      // the regular text-to-photo flow run for now. The image_key is still
      // stored so a future retry / plan upgrade can complete the setup.
      const text = await groupRes.text();
      logger.warn("coach_avatar_group_create_failed", {
        status: groupRes.status,
        body: text.slice(0, 300),
      });
    }
  } catch (e) {
    logger.warn("coach_avatar_group_create_exception", {
      error: e instanceof Error ? e.message : String(e),
    });
  }

  // ── 3. Persist on Preference ──────────────────────────────────────────────
  await prisma.preference.upsert({
    where: { userId },
    update: {
      coachAvatarSourceUrl: sourceUrl,
      coachAvatarSourceImageKey: imageKey,
      coachAvatarGroupId: groupId,
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
    /** True when HeyGen accepted the group — the next /api/coach-avatar POST
     * will run the face-conditioned generation. False means we'll fall back to
     * text-to-photo generation while still recording the source photo. */
    groupReady: groupId !== null,
  });
}

/**
 * DELETE — clears the source photo + group from the user's Preference so the
 * next generation reverts to text-only mode. The HeyGen group itself is left
 * orphaned (HeyGen will GC inactive groups; deleting requires a separate API
 * call and is non-critical).
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
    .catch(() => null); // no-op if no Preference row exists yet
  return NextResponse.json({ ok: true });
}
