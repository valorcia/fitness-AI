import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { TopTabs } from "@/components/app/top-tabs";
import { CATEGORY_META } from "@/lib/exercises/catalog";
import { ExerciseDemo } from "@/components/exercise/exercise-demo";
import { ExerciseVideo } from "@/components/exercise/exercise-video";
import type { ExerciseCategory } from "@prisma/client";

export const metadata = { title: "Catalogue d'exercices" };

export default async function ExercisesPage() {
  const exercises = await prisma.exercise.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
  const byCategory = exercises.reduce<Record<ExerciseCategory, typeof exercises>>(
    (acc, e) => {
      (acc[e.category] ??= []).push(e);
      return acc;
    },
    {} as Record<ExerciseCategory, typeof exercises>,
  );

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
        <h1 className="font-display text-display-sm">Bibliothèque d'exercices</h1>
        <p className="text-muted-foreground">
          {exercises.length} exercices — photos, vidéos et démonstrations animées.
        </p>
      </div>

      {(Object.entries(byCategory) as Array<[ExerciseCategory, typeof exercises]>).map(
        ([cat, list]) => (
          <section key={cat} className="grid gap-3">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-2xl font-bold tracking-tight">
                <span className="mr-2 align-middle text-2xl">{CATEGORY_META[cat].emoji}</span>
                {CATEGORY_META[cat].label}
              </h2>
              <Badge variant="outline">{list.length}</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((e) => (
                <article
                  key={e.id}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card elevated transition hover:-translate-y-0.5 hover:border-primary/50"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {e.thumbnailUrl ? (
                      <Image
                        src={e.thumbnailUrl}
                        alt={e.name}
                        fill
                        sizes="(min-width:1024px) 360px, 100vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <ExerciseDemo
                        category={e.category}
                        slug={e.slug}
                        className="h-full w-full rounded-none"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 text-white">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{e.name}</div>
                        <div className="truncate text-[11px] opacity-80">
                          {e.primaryMuscles.slice(0, 3).join(" · ")}
                        </div>
                      </div>
                      <Badge className="shrink-0 bg-white/20 text-[10px] backdrop-blur">
                        {e.difficulty}
                      </Badge>
                    </div>
                  </div>
                  {process.env.PEXELS_API_KEY && !e.thumbnailUrl ? (
                    <ExerciseVideo slug={e.slug} className="aspect-[16/10]" />
                  ) : null}
                  <div className="flex flex-wrap items-center gap-1.5 p-3 text-xs">
                    {e.equipment.slice(0, 3).map((eq) => (
                      <span
                        key={eq}
                        className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground"
                      >
                        {eq}
                      </span>
                    ))}
                    {e.isOutdoor && <Badge variant="success">outdoor</Badge>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ),
      )}
    </div>
  );
}
