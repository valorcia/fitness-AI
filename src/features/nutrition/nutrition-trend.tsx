"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Point = { date: string; kcal: number; protein: number; carbs: number; fat: number };

export function NutritionTrend({ data, target }: { data: Point[]; target: number }) {
  const max = Math.max(target * 1.2, ...data.map((d) => d.kcal), 1);
  const avg = data.length ? Math.round(data.reduce((a, d) => a + d.kcal, 0) / data.length) : 0;
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>7 derniers jours · moyenne {avg} kcal / jour</span>
        <span>Objectif {target} kcal</span>
      </div>
      <div className="flex h-40 items-end gap-2">
        {data.map((d) => {
          const hPct = (d.kcal / max) * 100;
          const over = d.kcal > target * 1.05;
          const under = d.kcal > 0 && d.kcal < target * 0.85;
          return (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
              <div className="relative flex h-full w-full items-end">
                <div
                  className={cn(
                    "w-full rounded-t-md transition-all",
                    over ? "bg-destructive/70" : under ? "bg-amber-400" : "bg-primary",
                  )}
                  style={{ height: `${Math.max(4, hPct)}%` }}
                  title={`${d.kcal} kcal`}
                />
                {/* target line */}
                <div
                  className="absolute left-0 right-0 border-t border-dashed border-muted-foreground/40"
                  style={{ bottom: `${Math.min(100, (target / max) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">
                {new Date(d.date).toLocaleDateString("fr-FR", { weekday: "short" })[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
