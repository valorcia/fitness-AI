const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

export type PexelsVideoFile = {
  id: number;
  quality: string;
  file_type: string;
  width: number;
  height: number;
  link: string;
};
export type PexelsVideo = {
  id: number;
  duration: number;
  width: number;
  height: number;
  image: string;
  video_files: PexelsVideoFile[];
};

export async function searchExerciseVideo(query: string): Promise<PexelsVideo | null> {
  if (!PEXELS_API_KEY) return null;
  try {
    const res = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=5&orientation=portrait`,
      {
        headers: { Authorization: PEXELS_API_KEY },
        next: { revalidate: 60 * 60 * 24 },
      },
    );
    if (!res.ok) return null;
    const body = (await res.json()) as { videos: PexelsVideo[] };
    return body.videos?.[0] ?? null;
  } catch {
    return null;
  }
}

export function pickBestVideoFile(video: PexelsVideo, maxHeight = 720): PexelsVideoFile | null {
  const mp4 = video.video_files.filter((f) => f.file_type === "video/mp4" && f.height <= maxHeight);
  mp4.sort((a, b) => b.height - a.height);
  return mp4[0] ?? video.video_files[0] ?? null;
}
