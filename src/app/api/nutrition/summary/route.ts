import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const days = Math.min(365, Math.max(1, Number(url.searchParams.get("days") ?? 7)));

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const [nutrition, hydration] = await Promise.all([
    prisma.nutritionLog.findMany({
      where: { userId: session.user.id, consumedAt: { gte: since } },
      select: { consumedAt: true, kcal: true, protein: true, carbs: true, fat: true },
    }),
    prisma.hydrationLog.findMany({
      where: { userId: session.user.id, loggedAt: { gte: since } },
      select: { loggedAt: true, amountMl: true },
    }),
  ]);

  const buckets: Record<
    string,
    { kcal: number; protein: number; carbs: number; fat: number; waterMl: number }
  > = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    buckets[key] = { kcal: 0, protein: 0, carbs: 0, fat: 0, waterMl: 0 };
  }
  for (const n of nutrition) {
    const key = n.consumedAt.toISOString().slice(0, 10);
    const b = buckets[key];
    if (!b) continue;
    b.kcal += n.kcal;
    b.protein += n.protein;
    b.carbs += n.carbs;
    b.fat += n.fat;
  }
  for (const h of hydration) {
    const key = h.loggedAt.toISOString().slice(0, 10);
    const b = buckets[key];
    if (!b) continue;
    b.waterMl += h.amountMl;
  }

  const series = Object.entries(buckets).map(([date, v]) => ({ date, ...v }));
  return NextResponse.json({ days, series });
}
