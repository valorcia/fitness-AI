import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { sendPushNotification, type PushPayload } from "@/lib/push/vapid";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { payload, userId } = await req.json() as { payload: PushPayload; userId?: string };

  const subs = await prisma.pushSubscription.findMany({
    where: userId ? { userId } : undefined,
  });

  const staleIds: string[] = [];
  let sent = 0;

  await Promise.allSettled(
    subs.map(async (sub, i) => {
      const ok = await sendPushNotification(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        payload,
      );
      if (ok) {
        sent++;
      } else {
        staleIds.push(subs[i]!.id);
      }
    }),
  );

  if (staleIds.length) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: staleIds } } });
  }

  return NextResponse.json({ sent, stale: staleIds.length });
}
