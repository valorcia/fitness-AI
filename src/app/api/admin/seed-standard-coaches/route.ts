import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { STANDARD_COACHES } from "@/lib/coach/standard-coaches";
import { generateFromText } from "@/lib/coach/fal";

export const runtime = "nodejs";
// Generation is ~5s per coach × 10 = up to 60s. Pro tier required.
export const maxDuration = 300;

/**
 * POST /api/admin/seed-standard-coaches
 *
 * One-shot admin route to (re)generate the 10 standard coach portraits.
 * For each STANDARD_COACH:
 *   1. Generate the portrait via fal.ai Flux Dev
 *   2. Download and re-upload to Vercel Blob (durable, our own storage)
 *   3. Upsert the CoachProfile row with the durable URL
 *
 * Pass ?force=1 to regenerate even when a portrait already exists.
 * Pass ?slug=std-fun-female-lea to only regenerate one specific coach.
 *
 * Estimated cost: 10 × $0.025 = ~$0.25 per full seed run with fal.ai Flux Dev.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }
  if (!process.env.FAL_KEY) {
    return NextResponse.json({ error: "FAL_KEY missing" }, { status: 503 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN missing" }, { status: 503 });
  }

  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "1";
  const onlySlug = url.searchParams.get("slug");

  const targets = onlySlug
    ? STANDARD_COACHES.filter((c) => c.slug === onlySlug)
    : STANDARD_COACHES;
  if (targets.length === 0) {
    return NextResponse.json({ error: `Unknown slug ${onlySlug}` }, { status: 404 });
  }

  const existing = await prisma.coachProfile.findMany({
    where: { slug: { in: targets.map((c) => c.slug) } },
    select: { slug: true, portraitUrl: true },
  });
  const existingBySlug = new Map(existing.map((e) => [e.slug, e]));

  const results: Array<{ slug: string; status: "generated" | "skipped" | "failed"; url?: string; error?: string }> = [];

  for (const coach of targets) {
    const prev = existingBySlug.get(coach.slug);
    if (!force && prev?.portraitUrl) {
      results.push({ slug: coach.slug, status: "skipped", url: prev.portraitUrl });
      continue;
    }

    try {
      // 1. Generate with fal.ai
      const generatedUrl = await generateFromText(coach.prompt, { imageSize: "portrait_16_9" });

      // 2. Re-host on Vercel Blob (fal.ai URLs may expire / be rate-limited).
      const resp = await fetch(generatedUrl);
      if (!resp.ok) throw new Error(`Failed to fetch fal output (${resp.status})`);
      const buf = await resp.arrayBuffer();
      const blob = await put(`coach-standard/${coach.slug}.jpg`, Buffer.from(buf), {
        access: "public",
        contentType: "image/jpeg",
        addRandomSuffix: false,
        allowOverwrite: true,
      });

      // 3. Upsert CoachProfile
      await prisma.coachProfile.upsert({
        where: { slug: coach.slug },
        update: {
          displayName: coach.displayName,
          gender: coach.gender,
          ageYears: coach.ageYears,
          ethnicity: coach.ethnicity,
          specialty: coach.specialty,
          style: coach.style,
          bio: coach.bio,
          tagline: coach.tagline,
          portraitUrl: blob.url,
          active: true,
        },
        create: {
          slug: coach.slug,
          displayName: coach.displayName,
          gender: coach.gender,
          ageYears: coach.ageYears,
          ethnicity: coach.ethnicity,
          specialty: coach.specialty,
          style: coach.style,
          bio: coach.bio,
          tagline: coach.tagline,
          portraitUrl: blob.url,
          active: true,
        },
      });

      results.push({ slug: coach.slug, status: "generated", url: blob.url });
      logger.info("seed_standard_coach_ok", { slug: coach.slug, url: blob.url });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push({ slug: coach.slug, status: "failed", error: msg });
      logger.error("seed_standard_coach_failed", { slug: coach.slug, error: msg });
    }
  }

  const generated = results.filter((r) => r.status === "generated").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const failed = results.filter((r) => r.status === "failed").length;

  return NextResponse.json({
    summary: { total: results.length, generated, skipped, failed },
    estimatedCostUsd: generated * 0.025,
    results,
  });
}
