import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { bmrMifflinStJeor, dailyWaterNeedMl, ageFromBirthDate } from "@/lib/utils";
import { PhotoCapture } from "@/features/nutrition/photo-capture";
import { TopTabs } from "@/components/app/top-tabs";

export const metadata = { title: "Nutrition" };

export default async function NutritionPage() {
  const session = await auth();
  const userId = session!.user.id;
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [nutritionToday, hydrationToday] = await Promise.all([
    prisma.nutritionLog.findMany({ where: { userId, consumedAt: { gte: today } } }),
    prisma.hydrationLog.findMany({ where: { userId, loggedAt: { gte: today } } }),
  ]);

  const kcal = nutritionToday.reduce((a, l) => a + l.kcal, 0);
  const ml = hydrationToday.reduce((a, l) => a + l.amountMl, 0);

  const age = ageFromBirthDate(profile.birthDate);
  const bmr = bmrMifflinStJeor({
    weightKg: profile.weightKg,
    heightCm: profile.heightCm,
    ageYears: age,
    sex: profile.sex,
  });
  const kcalTarget = Math.round(bmr * 1.55);
  const waterTarget = dailyWaterNeedMl({ weightKg: profile.weightKg });

  return (
    <div className="grid gap-6">
      <TopTabs
        tabs={[
          { href: "/dashboard", label: "Tableau de bord" },
          { href: "/workout", label: "Entraînements" },
          { href: "/nutrition", label: "Alimentation" },
        ]}
      />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nutrition & hydratation</h1>
        <p className="text-muted-foreground">Traçabilité complète des calories et macros.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calories du jour</CardTitle>
            <CardDescription>
              {kcal} / {kcalTarget} kcal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={Math.min(100, (kcal / kcalTarget) * 100)} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Hydratation</CardTitle>
            <CardDescription>
              {ml} / {waterTarget} ml
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <Progress value={Math.min(100, (ml / waterTarget) * 100)} />
            </div>
            <HydrationQuickLog />
          </CardContent>
        </Card>
      </div>

      <PhotoCapture />

      <Card>
        <CardHeader>
          <CardTitle>Repas du jour</CardTitle>
        </CardHeader>
        <CardContent>
          {nutritionToday.length === 0 ? (
            <p className="text-muted-foreground">Aucun repas saisi. Ajoutez votre petit-déjeuner.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {nutritionToday.map((m) => (
                <li key={m.id} className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span>{new Date(m.consumedAt).toLocaleTimeString("fr-FR")}</span>
                  <span>
                    {m.kcal} kcal · P{m.protein} C{m.carbs} L{m.fat}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function HydrationQuickLog() {
  return (
    <form action="/api/hydration" method="post">
      <button
        type="submit"
        className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110"
      >
        +250 ml
      </button>
    </form>
  );
}
