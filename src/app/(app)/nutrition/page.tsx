import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bmrMifflinStJeor, ageFromBirthDate, dailyWaterNeedMl } from "@/lib/utils";
import { TopTabs } from "@/components/app/top-tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NutritionDay } from "@/features/nutrition/nutrition-day";
import { NutritionTrend } from "@/features/nutrition/nutrition-trend";
import { PhotoCapture } from "@/features/nutrition/photo-capture";

export const metadata = { title: "Nutrition" };

function parseDateParam(value: string | undefined): Date {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T00:00:00`);
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function NutritionPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const session = await auth();
  const userId = session!.user.id;
  const { date } = await searchParams;
  const day = parseDateParam(date);
  const dayKey = day.toISOString().slice(0, 10);
  const start = new Date(day);
  const end = new Date(day);
  end.setDate(end.getDate() + 1);

  const [profile, logs, hydration, last7] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.nutritionLog.findMany({
      where: { userId, consumedAt: { gte: start, lt: end } },
      orderBy: { consumedAt: "asc" },
    }),
    prisma.hydrationLog.findMany({
      where: { userId, loggedAt: { gte: start, lt: end } },
    }),
    prisma.nutritionLog.findMany({
      where: { userId, consumedAt: { gte: new Date(Date.now() - 7 * 86400000) } },
      select: { consumedAt: true, kcal: true, protein: true, carbs: true, fat: true },
    }),
  ]);

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profil requis</CardTitle>
          <CardDescription>
            Complétez votre onboarding pour activer la nutrition.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/onboarding" className="text-primary underline">
            Aller à l'onboarding
          </Link>
        </CardContent>
      </Card>
    );
  }

  const age = ageFromBirthDate(profile.birthDate);
  const bmr = bmrMifflinStJeor({
    weightKg: profile.weightKg,
    heightCm: profile.heightCm,
    ageYears: age,
    sex: profile.sex,
  });
  const kcalTarget = Math.round(bmr * 1.55);
  const waterTarget = dailyWaterNeedMl({ weightKg: profile.weightKg });
  // Simple macros split : 30% protein / 45% carbs / 25% fat
  const proteinTarget = Math.round((kcalTarget * 0.3) / 4);
  const carbsTarget = Math.round((kcalTarget * 0.45) / 4);
  const fatTarget = Math.round((kcalTarget * 0.25) / 9);

  const totals = logs.reduce(
    (acc, l) => ({
      kcal: acc.kcal + l.kcal,
      protein: acc.protein + l.protein,
      carbs: acc.carbs + l.carbs,
      fat: acc.fat + l.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
  const waterMl = hydration.reduce((a, h) => a + h.amountMl, 0);

  // Build 7-day trend
  const trendMap: Record<string, { kcal: number; protein: number; carbs: number; fat: number }> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    trendMap[d.toISOString().slice(0, 10)] = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  }
  for (const l of last7) {
    const key = l.consumedAt.toISOString().slice(0, 10);
    const b = trendMap[key];
    if (!b) continue;
    b.kcal += l.kcal;
    b.protein += l.protein;
    b.carbs += l.carbs;
    b.fat += l.fat;
  }
  const trend = Object.entries(trendMap).map(([date, v]) => ({ date, ...v }));

  return (
    <div className="grid gap-5">
      <TopTabs
        tabs={[
          { href: "/dashboard", label: "Tableau de bord" },
          { href: "/workout", label: "Entraînements" },
          { href: "/nutrition", label: "Alimentation" },
        ]}
      />

      <div>
        <h1 className="font-display text-display-sm">Nutrition</h1>
        <p className="text-muted-foreground">
          Traçabilité jour par jour, macros et progression sur 7 jours.
        </p>
      </div>

      <NutritionDay
        dayKey={dayKey}
        totals={totals}
        targets={{
          kcal: kcalTarget,
          protein: proteinTarget,
          carbs: carbsTarget,
          fat: fatTarget,
          waterMl: waterTarget,
        }}
        waterMl={waterMl}
        logs={logs.map((l) => ({
          id: l.id,
          title: l.title,
          mealType: l.mealType,
          consumedAt: l.consumedAt.toISOString(),
          kcal: l.kcal,
          protein: l.protein,
          carbs: l.carbs,
          fat: l.fat,
          source: l.source,
          imageUrl: l.imageUrl,
        }))}
      />

      <PhotoCapture />

      <Card>
        <CardHeader>
          <CardTitle>Tendance 7 jours</CardTitle>
          <CardDescription>Calories journalières, écart à l'objectif.</CardDescription>
        </CardHeader>
        <CardContent>
          <NutritionTrend data={trend} target={kcalTarget} />
        </CardContent>
      </Card>
    </div>
  );
}
