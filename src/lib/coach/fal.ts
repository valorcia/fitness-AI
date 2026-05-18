import { fal } from "@fal-ai/client";

let configured = false;
function ensureConfigured() {
  if (configured) return;
  if (!process.env.FAL_KEY) {
    throw new Error("FAL_KEY not configured");
  }
  fal.config({ credentials: process.env.FAL_KEY });
  configured = true;
}

export type FalImageSize =
  | "square_hd"
  | "square"
  | "portrait_4_3"
  | "portrait_16_9"
  | "landscape_4_3"
  | "landscape_16_9";

type FalImage = { url: string; width?: number; height?: number };
type FalResult = { data: { images?: FalImage[] } };

/**
 * Generate a coach image from a text prompt using Flux Dev.
 * ~$0.025 per image, ~5s latency.
 */
export async function generateFromText(
  prompt: string,
  opts: { imageSize?: FalImageSize; seed?: number } = {},
): Promise<string> {
  ensureConfigured();
  const result = (await fal.subscribe("fal-ai/flux/dev", {
    input: {
      prompt,
      image_size: opts.imageSize ?? "portrait_16_9",
      num_inference_steps: 28,
      guidance_scale: 3.5,
      num_images: 1,
      enable_safety_checker: true,
      ...(opts.seed !== undefined ? { seed: opts.seed } : {}),
    },
    logs: false,
  })) as FalResult;
  const url = result.data.images?.[0]?.url;
  if (!url) throw new Error("fal.ai Flux returned no image");
  return url;
}

/**
 * Generate a coach image conditioned on a user-supplied face photo using PuLID
 * Flux. The face identity is preserved while body/outfit/scene come from the
 * text prompt. ~$0.05 per image, ~8s latency.
 */
export async function generateFromPhoto(
  prompt: string,
  faceImageUrl: string,
  opts: { imageSize?: FalImageSize; idWeight?: number } = {},
): Promise<string> {
  ensureConfigured();
  const result = (await fal.subscribe("fal-ai/flux-pulid", {
    input: {
      reference_image_url: faceImageUrl,
      prompt,
      image_size: opts.imageSize ?? "portrait_16_9",
      num_inference_steps: 20,
      guidance_scale: 4.0,
      id_weight: opts.idWeight ?? 1.0,
      true_cfg: 1.0,
    },
    logs: false,
  })) as FalResult;
  const url = result.data.images?.[0]?.url;
  if (!url) throw new Error("fal.ai PuLID returned no image");
  return url;
}
