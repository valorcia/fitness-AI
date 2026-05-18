import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { STANDARD_COACHES } from "@/lib/coach/standard-coaches";

export const runtime = "nodejs";

/**
 * GET — returns the 10 standard coaches with their (pre-generated) portrait URLs.
 * Public endpoint — used by the onboarding gallery and the settings selector.
 *
 * Falls back to the seed metadata (without portraitUrl) if the CoachProfile
 * rows haven't been seeded yet — useful in development before the admin
 * runs /api/admin/seed-standard-coaches.
 */
export async function GET() {
  const slugs = STANDARD_COACHES.map((c) => c.slug);
  const profiles = await prisma.coachProfile.findMany({
    where: { slug: { in: slugs }, active: true },
    select: {
      slug: true,
      displayName: true,
      gender: true,
      specialty: true,
      style: true,
      tagline: true,
      portraitUrl: true,
    },
  });
  const bySlug = new Map(profiles.map((p) => [p.slug, p]));

  const coaches = STANDARD_COACHES.map((c) => {
    const row = bySlug.get(c.slug);
    return {
      slug: c.slug,
      displayName: row?.displayName ?? c.displayName,
      persona: c.persona,
      gender: row?.gender ?? c.gender,
      specialty: row?.specialty ?? c.specialty,
      style: row?.style ?? c.style,
      tagline: row?.tagline ?? c.tagline,
      portraitUrl: row?.portraitUrl ?? null,
    };
  });

  return NextResponse.json({ coaches });
}
