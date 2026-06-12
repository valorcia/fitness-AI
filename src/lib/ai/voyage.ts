import { VoyageAIClient } from "voyageai";
import { env } from "../env";

const client = env.VOYAGE_API_KEY
  ? new VoyageAIClient({ apiKey: env.VOYAGE_API_KEY })
  : null;

/**
 * Generate a 1024-dim embedding for a chunk of text using Voyage AI.
 *
 * Use `input_type: "document"` when indexing memories (write) and
 * `input_type: "query"` when searching by user message (read). This
 * asymmetric encoding improves retrieval quality measurably.
 *
 * Cost: $0.12 / 1M tokens — negligible at our scale.
 */
export async function embed(
  text: string,
  inputType: "document" | "query" = "document",
): Promise<number[] | null> {
  if (!client) return null;
  if (!text || !text.trim()) return null;

  const res = await client.embed({
    input: text.slice(0, 8000),
    model: env.VOYAGE_MODEL_EMBED,
    inputType,
  });
  const vec = res.data?.[0]?.embedding;
  if (!vec || vec.length === 0) return null;
  return vec;
}

/** Batch variant — embeds up to 128 strings in a single API call. */
export async function embedBatch(
  texts: string[],
  inputType: "document" | "query" = "document",
): Promise<(number[] | null)[]> {
  if (!client) return texts.map(() => null);
  const cleaned = texts.map((t) => (t || "").slice(0, 8000));
  const res = await client.embed({
    input: cleaned,
    model: env.VOYAGE_MODEL_EMBED,
    inputType,
  });
  return cleaned.map((_, i) => res.data?.[i]?.embedding ?? null);
}

export function isEmbeddingsConfigured(): boolean {
  return client !== null;
}
