import Stripe from "stripe";
import { env } from "./env";
import type { PlanTier } from "@prisma/client";

export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
      typescript: true,
    })
  : null;

export const PRICE_ID_BY_TIER: Record<Exclude<PlanTier, "FREE">, string | undefined> = {
  PREMIUM: env.STRIPE_PRICE_PREMIUM_MONTHLY,
  PRO: env.STRIPE_PRICE_PRO_MONTHLY,
  ELITE: env.STRIPE_PRICE_ELITE_MONTHLY,
};

export function tierFromPriceId(priceId: string | null | undefined): PlanTier {
  if (!priceId) return "FREE";
  if (priceId === env.STRIPE_PRICE_PREMIUM_MONTHLY) return "PREMIUM";
  if (priceId === env.STRIPE_PRICE_PRO_MONTHLY) return "PRO";
  if (priceId === env.STRIPE_PRICE_ELITE_MONTHLY) return "ELITE";
  return "FREE";
}
