import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";

export const metadata = { title: "Séances" };

export default async function WorkoutsPage() {
  const session = await auth();
  const userId = session!.user.id;
  const workouts = await prisma.workout.findMany({
    where: { userId },
    orderBy: { scheduledFor: "desc" },
    take: 20,
  });

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Séances</h1>
          <p className="text-muted-foreground">Programmées, en cours, terminées.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/workout/new">Nouvelle séance libre</Link>
          </Button>
          <Button asChild variant="glow">
            <Link href="/workout/plan">Générer un plan IA</Link>
          </Button>
        </div>
      </div>

      {workouts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Aucune séance pour le moment.</p>
            <Button asChild className="mt-4">
              <Link href="/workout/plan">Générer un plan IA</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {workouts.map((w) => (
            <Card key={w.id}>
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{w.type}</CardTitle>
                    <Badge
                      variant={
                        w.status === "COMPLETED"
                          ? "success"
                          : w.status === "IN_PROGRESS"
                            ? "warning"
                            : "outline"
                      }
                    >
                      {w.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {new Date(w.scheduledFor).toLocaleString("fr-FR")}
                    {w.durationSec ? ` · ${formatDuration(w.durationSec)}` : ""}
                  </CardDescription>
                </div>
                <Button asChild variant={w.status === "COMPLETED" ? "outline" : "default"}>
                  <Link href={`/workout/${w.id}`}>
                    {w.status === "COMPLETED" ? "Voir résumé" : "Ouvrir"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
