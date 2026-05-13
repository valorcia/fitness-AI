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
  ELEVENLABS_API_KEY: z.string().optional(),
  HEYGEN_API_KEY: z.string().optional(),
  PEXELS_API_KEY: z.string().optional(),
  MUSCLE_MOTION_API_KEY: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
  ADMIN_EMAILS: z.string().default(""),
});

export const env = schema.parse(process.env);

export const isProd = env.NODE_ENV === "production";
export const adminEmails = env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
export const isAdminEmail = (email: string | null | undefined) =>
  !!email && adminEmails.includes(email.toLowerCase());
