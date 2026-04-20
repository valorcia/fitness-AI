import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TopTabs } from "@/components/app/top-tabs";
import { CATEGORY_META } from "@/lib/exercises/catalog";
import { CalendarClock, Dumbbell, Lock, PlayCircle } from "lucide-react";

export const metadata = { title: "Plan IA" };

const FALLBACK_PHOTO =
  "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=900&q=70";

const SESSION_PHOTOS: Record<string, string> = {
  STRENGTH:
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=70",
  HYPERTROPHY:
    "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=70",
  HIIT:
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=70",
  CARDIO_RUN:
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=70",
  CARDIO_BIKE:
    "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=900&q=70",
  WALK:
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=70",
  MOBILITY:
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=70",
  RECOVERY:
    "https://images.unsplash.com/photo-1506629905607-ac3d75c40ffa?auto=format&fit=crop&w=900&q=70",
  CUSTOM: FALLBACK_PHOTO,
};

export default async function PlanPage() {
  const session = await auth();
  const plan = await prisma.trainingPlan.findFirst({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      workouts: {
        orderBy: { scheduledFor: "asc" },
        include: { sets: { take: 1, include: { exercise: true } } },
      },
    },
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

  const firstPlanned = plan.workouts.find((w) => w.status === "PLANNED");
  const firstPlannedIdx = firstPlanned ? plan.workouts.indexOf(firstPlanned) : 0;

  return (
    <div className="grid gap-6">
      <TopTabs
        tabs={[
          { href: "/dashboard", label: "Tableau de bord" },
          { href: "/workout", label: "Entraînements" },
          { href: "/nutrition", label: "Alimentation" },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-display-sm">{plan.name}</h1>
          <p className="text-muted-foreground">
            {plan.weeks} semaines · {plan.sessionsPerWeek} séances / semaine · {plan.goal}
          </p>
        </div>
        <Badge variant="outline">{plan.createdByAI ? "IA" : "Manuel"}</Badge>
      </div>

      {plan.summary && (
        <Card>
          <CardContent className="p-5 text-sm text-muted-foreground">{plan.summary}</CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {plan.workouts.map((w, idx) => {
          const locked = idx > firstPlannedIdx && w.status === "PLANNED";
          const isNext = w.id === firstPlanned?.id;
          const firstSet = w.sets[0];
          const subtitle = firstSet
            ? CATEGORY_META[firstSet.exercise.category].label
            : w.type.replace("_", " ");
          const image = SESSION_PHOTOS[w.type] ?? FALLBACK_PHOTO;
          return (
            <article
              key={w.id}
              className="relative overflow-hidden rounded-3xl border border-border bg-card elevated"
            >
              <div className="relative aspect-[16/9]">
                <Image src={image} alt="" fill sizes="(min-width:768px) 560px, 100vw" className="object-cover" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute left-4 top-4 flex items-center gap-2 text-xs text-white/90">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {new Date(w.scheduledFor).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                  })}
                </div>
                {isNext && (
                  <Badge className="absolute right-4 top-4 bg-primary text-primary-foreground">
                    Prochaine séance
                  </Badge>
                )}
                {locked && (
                  <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                    <Lock className="h-4 w-4 text-white" />
                  </div>
                )}
                <div className="absolute inset-x-4 bottom-4 text-white">
                  <div className="text-xs uppercase tracking-[0.18em] opacity-80">
                    Jour {idx + 1}
                  </div>
                  <div className="font-display text-2xl font-bold leading-tight">
                    {subtitle}
                  </div>
                  <div className="mt-1 text-xs opacity-80">{w.type.replace("_", " ")}</div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Dumbbell className="h-3.5 w-3.5" />
                  {w.status === "COMPLETED"
                    ? "Terminée"
                    : w.status === "IN_PROGRESS"
                      ? "En cours"
                      : locked
                        ? "Verrouillée"
                        : "Planifiée"}
                </div>
                {locked ? (
                  <span className="text-xs text-muted-foreground">Déverrouille la précédente</span>
                ) : (
                  <Button asChild size="sm">
                    <Link href={`/workout/${w.id}`}>
                      <PlayCircle className="h-4 w-4" />
                      {isNext ? "Démarrer" : "Ouvrir"}
                    </Link>
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
