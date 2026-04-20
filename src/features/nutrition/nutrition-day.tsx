"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Log = {
  id: string;
  title: string | null;
  mealType: string | null;
  consumedAt: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  source: string;
  imageUrl: string | null;
};

type Props = {
  dayKey: string;
  totals: { kcal: number; protein: number; carbs: number; fat: number };
  targets: { kcal: number; protein: number; carbs: number; fat: number; waterMl: number };
  waterMl: number;
  logs: Log[];
};

const MEAL_SECTIONS: Array<{ key: string; label: string; emoji: string }> = [
  { key: "BREAKFAST", label: "Petit-déjeuner", emoji: "🥐" },
  { key: "LUNCH", label: "Déjeuner", emoji: "🥗" },
  { key: "SNACK", label: "Collation", emoji: "🍎" },
  { key: "PRE_WORKOUT", label: "Avant séance", emoji: "⚡" },
  { key: "POST_WORKOUT", label: "Après séance", emoji: "💪" },
  { key: "DINNER", label: "Dîner", emoji: "🍽️" },
  { key: "_NONE", label: "Non catégorisé", emoji: "•" },
];

export function NutritionDay({ dayKey, totals, targets, waterMl, logs }: Props) {
  const router = useRouter();
  const [adding, setAdding] = React.useState<string | null>(null);

  const prevKey = isoOffset(dayKey, -1);
  const nextKey = isoOffset(dayKey, 1);
  const isToday = dayKey === new Date().toISOString().slice(0, 10);

  const groups = React.useMemo(() => {
    const out: Record<string, Log[]> = {};
    for (const l of logs) {
      const k = l.mealType ?? "_NONE";
      (out[k] ??= []).push(l);
    }
    return out;
  }, [logs]);

  async function addWater(amountMl: number) {
    await fetch("/api/hydration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountMl }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    await fetch(`/api/nutrition/log/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center rounded-full border border-border bg-card p-1 shadow-sm">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/nutrition?date=${prevKey}`} aria-label="Jour précédent">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-2 px-3 text-sm font-semibold">
            <CalendarDays className="h-4 w-4 text-primary" />
            {formatDayLabel(dayKey, isToday)}
          </div>
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/nutrition?date=${nextKey}`} aria-label="Jour suivant">
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        {!isToday && (
          <Button variant="outline" size="sm" asChild>
            <Link href="/nutrition">Aujourd'hui</Link>
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="grid items-center gap-6 p-5 md:grid-cols-[240px_1fr]">
          <KcalRing value={totals.kcal} target={targets.kcal} />
          <div className="grid gap-3">
            <MacroBar label="Protéines" value={totals.protein} target={targets.protein} unit="g" color="#14B8A6" />
            <MacroBar label="Glucides" value={totals.carbs} target={targets.carbs} unit="g" color="#F59E0B" />
            <MacroBar label="Lipides" value={totals.fat} target={targets.fat} unit="g" color="#EF4444" />
            <div className="mt-2 flex items-center justify-between rounded-xl border border-border/60 p-3">
              <div className="flex items-center gap-2 text-sm">
                <Droplet className="h-4 w-4 text-sky-500" />
                <span className="font-semibold">{waterMl} ml</span>
                <span className="text-muted-foreground">/ {targets.waterMl} ml</span>
              </div>
              <div className="flex gap-2">
                {[250, 500].map((amt) => (
                  <Button key={amt} size="sm" variant="outline" onClick={() => addWater(amt)}>
                    +{amt}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {MEAL_SECTIONS.map((sec) => {
          const list = groups[sec.key] ?? [];
          return (
            <Card key={sec.key}>
              <CardContent className="grid gap-2 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span>{sec.emoji}</span> {sec.label}
                    <Badge variant="outline" className="ml-1 text-[10px]">
                      {list.reduce((a, l) => a + l.kcal, 0)} kcal
                    </Badge>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setAdding(sec.key)}>
                    <Plus className="h-4 w-4" /> Ajouter
                  </Button>
                </div>

                {list.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Rien saisi pour l'instant.</p>
                ) : (
                  <ul className="divide-y divide-border/50">
                    {list.map((l) => (
                      <li key={l.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {l.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={l.imageUrl} alt="" className="h-7 w-7 rounded-md object-cover" />
                            ) : (
                              <Utensils className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="truncate font-medium">
                              {l.title ?? labelFromSource(l.source)}
                            </span>
                            <Badge variant="outline" className="shrink-0 text-[10px]">
                              {new Date(l.consumedAt).toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </Badge>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {l.kcal} kcal · P{Math.round(l.protein)} G{Math.round(l.carbs)} L
                            {Math.round(l.fat)}
                          </div>
                        </div>
                        <button
                          onClick={() => remove(l.id)}
                          className="text-muted-foreground transition hover:text-destructive"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {adding === sec.key && (
                  <ManualMealForm
                    defaultMealType={sec.key === "_NONE" ? undefined : sec.key}
                    dayKey={dayKey}
                    onDone={() => {
                      setAdding(null);
                      router.refresh();
                    }}
                    onCancel={() => setAdding(null)}
                  />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ManualMealForm({
  defaultMealType,
  dayKey,
  onDone,
  onCancel,
}: {
  defaultMealType?: string;
  dayKey: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = React.useState("");
  const [kcal, setKcal] = React.useState(0);
  const [protein, setProtein] = React.useState(0);
  const [carbs, setCarbs] = React.useState(0);
  const [fat, setFat] = React.useState(0);
  const [saving, setSaving] = React.useState(false);

  async function save() {
    if (kcal <= 0) return;
    setSaving(true);
    try {
      const consumedAt = new Date(`${dayKey}T${new Date().toTimeString().slice(0, 8)}`);
      const res = await fetch("/api/nutrition/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || undefined,
          mealType: defaultMealType,
          kcal,
          protein,
          carbs,
          fat,
          consumedAt: consumedAt.toISOString(),
          source: "manual",
        }),
      });
      if (res.ok) onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-2 rounded-xl border border-primary/30 bg-primary/5 p-3">
      <div className="grid gap-2 md:grid-cols-5">
        <div className="md:col-span-2">
          <Label className="text-[11px]">Intitulé</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Poulet riz avocat" />
        </div>
        <MiniInput label="kcal" value={kcal} setValue={setKcal} />
        <MiniInput label="prot" value={protein} setValue={setProtein} />
        <MiniInput label="gluc" value={carbs} setValue={setCarbs} />
        <MiniInput label="lip" value={fat} setValue={setFat} />
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
        <Button size="sm" onClick={save} disabled={saving || kcal <= 0}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
          Enregistrer
        </Button>
      </div>
    </div>
  );
}

function MiniInput({
  label,
  value,
  setValue,
}: {
  label: string;
  value: number;
  setValue: (n: number) => void;
}) {
  return (
    <div>
      <Label className="text-[11px]">{label}</Label>
      <Input
        type="number"
        value={value}
        min={0}
        onChange={(e) => setValue(Number(e.target.value) || 0)}
      />
    </div>
  );
}

function KcalRing({ value, target }: { value: number; target: number }) {
  const pct = target === 0 ? 0 : Math.min(1, value / target);
  const c = 2 * Math.PI * 44;
  const color = pct > 1.05 ? "#EF4444" : pct > 0.9 ? "#14B8A6" : "#22D3EE";
  return (
    <div className="relative mx-auto flex h-40 w-40 items-center justify-center">
      <svg viewBox="-50 -50 100 100" width="160" height="160">
        <circle cx="0" cy="0" r="44" stroke="currentColor" strokeOpacity="0.12" strokeWidth="10" fill="none" />
        <circle
          cx="0"
          cy="0"
          r="44"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${c * pct} ${c}`}
          transform="rotate(-90)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="font-display text-3xl font-bold">{Math.round(value)}</div>
        <div className="text-[10px] uppercase text-muted-foreground">/ {target} kcal</div>
      </div>
    </div>
  );
}

function MacroBar({
  label,
  value,
  target,
  unit,
  color,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
}) {
  const pct = target === 0 ? 0 : Math.min(1.2, value / target);
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {Math.round(value)} {unit} / {target} {unit}
        </span>
      </div>
      <div className={cn("mt-1 h-2 overflow-hidden rounded-full bg-muted")}>
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(100, pct * 100)}%`, background: color }}
        />
      </div>
    </div>
  );
}

function isoOffset(dayKey: string, days: number) {
  const d = new Date(`${dayKey}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDayLabel(dayKey: string, isToday: boolean) {
  if (isToday) return "Aujourd'hui";
  return new Date(`${dayKey}T00:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

function labelFromSource(source: string) {
  if (source === "ai") return "Repas (analyse photo)";
  if (source === "barcode") return "Repas (code-barres)";
  if (source === "quick") return "Ajout rapide";
  return "Repas";
}
