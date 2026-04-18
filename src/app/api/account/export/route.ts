import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;
  const [user, profile, health, prefs, workouts, feedback, activities, nutrition, hydration, sleep, consents] =
    await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.profile.findUnique({ where: { userId } }),
      prisma.healthProfile.findUnique({ where: { userId } }),
      prisma.preference.findUnique({ where: { userId } }),
      prisma.workout.findMany({ where: { userId } }),
      prisma.workoutFeedback.findMany({ where: { userId } }),
      prisma.outdoorActivity.findMany({ where: { userId } }),
      prisma.nutritionLog.findMany({ where: { userId } }),
      prisma.hydrationLog.findMany({ where: { userId } }),
      prisma.sleepLog.findMany({ where: { userId } }),
      prisma.consent.findMany({ where: { userId } }),
    ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    user,
    profile,
    health,
    prefs,
    workouts,
    feedback,
    activities,
    nutrition,
    hydration,
    sleep,
    consents,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="pulsecoach-export-${userId}.json"`,
    },
  });
}
