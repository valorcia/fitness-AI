import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const metadata = { title: "Plan IA" };

export default async function PlanPage() {
  const session = await auth();
  const plan = await prisma.trainingPlan.findFirst({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: { workouts: { orderBy: { scheduledFor: "asc" } } },
  });

  if (!plan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aucun plan actif</CardTitle>
          <CardDescription>Complétez votre onboarding pour générer un plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/onboarding">Aller à l'onboarding</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                {plan.weeks} semaines · {plan.sessionsPerWeek} séances/semaine · {plan.goal}
              </CardDescription>
            </div>
            <Badge variant="outline">{plan.createdByAI ? "IA" : "Manuel"}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{plan.summary}</p>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {plan.workouts.map((w) => (
          <Card key={w.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <div className="font-semibold">{w.type}</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(w.scheduledFor).toLocaleDateString("fr-FR")}
                </div>
              </div>
              <Button asChild>
                <Link href={`/workout/${w.id}`}>Ouvrir</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
