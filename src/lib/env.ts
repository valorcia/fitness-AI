import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Coachmii-fit"),
  DATABASE_URL: z.string().optional(),
  AUTH_SECRET: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_PRICE_PREMIUM_MONTHLY: z.string().optional(),
  STRIPE_PRICE_PRO_MONTHLY: z.string().optional(),
  STRIPE_PRICE_ELITE_MONTHLY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL_COACH: z.string().default("gpt-4o-mini"),
  OPENAI_MODEL_TTS: z.string().default("tts-1"),
  OPENAI_MODEL_STT: z.string().default("whisper-1"),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL_COACH: z.string().default("claude-sonnet-4-6"),
  ANTHROPIC_MODEL_FAST: z.string().default("claude-haiku-4-5-20251001"),
  VOYAGE_API_KEY: z.string().optional(),
  VOYAGE_MODEL_EMBED: z.string().default("voyage-3"),
  // Observability — additional Sentry fields (NEXT_PUBLIC_SENTRY_DSN + base SENTRY_DSN declared lower)
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  // Server-side PostHog (NEXT_PUBLIC_* declared lower)
  POSTHOG_PROJECT_API_KEY: z.string().optional(),
  // Transactional email
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().default("Coachmii-fit <onboarding@coachmii-fit.com>"),
  ELEVENLABS_API_KEY: z.string().optional(),
  HEYGEN_API_KEY: z.string().optional(),
  PEXELS_API_KEY: z.string().optional(),
  MUSCLE_MOTION_API_KEY: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().default("https://eu.i.posthog.com"),
  ADMIN_EMAILS: z.string().default(""),
});

export const env = schema.parse(process.env);

export const isProd = env.NODE_ENV === "production";
export const adminEmails = env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
export const isAdminEmail = (email: string | null | undefined) =>
  !!email && adminEmails.includes(email.toLowerCase());
