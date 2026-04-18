import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame, Medal } from "lucide-react";

export const metadata = { title: "Progression" };

export default async function ProgressionPage() {
  const session = await auth();
  const userId = session!.user.id;
  const [badges, streak, xp] = await Promise.all([
    prisma.userBadge.findMany({ where: { userId }, include: { badge: true }, orderBy: { awardedAt: "desc" } }),
    prisma.streak.findUnique({ where: { userId } }),
    prisma.xPEntry.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);
  const totalXP = xp.reduce((acc, e) => acc + e.amount, 0);
  const level = Math.floor(Math.sqrt(totalXP / 50));

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Progression</h1>
        <p className="text-muted-foreground">XP, badges, streaks.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-full bg-primary/10 p-3 text-primary"><Trophy className="h-5 w-5" /></div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Niveau</div>
              <div className="text-lg font-semibold">Lvl {level}</div>
              <div className="text-xs text-muted-foreground">{totalXP} XP</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-full bg-amber-500/10 p-3 text-amber-400"><Flame className="h-5 w-5" /></div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Streak actuel</div>
              <div className="text-lg font-semibold">{streak?.current ?? 0} jours</div>
              <div className="text-xs text-muted-foreground">Record : {streak?.longest ?? 0}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-400"><Medal className="h-5 w-5" /></div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Badges</div>
              <div className="text-lg font-semibold">{badges.length}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
          <CardDescription>Débloqués au fil de vos séances.</CardDescription>
        </CardHeader>
        <CardContent>
          {badges.length === 0 ? (
            <p className="text-muted-foreground">Pas encore de badge. Complétez votre première séance !</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {badges.map((b) => (
                <div key={b.id} className="rounded-2xl border border-border/60 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{b.badge.name}</div>
                    <Badge variant="outline">{b.badge.tier}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{b.badge.description}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Journal XP</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {xp.length === 0 ? (
            <p className="text-muted-foreground">Aucun XP pour le moment.</p>
          ) : (
            xp.map((e) => (
              <div key={e.id} className="flex items-center justify-between border-b border-border/40 py-2 text-sm">
                <span>{e.reason}</span>
                <span className="font-semibold text-primary">+{e.amount}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
