/**
 * Muscle&Motion scaffold — disabled by default.
 * When MUSCLE_MOTION_API_KEY is set in env, the helper can be wired to fetch
 * anatomically-accurate 3D animation URLs per exercise slug.
 * Currently returns null so callers can fall back to ExerciseDemo / videoUrl.
 */

const MUSCLE_MOTION_API_KEY = process.env.MUSCLE_MOTION_API_KEY;
const MUSCLE_MOTION_BASE = "https://api.muscleandmotion.com/v1"; // placeholder

export type MuscleMotionAsset = {
  slug: string;
  videoUrl: string;
  posterUrl?: string;
  musclesHighlighted?: string[];
};

export async function getMuscleMotionAsset(slug: string): Promise<MuscleMotionAsset | null> {
  if (!MUSCLE_MOTION_API_KEY) return null;
  try {
    const res = await fetch(`${MUSCLE_MOTION_BASE}/exercises/${slug}`, {
      headers: { Authorization: `Bearer ${MUSCLE_MOTION_API_KEY}` },
      next: { revalidate: 60 * 60 * 24 * 7 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as MuscleMotionAsset;
    return json;
  } catch {
    return null;
  }
}

export const isMuscleMotionEnabled = Boolean(MUSCLE_MOTION_API_KEY);
