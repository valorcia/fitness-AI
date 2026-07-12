import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/env";
import { sendPushNotification } from "@/lib/push/vapid";
import type { PushPayload } from "@/lib/push/vapid";

export const runtime = "nodejs";

const schema = z.object({
  // Either target a specific user or send to all subscribers
  userId: z.string().optional(),
  notification: z.object({
    title: z.string().max(64),
    body: z.string().max(200),
    tag: z.string().optional(),
    url: z.string().optional(),
  }),
});

// Internal route — admin only
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const { userId, notification } = parsed.data;

  const subs = await prisma.pushSubscription.findMany({
    where: userId ? { userId } : undefined,
    take: 500,
  });

  const payload: PushPayload = notification;
  const results = await Promise.allSettled(subs.map((s) => sendPushNotification(s, payload)));

  const sent = results.filter((r) => r.status === "fulfilled" && r.value).length;
  const failed = results.length - sent;

  // Remove stale subscriptions (404/410 from push service)
  const staleIndexes = results
    .map((r, i) => (r.status === "fulfilled" && !r.value ? i : -1))
    .filter((i) => i >= 0);
  if (staleIndexes.length) {
    const staleEndpoints = staleIndexes.map((i) => subs[i]!.endpoint);
    await prisma.pushSubscription.deleteMany({ where: { endpoint: { in: staleEndpoints } } });
  }

  return NextResponse.json({ sent, failed });
}
