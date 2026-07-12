import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Coachmii-fit"),
  DATABASE_URL: z.string().optional(),
  AUTH_SECRET: z.string().optional(),
  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_PRICE_PREMIUM_MONTHLY: z.string().optional(),
  STRIPE_PRICE_PRO_MONTHLY: z.string().optional(),
  STRIPE_PRICE_ELITE_MONTHLY: z.string().optional(),
  // OpenAI
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL_COACH: z.string().default("gpt-4o-mini"),
  OPENAI_MODEL_TTS: z.string().default("tts-1"),
  OPENAI_MODEL_STT: z.string().default("whisper-1"),
  // Anthropic
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL_COACH: z.string().default("claude-sonnet-4-6"),
  ANTHROPIC_MODEL_FAST: z.string().default("claude-haiku-4-5-20251001"),
  // ElevenLabs / HeyGen / media
  ELEVENLABS_API_KEY: z.string().optional(),
  HEYGEN_API_KEY: z.string().optional(),
  PEXELS_API_KEY: z.string().optional(),
  MUSCLE_MOTION_API_KEY: z.string().optional(),
  // fal.ai
  FAL_KEY: z.string().optional(),
  // Voyage AI embeddings
  VOYAGE_API_KEY: z.string().optional(),
  VOYAGE_MODEL_EMBED: z.string().default("voyage-3"),
  // Vercel Blob
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  // Upstash Redis
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  // Sentry
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  // PostHog analytics
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().default("https://eu.i.posthog.com"),
  POSTHOG_PROJECT_API_KEY: z.string().optional(),
  // Transactional email
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().default("Coachmii-fit <onboarding@coachmii-fit.com>"),
  // Web Push VAPID
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().default("mailto:contact@coachmii-fit.com"),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
  // Cron security
  CRON_SECRET: z.string().optional(),
  ADMIN_EMAILS: z.string().default(""),
});

export const env = schema.parse(process.env);

export const isProd = env.NODE_ENV === "production";
export const adminEmails = env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
export const isAdminEmail = (email: string | null | undefined) =>
  !!email && adminEmails.includes(email.toLowerCase());
