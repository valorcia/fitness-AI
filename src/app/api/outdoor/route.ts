import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  type: z.enum(["CARDIO_RUN", "CARDIO_BIKE", "WALK"]).default("CARDIO_RUN"),
  durationSec: z.number().int().min(0),
  distanceM: z.number().min(0),
  points: z
    .array(
      z.object({
        lat: z.number(),
        lng: z.number(),
        recordedAt: z.string().datetime(),
        speed: z.number().nullable().optional(),
        heartRate: z.number().int().nullable().optional(),
      }),
    )
    .max(20000),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const { type, durationSec, distanceM, points } = parsed.data;
  const startedAt = points[0] ? new Date(points[0].recordedAt) : new Date(Date.now() - durationSec * 1000);
  const endedAt = points[points.length - 1] ? new Date(points[points.length - 1]!.recordedAt) : new Date();
  const avgPaceSecPerKm = distanceM > 100 ? Math.round((durationSec / distanceM) * 1000) : null;
  const avgSpeedKmh = durationSec > 0 ? (distanceM / 1000) / (durationSec / 3600) : 0;

  const activity = await prisma.outdoorActivity.create({
    data: {
      userId: session.user.id,
      type,
      startedAt,
      endedAt,
      distanceM,
      durationSec,
      avgPaceSecPerKm,
      avgSpeedKmh,
      caloriesKcal: Math.round(distanceM / 1000 * 60),
      points: {
        create: points.map((p) => ({
          recordedAt: new Date(p.recordedAt),
          lat: p.lat,
          lng: p.lng,
          speed: p.speed ?? null,
          heartRate: p.heartRate ?? null,
        })),
      },
    },
  });

  await prisma.xPEntry.create({
    data: {
      userId: session.user.id,
      amount: Math.max(10, Math.round(distanceM / 100)),
      reason: `Outdoor ${type}`,
    },
  });

  return NextResponse.json({ ok: true, id: activity.id });
}
