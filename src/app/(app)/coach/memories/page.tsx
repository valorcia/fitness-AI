import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getCurrentCoach } from "@/lib/coach/current-coach";
import { MemoriesList } from "@/features/coach/memories-list";
import { Card, CardContent } from "@/components/ui/card";
import { CoachPortrait } from "@/features/coach/coach-portrait";

export const metadata = { title: "Souvenirs de mon coach" };

export default async function MemoriesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [coach, rawMemories] = await Promise.all([
    getCurrentCoach(userId),
    prisma.coachMemory.findMany({
      where: { userId },
      orderBy: [{ weight: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        kind: true,
        content: true,
        weight: true,
        source: true,
        createdAt: true,
      },
    }),
  ]);

  const memories = rawMemories.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Souvenirs partagés</h1>
        <p className="text-muted-foreground">
          Ce que {coach.displayName} retient de vous, ce qu'il oublie, ce que vous voulez qu'il garde.
        </p>
      </div>

      <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card">
        <CardContent className="flex items-start gap-4 p-5">
          <CoachPortrait
            portraitUrl={coach.portraitUrl}
            name={coach.displayName}
            size="md"
            fallbackKey={coach.avatarKey}
          />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              {coach.displayName}
            </p>
            <p className="mt-1 text-sm leading-relaxed">
              «&nbsp;Voici tout ce que je sais sur toi. Tu as le contrôle total — corrige, complète,
              ou supprime ce qui ne te ressemble plus. Plus mes souvenirs sont justes, mieux je peux
              t'accompagner.&nbsp;»
            </p>
          </div>
        </CardContent>
      </Card>

      <MemoriesList initial={memories} coachName={coach.displayName} />

      <p className="text-xs text-muted-foreground">
        Conformément au RGPD (Art. 15, 16 et 17), vous avez un droit d'accès, de rectification et
        d'effacement sur ces données. Vous pouvez également télécharger ou supprimer l'intégralité
        de vos données depuis vos <a href="/settings" className="underline">paramètres</a>.
      </p>
    </div>
  );
}
