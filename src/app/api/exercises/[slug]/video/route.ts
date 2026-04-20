import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { searchExerciseVideo, pickBestVideoFile } from "@/lib/media/pexels";
import { getMuscleMotionAsset } from "@/lib/media/muscle-motion";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const exercise = await prisma.exercise.findUnique({ where: { slug } });
  if (!exercise) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (exercise.videoUrl) return NextResponse.json({ url: exercise.videoUrl, cached: true });

  // Prefer Muscle & Motion when key is present — anatomically accurate.
  const mm = await getMuscleMotionAsset(slug);
  if (mm?.videoUrl) {
    await prisma.exercise.update({ where: { slug }, data: { videoUrl: mm.videoUrl } });
    return NextResponse.json({ url: mm.videoUrl, cached: false, provider: "muscle-motion" });
  }

  // Fallback — Pexels stock clip.
  const video = await searchExerciseVideo(`${exercise.name} workout fitness`);
  if (!video) return NextResponse.json({ url: null }, { status: 204 });
  const file = pickBestVideoFile(video);
  if (!file) return NextResponse.json({ url: null }, { status: 204 });

  await prisma.exercise.update({ where: { slug }, data: { videoUrl: file.link } });
  return NextResponse.json({ url: file.link, cached: false, provider: "pexels" });
}
