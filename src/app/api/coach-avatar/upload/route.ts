import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { rateLimits } from "@/lib/redis";
import { ENTITLEMENTS } from "@/lib/billing/entitlements";

export const runtime = "nodejs";
export const maxDuration = 15;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

async function getUserTier(userId: string) {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  return sub?.tier ?? "FREE";
}

/**
 * POST — receives a user-supplied face photo, stores it in Vercel Blob, and
 * persists the public URL on Preference.coachAvatarSourceUrl. The generation
 * endpoint then uses this URL with fal.ai PuLID Flux to produce a face-locked
 * coach.
 *
 * Gated behind PREMIUM (FREE users select from 10 standard coaches).
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const tier = await getUserTier(userId);
  if (!ENTITLEMENTS[tier].customAvatar) {
    return NextResponse.json(
      {
        error:
          "L'import de photo est réservé aux abonnés Premium. Choisissez un coach standard ou passez à Premium.",
        upgrade: true,
      },
      { status: 402 },
    );
  }

  const rl = await rateLimits.coachAvatarUpload.limit(userId);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Limite d'uploads atteinte (3 / heure). Réessayez plus tard." },
      { status: 429 },
    );
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Stockage indisponible (BLOB_READ_WRITE_TOKEN manquant)." },
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
      { error: `Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} Mo). Max 5 Mo.` },
      { status: 413 },
    );
  }

  try {
    const ext = file.type.split("/")[1] ?? "jpg";
    const blob = await put(`coach-source/${userId}-${Date.now()}.${ext}`, file, {
      access: "public",
      contentType: file.type,
    });

    // Evict any previous source photo to avoid orphaned blobs.
    const previous = await prisma.preference.findUnique({
      where: { userId },
      select: { coachAvatarSourceUrl: true },
    });
    if (previous?.coachAvatarSourceUrl && previous.coachAvatarSourceUrl.includes("blob.vercel-storage.com")) {
      await del(previous.coachAvatarSourceUrl).catch(() => null);
    }

    await prisma.preference.upsert({
      where: { userId },
      update: {
        coachAvatarSourceUrl: blob.url,
        coachAvatarSourceImageKey: blob.pathname,
        coachAvatarGroupId: null,
      },
      create: {
        userId,
        coachAvatarSourceUrl: blob.url,
        coachAvatarSourceImageKey: blob.pathname,
      },
    });

    return NextResponse.json({
      sourceUrl: blob.url,
      imageKey: blob.pathname,
      groupId: null,
      groupReady: true,
      groupFailReason: null,
    });
  } catch (e) {
    logger.error("coach_avatar_upload_failed", {
      error: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json({ error: "Upload échoué" }, { status: 500 });
  }
}

/**
 * DELETE — removes the source photo + clears the user's Preference fields.
 */
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const previous = await prisma.preference.findUnique({
    where: { userId },
    select: { coachAvatarSourceUrl: true },
  });
  if (previous?.coachAvatarSourceUrl && previous.coachAvatarSourceUrl.includes("blob.vercel-storage.com")) {
    await del(previous.coachAvatarSourceUrl).catch(() => null);
  }

  await prisma.preference
    .update({
      where: { userId },
      data: {
        coachAvatarSourceUrl: null,
        coachAvatarSourceImageKey: null,
        coachAvatarGroupId: null,
      },
    })
    .catch(() => null);

  return NextResponse.json({ ok: true });
}
