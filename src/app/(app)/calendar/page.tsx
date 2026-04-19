import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CalendarView } from "@/features/calendar/calendar-view";

export const metadata = { title: "Calendrier" };

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await auth();
  const { month } = await searchParams;
  const target = month ? new Date(`${month}-01`) : new Date();
  const start = new Date(target.getFullYear(), target.getMonth(), 1);
  const end = new Date(target.getFullYear(), target.getMonth() + 1, 1);

  const [workouts, activities, nutrition] = await Promise.all([
    prisma.workout.findMany({
      where: { userId: session!.user.id, scheduledFor: { gte: start, lt: end } },
      orderBy: { scheduledFor: "asc" },
      select: {
        id: true,
        type: true,
        status: true,
        scheduledFor: true,
        completedAt: true,
        durationSec: true,
        score: true,
        caloriesKcal: true,
      },
    }),
    prisma.outdoorActivity.findMany({
      where: { userId: session!.user.id, startedAt: { gte: start, lt: end } },
      orderBy: { startedAt: "asc" },
      select: {
        id: true,
        type: true,
        startedAt: true,
        distanceM: true,
        durationSec: true,
        caloriesKcal: true,
      },
    }),
    prisma.nutritionLog.groupBy({
      by: ["consumedAt"],
      where: { userId: session!.user.id, consumedAt: { gte: start, lt: end } },
      _sum: { kcal: true },
    }),
  ]);

  return (
    <CalendarView
      monthISO={`${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`}
      workouts={workouts.map((w) => ({
        id: w.id,
        type: w.type,
        status: w.status,
        date: w.scheduledFor.toISOString(),
        durationSec: w.durationSec,
        score: w.score,
      }))}
      activities={activities.map((a) => ({
        id: a.id,
        type: a.type,
        date: a.startedAt.toISOString(),
        distanceM: a.distanceM,
        durationSec: a.durationSec,
      }))}
      nutritionByDate={Object.fromEntries(
        nutrition.map((n) => [n.consumedAt.toISOString().slice(0, 10), n._sum.kcal ?? 0]),
      )}
    />
  );
}
