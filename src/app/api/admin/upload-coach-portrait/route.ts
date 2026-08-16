import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStandardCoachBySlug } from "@/lib/coach/standard-coaches";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN missing" }, { status: 503 });
  }

  const formData = await req.formData();
  const slug = formData.get("slug");
  const file = formData.get("file");

  if (typeof slug !== "string" || !slug) {
    return NextResponse.json({ error: "slug manquant" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "fichier manquant" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Le fichier doit être une image" }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Image trop grande (max 5 Mo)" }, { status: 400 });
  }

  const coach = getStandardCoachBySlug(slug);
  if (!coach) {
    return NextResponse.json({ error: `Slug inconnu : ${slug}` }, { status: 404 });
  }

  const ext = file.type === "image/png" ? "png" : "jpg";
  const blob = await put(`coach-standard/${slug}.${ext}`, file, {
    access: "public",
    contentType: file.type,
    addRandomSuffix: false,
    allowOverwrite: true,
  });

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
      portraitUrl: blob.url,
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
      portraitUrl: blob.url,
      active: true,
    },
  });

  return NextResponse.json({ ok: true, url: blob.url });
}
