import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, PRICE_ID_BY_TIER } from "@/lib/stripe";
import { env } from "@/lib/env";
import { rateLimits } from "@/lib/redis";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!stripe) return NextResponse.json({ error: "Stripe non configuré" }, { status: 503 });

  const rl = await rateLimits.checkout.limit(session.user.id);
  if (!rl.success) return NextResponse.json({ error: "Trop de tentatives." }, { status: 429 });

  const form = await req.formData().catch(() => null);
  const tier = (form?.get("tier") as string) || "PREMIUM";
  const priceId = PRICE_ID_BY_TIER[tier as keyof typeof PRICE_ID_BY_TIER];
  if (!priceId) return NextResponse.json({ error: "Plan inconnu" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { subscription: true },
  });
  if (!user?.email) return NextResponse.json({ error: "Email requis" }, { status: 400 });

  let customerId = user.subscription?.stripeCustomerId ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: { stripeCustomerId: customerId },
      create: { userId: user.id, stripeCustomerId: customerId },
    });
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${env.NEXT_PUBLIC_APP_URL}/subscription?success=1`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/subscription?canceled=1`,
    subscription_data: { trial_period_days: 7, metadata: { userId: user.id } },
  });

  return NextResponse.redirect(checkout.url!, { status: 303 });
}
