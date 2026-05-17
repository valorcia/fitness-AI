import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { env } from "./env";

export const redis =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN })
    : null;

export function createRateLimit(
  name: string,
  max: number,
  window: `${number} s` | `${number} m` | `${number} h`,
) {
  if (!redis) {
    return {
      limit: async (_key: string) => ({ success: true, limit: max, remaining: max, reset: 0 }),
    };
  }
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, window),
    prefix: `ratelimit:${name}`,
    analytics: true,
  });
}

export const rateLimits = {
  coachChat: createRateLimit("coach-chat", 20, "1 m"),
  sos: createRateLimit("sos", 5, "1 h"),
  auth: createRateLimit("auth", 10, "15 m"),
  checkout: createRateLimit("checkout", 10, "1 h"),
  coachAvatarGenerate: createRateLimit("coach-avatar-generate", 5, "1 h"),
  coachAvatarUpload: createRateLimit("coach-avatar-upload", 3, "1 h"),
};
