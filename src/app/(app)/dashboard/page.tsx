import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDuration } from "@/lib/utils";
import { Activity, Dumbbell, Flame, HeartPulse, Target } from "lucide-react";
import { CoachChat } from "@/features/coach/coach-chat";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [profile, sub, nextWorkout, last7, streak, xpSum] = await Promise.all([
    prisma.profile.findUnique({ where: { userId }, include: { user: true } }),
    prisma.subscription.findUnique({ where: { userId } }),
    prisma.workout.findFirst({
      where: { userId, status: { in: ["PLANNED", "IN_PROGRESS"] } },
      orderBy: { scheduledFor: "asc" },
    }),
    prisma.workout.findMany({
      where: { userId, completedAt: { gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) } },
      orderBy: { completedAt: "desc" },
      take: 7,
    }),
    prisma.streak.findUnique({ where: { userId } }),
    prisma.xPEntry.aggregate({ _sum: { amount: true }, where: { userId } }),
  ]);

  const weeklyLoad = last7.reduce((acc, w) => acc + (w.durationSec ?? 0), 0);
  const totalXP = xpSum._sum.amount ?? 0;
  const level = Math.floor(Math.sqrt(totalXP / 50));

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Plan adapté à votre objectif : {profile?.goal?.toLowerCase().replace("_", " ") ?? "—"}.
          </p>
        </div>
        <Badge variant="outline" className="uppercase">
          {sub?.tier ?? "FREE"} · {sub?.status ?? "ACTIVE"}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi icon={Flame} label="Streak" value={`${streak?.current ?? 0} j`} />
        <Kpi icon={Target} label="Niveau" value={`Lvl ${level}`} sub={`${totalXP} XP`} />
        <Kpi icon={Activity} label="Charge 7j" value={formatDuration(weeklyLoad)} />
        <Kpi
          icon={HeartPulse}
          label="Récupération"
          value={weeklyLoad > 4 * 3600 ? "Active" : "Prête"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" /> Prochaine séance
            </CardTitle>
            <CardDescription>Recommandée par votre coach IA.</CardDescription>
          </CardHeader>
          <CardContent>
            {nextWorkout ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">{nextWorkout.type}</div>
                  <div className="text-sm text-muted-foreground">
                    Prévue le {new Date(nextWorkout.scheduledFor).toLocaleString("fr-FR")}
                  </div>
                </div>
                <Button asChild variant="glow">
                  <Link href={`/workout/${nextWorkout.id}`}>Démarrer</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-muted-foreground">
                  Pas de séance planifiée. Générez un plan avec votre coach IA.
                </p>
                <Button asChild>
                  <Link href="/workout">Planifier</Link>
                </Button>
              </div>
            )}
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>Objectif hebdomadaire</span>
                <span className="text-muted-foreground">{last7.length}/5</span>
              </div>
              <Progress value={Math.min(100, (last7.length / 5) * 100)} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Coach IA</CardTitle>
            <CardDescription>Posez une question, demandez une adaptation.</CardDescription>
          </CardHeader>
          <CardContent>
            <CoachChat />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="rounded-full bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="text-lg font-semibold">{value}</div>
          {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
