import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStandardCoachBySlug } from "@/lib/coach/standard-coaches";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { slug, url } = await req.json();

  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "slug manquant" }, { status: 400 });
  }
  if (!url || typeof url !== "string" || !url.startsWith("http")) {
    return NextResponse.json({ error: "URL invalide" }, { status: 400 });
  }

  const coach = getStandardCoachBySlug(slug);
  if (!coach) {
    return NextResponse.json({ error: `Slug inconnu : ${slug}` }, { status: 404 });
  }

  await prisma.coachProfile.upsert({
    where: { slug },
    update: {
      displayName: coach.displayName,
      gender: coach.gender,
      ageYears: coach.ageYears,
      ethnicity: coach.ethnicity,
      specialty: coach.specialty,
      style: coach.style,
      bio: coach.bio,
      tagline: coach.tagline,
      portraitUrl: url,
      active: true,
    },
    create: {
      slug,
      displayName: coach.displayName,
      gender: coach.gender,
      ageYears: coach.ageYears,
      ethnicity: coach.ethnicity,
      specialty: coach.specialty,
      style: coach.style,
      bio: coach.bio,
      tagline: coach.tagline,
      portraitUrl: url,
      active: true,
    },
  });

  return NextResponse.json({ ok: true, url });
}
