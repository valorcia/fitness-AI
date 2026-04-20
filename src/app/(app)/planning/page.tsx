import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TopTabs } from "@/components/app/top-tabs";
import { PlanningStudio } from "@/features/planning/planning-studio";

export const metadata = { title: "Planification" };

export default async function PlanningPage() {
  const session = await auth();
  const userId = session!.user.id;
  const [health, latestPlan, lastProposal] = await Promise.all([
    prisma.healthProfile.findUnique({ where: { userId } }),
    prisma.trainingPlan.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } }),
    prisma.planProposal.findFirst({
      where: { userId, status: "PENDING_USER" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="grid gap-5">
      <TopTabs
        tabs={[
          { href: "/dashboard", label: "Tableau de bord" },
          { href: "/workout", label: "Entraînements" },
          { href: "/nutrition", label: "Alimentation" },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-display-sm">Planification</h1>
          <p className="text-muted-foreground">
            Discutez avec votre coach pour construire le calendrier qui vous ressemble.
          </p>
        </div>
        {latestPlan && (
          <Badge variant="outline">
            Plan actuel : {latestPlan.name}
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Que voulez-vous travailler ?</CardTitle>
          <CardDescription>
            Dites-moi votre besoin — je vous propose un calendrier, vous ajustez, vous validez.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlanningStudio
            defaults={{
              sessionsPerWeek: health?.sessionsPerWeek ?? 3,
              sessionDurationMin: health?.sessionDurationMin ?? 45,
            }}
            initialProposal={
              lastProposal
                ? {
                    id: lastProposal.id,
                    summary: lastProposal.summary,
                    payload: lastProposal.payload as unknown as import("@/services/plan-conversational").GeneratedPlan,
                  }
                : null
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
