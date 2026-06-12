import Anthropic from "@anthropic-ai/sdk";
import { env } from "../env";

export const anthropic = env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
  : null;

export const anthropicModels = {
  /** Main reasoning model for coach conversations. */
  coach: env.ANTHROPIC_MODEL_COACH,
  /** Cheap fast model for memory extraction, classifications, safety triage. */
  fast: env.ANTHROPIC_MODEL_FAST,
};

/** Convenience: ensure Anthropic is configured or throw a clear error. */
export function requireAnthropic(): Anthropic {
  if (!anthropic) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }
  return anthropic;
}

/**
 * Tags a content block as cacheable. Anthropic charges 10 % of the input
 * price on cache hits and writes are 1.25× the base price — so anything
 * reused across requests (system prompt, persona, user profile) MUST be
 * marked cacheable to keep per-message cost low.
 *
 * Cache TTL is 5 minutes by default — we hit it on any active conversation.
 */
export type CacheableTextBlock = {
  type: "text";
  text: string;
  cache_control?: { type: "ephemeral" };
};

export function cacheable(text: string): CacheableTextBlock {
  return { type: "text", text, cache_control: { type: "ephemeral" } };
}

export function plainText(text: string): CacheableTextBlock {
  return { type: "text", text };
}
