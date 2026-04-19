"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Dumbbell, Footprints, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TopTabs } from "@/components/app/top-tabs";
import { cn, formatDistance, formatDuration } from "@/lib/utils";

type WorkoutDay = {
  id: string;
  type: string;
  status: string;
  date: string;
  durationSec: number | null;
  score: number | null;
};
type ActivityDay = {
  id: string;
  type: string;
  date: string;
  distanceM: number;
  durationSec: number;
};

export function CalendarView({
  monthISO,
  workouts,
  activities,
  nutritionByDate,
}: {
  monthISO: string;
  workouts: WorkoutDay[];
  activities: ActivityDay[];
  nutritionByDate: Record<string, number>;
}) {
  const [year, monthIdx] = monthISO.split("-").map(Number) as [number, number];
  const monthStart = new Date(Date.UTC(year, monthIdx - 1, 1));
  const monthLabel = monthStart.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const firstDay = new Date(monthStart);
  const dayOfWeek = (firstDay.getUTCDay() + 6) % 7;
  firstDay.setUTCDate(firstDay.getUTCDate() - dayOfWeek);
  const cells = Array.from({ length: 42 }).map((_, i) => {
    const d = new Date(firstDay);
    d.setUTCDate(firstDay.getUTCDate() + i);
    return d;
  });

  const byDate: Record<string, { workouts: WorkoutDay[]; activities: ActivityDay[] }> = {};
  for (const w of workouts) {
    const k = w.date.slice(0, 10);
    (byDate[k] ??= { workouts: [], activities: [] }).workouts.push(w);
  }
  for (const a of activities) {
    const k = a.date.slice(0, 10);
    (byDate[k] ??= { workouts: [], activities: [] }).activities.push(a);
  }

  const prevMonth = new Date(Date.UTC(year, monthIdx - 2, 1)).toISOString().slice(0, 7);
  const nextMonth = new Date(Date.UTC(year, monthIdx, 1)).toISOString().slice(0, 7);

  const [selected, setSelected] = React.useState<string | null>(null);
  const selectedData = selected ? byDate[selected] : null;

  return (
    <div className="grid gap-5">
      <TopTabs
        tabs={[
          { href: "/dashboard", label: "Tableau de bord" },
          { href: "/workout", label: "Entraînements" },
          { href: "/nutrition", label: "Alimentation" },
        ]}
      />

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <Button variant="ghost" size="icon" asChild className="text-primary">
              <Link href={`/calendar?month=${prevMonth}`}>
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h2 className="text-xl font-bold capitalize text-secondary">{monthLabel}</h2>
            <Button variant="ghost" size="icon" asChild className="text-primary">
              <Link href={`/calendar?month=${nextMonth}`}>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
            {["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."].map((d) => (
              <div key={d} className="pb-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((d) => {
              const k = d.toISOString().slice(0, 10);
              const entries = byDate[k];
              const inMonth = d.getUTCMonth() === monthIdx - 1;
              const hasCompleted = entries?.workouts.some((w) => w.status === "COMPLETED");
              const hasPlanned = entries?.workouts.some((w) => w.status === "PLANNED");
              const hasActivity = (entries?.activities.length ?? 0) > 0;
              const isToday = k === new Date().toISOString().slice(0, 10);
              return (
                <button
                  key={k}
                  onClick={() => setSelected(k)}
                  className={cn(
                    "flex min-h-16 flex-col items-center justify-start gap-1 rounded-xl py-2 text-sm transition",
                    !inMonth && "text-muted-foreground/40",
                    selected === k && "bg-primary/10",
                    isToday && !selected && "text-primary",
                  )}
                >
                  <span className={cn("font-semibold", isToday && "text-primary")}>
                    {d.getUTCDate()}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {hasCompleted && <Dumbbell className="h-3.5 w-3.5 text-secondary" />}
                    {hasPlanned && !hasCompleted && (
                      <Dumbbell className="h-3.5 w-3.5 text-muted-foreground/60" />
                    )}
                    {hasActivity && <Footprints className="h-3.5 w-3.5 text-amber-500" />}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedData && selected && (
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold capitalize">
                {new Date(selected).toLocaleDateString("fr-FR", { dateStyle: "full" })}
              </h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Flame className="h-3 w-3" />
                {nutritionByDate[selected] ?? 0} kcal
              </div>
            </div>
            <div className="grid gap-3">
              {selectedData.workouts.map((w) => (
                <Link
                  key={w.id}
                  href={`/workout/${w.id}`}
                  className="flex items-center justify-between rounded-xl border border-border/60 p-3 text-sm transition hover:border-primary/50"
                >
                  <div className="flex items-center gap-3">
                    <Dumbbell className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-semibold">{w.type}</div>
                      <div className="text-xs text-muted-foreground">
                        {w.durationSec ? formatDuration(w.durationSec) : "—"} ·{" "}
                        {w.score ? `${w.score}/100` : ""}
                      </div>
                    </div>
                  </div>
                  <Badge variant={w.status === "COMPLETED" ? "success" : "outline"}>{w.status}</Badge>
                </Link>
              ))}
              {selectedData.activities.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-xl border border-border/60 p-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <Footprints className="h-4 w-4 text-amber-500" />
                    <div>
                      <div className="font-semibold">{a.type}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistance(a.distanceM)} · {formatDuration(a.durationSec)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {selectedData.workouts.length === 0 && selectedData.activities.length === 0 && (
                <p className="text-sm text-muted-foreground">Rien ce jour-là.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
