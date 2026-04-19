"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Dumbbell, Footprints } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  // Build 6-week grid starting Monday
  const firstDay = new Date(monthStart);
  const dayOfWeek = (firstDay.getUTCDay() + 6) % 7; // Monday=0
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
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight capitalize">{monthLabel}</h1>
          <p className="text-muted-foreground">Calendrier de vos séances et activités.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/calendar?month=${prevMonth}`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href={`/calendar?month=${nextMonth}`}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="mb-2 grid grid-cols-7 gap-1 text-xs uppercase tracking-wide text-muted-foreground">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
              <div key={d} className="px-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d) => {
              const k = d.toISOString().slice(0, 10);
              const entries = byDate[k];
              const inMonth = d.getUTCMonth() === monthIdx - 1;
              const hasCompleted = entries?.workouts.some((w) => w.status === "COMPLETED");
              const hasActivity = (entries?.activities.length ?? 0) > 0;
              const kcal = nutritionByDate[k] ?? 0;
              const isToday = k === new Date().toISOString().slice(0, 10);
              return (
                <button
                  key={k}
                  onClick={() => setSelected(k)}
                  className={cn(
                    "min-h-20 rounded-xl border border-border/40 p-2 text-left text-xs transition",
                    !inMonth && "opacity-40",
                    selected === k ? "border-primary bg-primary/10" : "hover:border-primary/50",
                    isToday && "ring-1 ring-primary",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn("font-semibold", isToday && "text-primary")}>
                      {d.getUTCDate()}
                    </span>
                    {kcal > 0 && <span className="text-[10px] text-muted-foreground">{kcal}kcal</span>}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {hasCompleted && (
                      <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300">
                        <Dumbbell className="h-3 w-3" />
                      </span>
                    )}
                    {entries?.workouts.some((w) => w.status === "PLANNED") && (
                      <span className="inline-flex items-center rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] text-primary">
                        <Dumbbell className="h-3 w-3" />
                      </span>
                    )}
                    {hasActivity && (
                      <span className="inline-flex items-center rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-300">
                        <Footprints className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedData && selected && (
        <Card>
          <CardHeader>
            <CardTitle>
              {new Date(selected).toLocaleDateString("fr-FR", { dateStyle: "full" })}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
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
                  <Footprints className="h-4 w-4 text-amber-400" />
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
