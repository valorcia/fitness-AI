import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TopTabs } from "@/components/app/top-tabs";
import { CoachChat } from "@/features/coach/coach-chat";
import { formatDuration } from "@/lib/utils";
import { Flame, HeartPulse, Play, Share2, Lock, Sparkles } from "lucide-react";
import { CATEGORY_META } from "@/lib/exercises/catalog";

export const metadata = { title: "Tableau de bord" };

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?auto=format&fit=crop&w=1400&q=70";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [profile, sub, prefs, currentCoach, plan, last7, streak, xpSum] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.subscription.findUnique({ where: { userId } }),
    prisma.preference.findUnique({ where: { userId } }),
    prisma.preference.findUnique({ where: { userId } }).then((p) =>
      p?.coachProfileSlug
        ? prisma.coachProfile.findUnique({ where: { slug: p.coachProfileSlug } })
        : null,
    ),
    prisma.trainingPlan.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        workouts: {
          orderBy: { scheduledFor: "asc" },
          take: 8,
          include: { sets: { take: 1, include: { exercise: true } } },
        },
      },
    }),
    prisma.workout.findMany({
      where: { userId, completedAt: { gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) } },
      select: { id: true, type: true, durationSec: true, caloriesKcal: true, completedAt: true },
    }),
    prisma.streak.findUnique({ where: { userId } }),
    prisma.xPEntry.aggregate({ _sum: { amount: true }, where: { userId } }),
  ]);

  const totalXP = xpSum._sum.amount ?? 0;
  const level = Math.floor(Math.sqrt(totalXP / 50));
  const caloriesBurned = last7.reduce((a, w) => a + (w.caloriesKcal ?? 0), 0);
  const firstPlanned = plan?.workouts.find((w) => w.status === "PLANNED");
  const completedThisWeek = last7.length;

  return (
    <div className="grid gap-6">
      <TopTabs
        tabs={[
          { href: "/dashboard", label: "Tableau de bord" },
          { href: "/workout", label: "Entraînements" },
          { href: "/nutrition", label: "Alimentation" },
        ]}
      />

      {/* Info banners */}
      <div className="grid gap-3 md:grid-cols-2">
        <Card className="border-0 bg-sky-400/90 text-white">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium">
              Découvrez comment créer de nouveaux entraînements.
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-primary text-primary-foreground">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
              <Share2 className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium">
              Partage ton entraînement. Appuie et envoie le lien.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Hero plan card */}
      {plan && (
        <div className="relative overflow-hidden rounded-3xl bg-secondary text-secondary-foreground">
          <Image
            src={HERO_IMAGE}
            alt=""
            fill
            sizes="(min-width:768px) 700px, 100vw"
            className="object-cover object-center opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/60 to-transparent" />
          <div className="relative p-5 md:p-7">
            <div className="max-w-[60%] space-y-2">
              <h2 className="text-2xl font-bold leading-tight md:text-3xl">{plan.name}</h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5">
                  🏋️ {profile?.environment === "GYM" ? "À la salle de sport" : profile?.environment === "HOME" ? "À la maison" : "Outdoor"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5">
                  {profile?.fitnessLevel === "ELITE"
                    ? "★★★★ Elite"
                    : profile?.fitnessLevel === "ADVANCED"
                      ? "★★★ Expert"
                      : profile?.fitnessLevel === "INTERMEDIATE"
                        ? "★★ Intermédiaire"
                        : "★ Débutant"}
                </span>
              </div>
              <p className="text-sm text-white/85">
                {plan.weeks * 7} jours d'entraînement ({plan.sessionsPerWeek} séances par semaine)
              </p>
              <p className="text-sm text-white/85">
                Entraînements effectués : <span className="font-bold">{completedThisWeek}</span>
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {firstPlanned && (
                <Button asChild size="lg">
                  <Link href={`/workout/${firstPlanned.id}`}>
                    <Play className="h-4 w-4" /> Démarrer la séance
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="lg" asChild className="border-white/40 bg-white/10 text-white hover:bg-white/20">
                <Link href="/workout/plan">Voir le plan</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Calories brûlées" value={`${caloriesBurned}`} sub="7 derniers jours" icon="🔥" />
        <Kpi label="Streak" value={`${streak?.current ?? 0} j`} sub={`Record ${streak?.longest ?? 0}`} icon="⚡" />
        <Kpi label="Niveau" value={`Lvl ${level}`} sub={`${totalXP} XP`} icon="🏆" />
        <Kpi label="Séances" value={`${completedThisWeek}`} sub="cette semaine" icon="💪" />
      </div>

      {/* Session roadmap (locked days) */}
      {plan && plan.workouts.length > 0 && (
        <section className="grid gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Entraînement suivant</h3>
            <Link href="/workout/plan" className="text-sm font-semibold text-primary">
              Tout voir
            </Link>
          </div>
          <div className="grid gap-3">
            {plan.workouts.slice(0, 5).map((w, idx) => {
              const isNext = w.status === "PLANNED" && w.id === firstPlanned?.id;
              const locked = idx > (firstPlanned ? plan.workouts.indexOf(firstPlanned) : 0) && w.status === "PLANNED";
              const firstSet = w.sets[0];
              const categoryLabel = firstSet ? CATEGORY_META[firstSet.exercise.category].label : w.type;
              return (
                <Card key={w.id} className={isNext ? "ring-2 ring-primary" : ""}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div
                      className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 ${
                        isNext ? "border-primary text-primary" : "border-rose-200 text-rose-400"
                      }`}
                    >
                      {locked ? <Lock className="h-5 w-5" /> : <span className="text-xs font-bold">0%</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        {idx + 1} jour d'entraînement
                      </div>
                      <div className="truncate text-lg font-bold capitalize">{categoryLabel.toLowerCase()}</div>
                    </div>
                    {isNext ? (
                      <Button asChild size="sm">
                        <Link href={`/workout/${w.id}`}>Démarrer</Link>
                      </Button>
                    ) : locked ? (
                      <span className="text-xs text-muted-foreground">Verrouillé</span>
                    ) : (
                      <Link href={`/workout/${w.id}`} className="text-sm font-semibold text-primary">
                        Voir
                      </Link>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Coach assistant */}
      <Card>
        <CardContent className="p-4 md:p-5">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-bold">
              <HeartPulse className="h-5 w-5 text-primary" /> Votre coach vous parle
            </div>
            <Link href="/coach" className="text-sm font-semibold text-primary">
              Ouvrir →
            </Link>
          </div>
          <CoachChat
            coachName={currentCoach?.displayName.split(" ")[0] ?? prefs?.coachName ?? "Pulse"}
            coachAvatar={prefs?.coachAvatar ?? "default"}
            voiceEnabled={prefs?.voiceEnabled ?? true}
            openaiVoice={currentCoach?.openaiVoice ?? "nova"}
            elevenLabsVoiceId={currentCoach?.elevenLabsVoiceId ?? undefined}
            portraitUrl={currentCoach?.portraitUrl}
          />
        </CardContent>
      </Card>

      {/* Weekly goal */}
      <Card>
        <CardContent className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-lg font-bold">Objectif hebdomadaire</div>
              <div className="text-sm text-muted-foreground">
                {completedThisWeek} / {profile?.fitnessLevel === "BEGINNER" ? 3 : 5} séances
              </div>
            </div>
            <Flame className="h-6 w-6 text-primary" />
          </div>
          <Progress
            value={Math.min(
              100,
              (completedThisWeek / (profile?.fitnessLevel === "BEGINNER" ? 3 : 5)) * 100,
            )}
          />
          <div className="mt-2 text-xs text-muted-foreground">
            Temps total : {formatDuration(last7.reduce((a, w) => a + (w.durationSec ?? 0), 0))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
          <span>{icon}</span>
          {label}
        </div>
        <div className="mt-1 text-2xl font-bold">{value}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}
