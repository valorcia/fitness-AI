"use client";

import * as React from "react";
import { Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Frequency = "never" | "sometimes" | "often";
type WorkActivity = "sedentary" | "moderate" | "active" | "very_active";
type DietType =
  | "omnivore"
  | "vegetarian"
  | "vegan"
  | "pescatarian"
  | "gluten_free"
  | "halal"
  | "kosher"
  | "other";
type SportLevel = "recreational" | "club" | "competitive" | "elite";
type Satisfaction = "yes" | "partial" | "no";

export type LifestyleState = {
  smokes: boolean;
  alcoholUnitsPerWeek: number;
  hoursOfSleep: number;
  stressLevel: number;
  nightShiftWork: boolean;
  wakesUpOften: boolean;
  insomnia: boolean;
  sleepAids: boolean;
  workActivity: WorkActivity;
  canMoveAtWork: boolean;
  waterLitersPerDay: number;
  otherDrinks: string[];
  mealsPerDay: number;
  mealTypes: Array<"BREAKFAST" | "LUNCH" | "DINNER" | "SNACK">;
  skipMealsFrequency: Frequency;
  eatingOutPerWeek: number;
  mealQuality: number;
  snackingFrequency: Frequency;
  dietType: DietType;
  pastDiets: string[];
  pastDietsSatisfied?: Satisfaction;
  currentDiet: string;
  sportsHistory: string[];
  sportLevel: SportLevel;
  sportYears: number;
};

type Props = {
  state: LifestyleState;
  update: <K extends keyof LifestyleState>(k: K, v: LifestyleState[K]) => void;
};

const FREQ_OPTIONS: Array<{ value: Frequency; label: string }> = [
  { value: "never", label: "Jamais" },
  { value: "sometimes", label: "Parfois" },
  { value: "often", label: "Souvent" },
];

const WORK_OPTIONS: Array<{ value: WorkActivity; label: string; emoji: string }> = [
  { value: "sedentary", label: "Sédentaire", emoji: "💺" },
  { value: "moderate", label: "Modéré", emoji: "🚶" },
  { value: "active", label: "Actif", emoji: "🏃" },
  { value: "very_active", label: "Très actif", emoji: "🏋️" },
];

const MEAL_TYPE_OPTIONS = [
  { value: "BREAKFAST", label: "Petit-déjeuner", emoji: "🥐" },
  { value: "LUNCH", label: "Déjeuner", emoji: "🥗" },
  { value: "DINNER", label: "Dîner", emoji: "🍽️" },
  { value: "SNACK", label: "Collation", emoji: "🍎" },
] as const;

const DIET_OPTIONS: Array<{ value: DietType; label: string }> = [
  { value: "omnivore", label: "Omnivore" },
  { value: "vegetarian", label: "Végétarien" },
  { value: "vegan", label: "Vegan" },
  { value: "pescatarian", label: "Pescetarien" },
  { value: "gluten_free", label: "Sans gluten" },
  { value: "halal", label: "Halal" },
  { value: "kosher", label: "Kasher" },
  { value: "other", label: "Autre" },
];

const SATISFACTION_OPTIONS: Array<{ value: Satisfaction; label: string }> = [
  { value: "yes", label: "Oui" },
  { value: "partial", label: "Partiellement" },
  { value: "no", label: "Non" },
];

const SPORT_LEVEL_OPTIONS: Array<{ value: SportLevel; label: string }> = [
  { value: "recreational", label: "Loisir" },
  { value: "club", label: "Club / amateur" },
  { value: "competitive", label: "Compétition" },
  { value: "elite", label: "Élite / pro" },
];

export function LifestyleStep({ state, update }: Props) {
  const [drinkDraft, setDrinkDraft] = React.useState("");
  const [pastDietDraft, setPastDietDraft] = React.useState("");
  const [sportDraft, setSportDraft] = React.useState("");

  const addToList = (key: keyof LifestyleState, raw: string, max: number) => {
    const v = raw.trim();
    if (!v) return false;
    const list = (state[key] as string[]) ?? [];
    if (list.includes(v) || list.length >= max) return false;
    update(key, [...list, v] as never);
    return true;
  };

  return (
    <div className="grid gap-5">
      <div className="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs text-primary">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <div>
          <p className="font-semibold">
            Chaque réponse est importante, confidentielle et utilisée uniquement par Coachmii-fit pour
            adapter votre coaching.
          </p>
          <p className="mt-1 opacity-80">
            Vous pouvez sauter les questions qui ne s'appliquent pas — mais plus le coach en sait,
            plus son accompagnement est précis.
          </p>
        </div>
      </div>

      {/* ─── Sommeil ─────────────────────────────────────────── */}
      <Section title="Sommeil" emoji="😴">
        <div>
          <Label>Heures de sommeil par nuit : {state.hoursOfSleep} h</Label>
          <input
            type="range"
            min={3}
            max={12}
            value={state.hoursOfSleep}
            onChange={(e) => update("hoursOfSleep", Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          <Toggle
            label="Travail de nuit / horaires décalés"
            checked={state.nightShiftWork}
            onChange={(v) => update("nightShiftWork", v)}
          />
          <Toggle
            label="Réveils nocturnes fréquents"
            checked={state.wakesUpOften}
            onChange={(v) => update("wakesUpOften", v)}
          />
          <Toggle
            label="Insomnie"
            checked={state.insomnia}
            onChange={(v) => update("insomnia", v)}
          />
          <Toggle
            label="Aide pour dormir / traitement"
            checked={state.sleepAids}
            onChange={(v) => update("sleepAids", v)}
          />
        </div>
      </Section>

      {/* ─── Activité quotidienne ────────────────────────────── */}
      <Section title="Activité quotidienne" emoji="🏃">
        <div>
          <Label>Type d'activité au travail</Label>
          <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
            {WORK_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => update("workActivity", o.value)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-medium transition",
                  state.workActivity === o.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50",
                )}
              >
                <span className="text-lg">{o.emoji}</span>
                {o.label}
              </button>
            ))}
          </div>
        </div>
        {state.workActivity === "sedentary" && (
          <Toggle
            label="Je peux me lever et marcher plusieurs fois par jour"
            checked={state.canMoveAtWork}
            onChange={(v) => update("canMoveAtWork", v)}
          />
        )}
        <div>
          <Label>Niveau de stress (1 = très détendu, 10 = très stressé) : {state.stressLevel}</Label>
          <input
            type="range"
            min={1}
            max={10}
            value={state.stressLevel}
            onChange={(e) => update("stressLevel", Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
      </Section>

      {/* ─── Hydratation ─────────────────────────────────────── */}
      <Section title="Hydratation" emoji="💧">
        <div>
          <Label>Eau / jour : {state.waterLitersPerDay.toFixed(1)} L</Label>
          <input
            type="range"
            min={0}
            max={6}
            step={0.25}
            value={state.waterLitersPerDay}
            onChange={(e) => update("waterLitersPerDay", Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
        <ChipsInput
          label="Autres boissons régulières (café, thé, soda, jus, lait…)"
          placeholder="ex : café, soda, jus d'orange"
          draft={drinkDraft}
          setDraft={setDrinkDraft}
          values={state.otherDrinks}
          add={() => {
            if (addToList("otherDrinks", drinkDraft, 8)) setDrinkDraft("");
          }}
          remove={(v) =>
            update(
              "otherDrinks",
              state.otherDrinks.filter((x) => x !== v),
            )
          }
        />
        <div>
          <Label>Verres d'alcool moyens / semaine : {state.alcoholUnitsPerWeek}</Label>
          <input
            type="range"
            min={0}
            max={30}
            value={state.alcoholUnitsPerWeek}
            onChange={(e) => update("alcoholUnitsPerWeek", Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
        <Toggle
          label="Je fume"
          checked={state.smokes}
          onChange={(v) => update("smokes", v)}
        />
      </Section>

      {/* ─── Repas & alimentation ────────────────────────────── */}
      <Section title="Repas & alimentation" emoji="🍽️">
        <div>
          <Label>Nombre de repas / jour</Label>
          <div className="mt-2 grid grid-cols-3 gap-2 md:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => update("mealsPerDay", n)}
                className={cn(
                  "rounded-xl border p-2 text-sm font-medium transition",
                  state.mealsPerDay === n
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50",
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>Quels repas prenez-vous habituellement ?</Label>
          <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
            {MEAL_TYPE_OPTIONS.map((m) => {
              const selected = state.mealTypes.includes(m.value);
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => {
                    update(
                      "mealTypes",
                      selected
                        ? state.mealTypes.filter((x) => x !== m.value)
                        : [...state.mealTypes, m.value],
                    );
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-medium transition",
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  <span className="text-lg">{m.emoji}</span>
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>
        <FrequencySelect
          label="Sauter des repas"
          value={state.skipMealsFrequency}
          onChange={(v) => update("skipMealsFrequency", v)}
        />
        <FrequencySelect
          label="Grignotage entre les repas"
          value={state.snackingFrequency}
          onChange={(v) => update("snackingFrequency", v)}
        />
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label>Repas extérieurs / restaurant par semaine</Label>
            <Input
              type="number"
              min={0}
              max={21}
              value={state.eatingOutPerWeek}
              onChange={(e) => update("eatingOutPerWeek", Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label>
              Qualité ressentie de vos repas (1 = transformé, 10 = équilibré) : {state.mealQuality}
            </Label>
            <input
              type="range"
              min={1}
              max={10}
              value={state.mealQuality}
              onChange={(e) => update("mealQuality", Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>
      </Section>

      {/* ─── Régime ──────────────────────────────────────────── */}
      <Section title="Régime alimentaire" emoji="🥗">
        <div>
          <Label>Régime actuel</Label>
          <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
            {DIET_OPTIONS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => update("dietType", d.value)}
                className={cn(
                  "rounded-xl border p-2 text-xs font-medium transition",
                  state.dietType === d.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50",
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>Régime / cure spécifique en cours (optionnel)</Label>
          <Input
            value={state.currentDiet}
            onChange={(e) => update("currentDiet", e.target.value)}
            placeholder="ex : jeûne intermittent 16/8, low-carb, cure detox"
            maxLength={120}
          />
        </div>
        <ChipsInput
          label="Régimes déjà essayés"
          placeholder="ex : Dukan, cétogène, paléo"
          draft={pastDietDraft}
          setDraft={setPastDietDraft}
          values={state.pastDiets}
          add={() => {
            if (addToList("pastDiets", pastDietDraft, 10)) setPastDietDraft("");
          }}
          remove={(v) =>
            update(
              "pastDiets",
              state.pastDiets.filter((x) => x !== v),
            )
          }
        />
        {state.pastDiets.length > 0 && (
          <div>
            <Label>Satisfait des résultats obtenus ?</Label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {SATISFACTION_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => update("pastDietsSatisfied", o.value)}
                  className={cn(
                    "rounded-xl border p-2.5 text-sm font-medium transition",
                    state.pastDietsSatisfied === o.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* ─── Historique sportif ──────────────────────────────── */}
      <Section title="Historique sportif" emoji="🏅">
        <ChipsInput
          label="Sports / activités déjà pratiqués"
          placeholder="ex : course, judo, natation, foot"
          draft={sportDraft}
          setDraft={setSportDraft}
          values={state.sportsHistory}
          add={() => {
            if (addToList("sportsHistory", sportDraft, 15)) setSportDraft("");
          }}
          remove={(v) =>
            update(
              "sportsHistory",
              state.sportsHistory.filter((x) => x !== v),
            )
          }
        />
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label>Niveau atteint</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {SPORT_LEVEL_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => update("sportLevel", o.value)}
                  className={cn(
                    "rounded-xl border p-2 text-xs font-medium transition",
                    state.sportLevel === o.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Années d'expérience cumulées : {state.sportYears} an{state.sportYears > 1 ? "s" : ""}</Label>
            <input
              type="range"
              min={0}
              max={40}
              value={state.sportYears}
              onChange={(e) => update("sportYears", Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  emoji,
  children,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-foreground">
        <span className="text-base">{emoji}</span>
        {title}
      </h3>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const id = React.useId();
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 text-sm transition",
        checked ? "border-primary/60 bg-primary/5" : "border-border",
      )}
    >
      <span>{label}</span>
      <Checkbox id={id} checked={checked} onCheckedChange={(c) => onChange(c === true)} />
    </label>
  );
}

function FrequencySelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Frequency;
  onChange: (v: Frequency) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {FREQ_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-xl border p-2.5 text-sm font-medium transition",
              value === o.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-primary/50",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChipsInput({
  label,
  placeholder,
  draft,
  setDraft,
  values,
  add,
  remove,
}: {
  label: string;
  placeholder: string;
  draft: string;
  setDraft: (v: string) => void;
  values: string[];
  add: () => void;
  remove: (v: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          maxLength={40}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" size="sm" onClick={add} disabled={!draft.trim()}>
          Ajouter
        </Button>
      </div>
      {values.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
            >
              {v}
              <button
                type="button"
                aria-label={`Retirer ${v}`}
                onClick={() => remove(v)}
                className="text-primary/70 hover:text-primary"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
