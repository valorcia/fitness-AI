import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, tierFromPriceId } from "@/lib/stripe";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!stripe) return NextResponse.json({ error: "Stripe non configuré" }, { status: 503 });
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET manquant" }, { status: 500 });
  }
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.warn("stripe_webhook_invalid_sig", { err: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = (sub.metadata?.userId as string | undefined) ?? null;
        const priceId = sub.items.data[0]?.price.id;
        const tier = tierFromPriceId(priceId);
        await prisma.subscription.update({
          where: userId ? { userId } : { stripeCustomerId: sub.customer as string },
          data: {
            tier,
            status: mapStatus(sub.status),
            stripeSubscriptionId: sub.id,
            stripePriceId: priceId,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
          },
        });
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.update({
          where: { stripeCustomerId: sub.customer as string },
          data: { tier: "FREE", status: "CANCELED", stripeSubscriptionId: null, stripePriceId: null },
        });
        break;
      }
      default:
        break;
    }
  } catch (e) {
    logger.error("stripe_webhook_handler", { event: event.type, err: e instanceof Error ? e.message : String(e) });
    return NextResponse.json({ error: "Handler failure" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function mapStatus(s: Stripe.Subscription.Status) {
  switch (s) {
    case "active":
      return "ACTIVE" as const;
    case "trialing":
      return "TRIALING" as const;
    case "past_due":
      return "PAST_DUE" as const;
    case "canceled":
      return "CANCELED" as const;
    case "incomplete":
    case "incomplete_expired":
      return "INCOMPLETE" as const;
    case "unpaid":
      return "UNPAID" as const;
    default:
      return "ACTIVE" as const;
  }
}
