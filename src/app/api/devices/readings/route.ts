import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const KINDS = [
  "WEIGHT",
  "BODY_FAT",
  "HEART_RATE",
  "HRV",
  "SLEEP",
  "STEPS",
  "DISTANCE",
  "CALORIES",
  "VO2_MAX",
  "ACTIVITY",
  "BLOOD_PRESSURE",
  "SPO2",
  "RESTING_HR",
  "READINESS",
] as const;

const schema = z.object({
  kind: z.enum(KINDS),
  value: z.number().finite(),
  unit: z.string().max(30).default("n/a"),
  recordedAt: z.string().datetime().optional(),
  provider: z
    .enum([
      "GARMIN",
      "FITBIT",
      "OURA",
      "WITHINGS",
      "POLAR",
      "STRAVA",
      "APPLE_HEALTH",
      "GOOGLE_FIT",
      "TERRA",
      "MANUAL",
    ])
    .default("MANUAL"),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const reading = await prisma.deviceReading.create({
    data: {
      userId: session.user.id,
      provider: parsed.data.provider,
      kind: parsed.data.kind,
      value: parsed.data.value,
      unit: parsed.data.unit,
      recordedAt: parsed.data.recordedAt ? new Date(parsed.data.recordedAt) : new Date(),
      metadata: parsed.data.metadata as unknown as object | undefined,
    },
  });

  // Side effects: weight → keep Profile & WeightLog in sync.
  if (parsed.data.kind === "WEIGHT") {
    await prisma.weightLog.create({
      data: { userId: session.user.id, weightKg: parsed.data.value },
    });
    await prisma.profile.update({
      where: { userId: session.user.id },
      data: { weightKg: parsed.data.value },
    });
  }

  return NextResponse.json({ ok: true, reading });
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind");
  const readings = await prisma.deviceReading.findMany({
    where: {
      userId: session.user.id,
      ...(kind ? { kind: kind as (typeof KINDS)[number] } : {}),
    },
    orderBy: { recordedAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ readings });
}
