import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExerciseIllustration } from "@/components/exercise/exercise-illustration";
import { CATEGORY_META } from "@/lib/exercises/catalog";
import type { ExerciseCategory } from "@prisma/client";

export const metadata = { title: "Catalogue d'exercices" };

export default async function ExercisesPage() {
  const exercises = await prisma.exercise.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });
  const byCategory = exercises.reduce<Record<ExerciseCategory, typeof exercises>>(
    (acc, e) => {
      (acc[e.category] ??= []).push(e);
      return acc;
    },
    {} as Record<ExerciseCategory, typeof exercises>,
  );

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Catalogue d'exercices</h1>
        <p className="text-muted-foreground">
          {exercises.length} exercices illustrés, classés par zone musculaire.
        </p>
      </div>

      {(Object.entries(byCategory) as Array<[ExerciseCategory, typeof exercises]>).map(
        ([cat, list]) => (
          <section key={cat} className="grid gap-3">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <span className="text-2xl">{CATEGORY_META[cat].emoji}</span>
              {CATEGORY_META[cat].label}
              <Badge variant="outline">{list.length}</Badge>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((e) => (
                <Card key={e.id}>
                  <CardHeader className="flex-row items-center gap-3 space-y-0">
                    <ExerciseIllustration category={e.category} slug={e.slug} size="sm" />
                    <div className="min-w-0 flex-1">
                      <CardTitle className="truncate text-base">{e.name}</CardTitle>
                      <div className="flex flex-wrap gap-1 pt-1">
                        <Badge variant="outline" className="text-[10px]">
                          {e.difficulty}
                        </Badge>
                        {e.isOutdoor && (
                          <Badge variant="secondary" className="text-[10px]">
                            outdoor
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 text-xs text-muted-foreground">
                    <div>
                      <span className="text-foreground">Muscles :</span>{" "}
                      {e.primaryMuscles.join(", ")}
                    </div>
                    {e.equipment.length > 0 && (
                      <div>
                        <span className="text-foreground">Matériel :</span>{" "}
                        {e.equipment.join(", ")}
                      </div>
                    )}
                    {e.cues.length > 0 && (
                      <div className="mt-2 line-clamp-2 italic">{e.cues.join(" · ")}</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ),
      )}
    </div>
  );
}
