"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AVATAR_CATALOG } from "@/features/coach/coach-avatar";
import { LifestyleStep } from "./lifestyle-step";
import { EquipmentStep } from "./equipment-step";

type Goal = "WEIGHT_LOSS" | "MUSCLE_GAIN" | "ENDURANCE" | "FITNESS" | "HEALTH";
type State = {
  firstName: string;
  birthDate: string;
  sex: "MALE" | "FEMALE" | "OTHER" | "";
  heightCm: number;
  weightKg: number;
  fitnessLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ELITE";
  goals: Goal[];
  environment: "HOME" | "GYM" | "OUTDOOR";
  environments: Array<"HOME" | "GYM" | "OUTDOOR">;
  customLocations: string[];
  sessionsPerWeek: number;
  sessionDurationMin: number;
  injuries: string[];
  conditions: string[];
  medications: string[];
  cardiacIssues: boolean;
  hypertension: boolean;
  diabetes: boolean;
  asthma: boolean;
  jointPain: boolean;
  backPain: boolean;
  pregnancy: boolean;
  surgeryRecent: boolean;
  smokes: boolean;
  alcoholUnitsPerWeek: number;
  hoursOfSleep: number;
  stressLevel: number;
  // Sleep details
  nightShiftWork: boolean;
  wakesUpOften: boolean;
  insomnia: boolean;
  sleepAids: boolean;
  // Work / daily activity
  workActivity: "sedentary" | "moderate" | "active" | "very_active";
  canMoveAtWork: boolean;
  // Hydration
  waterLitersPerDay: number;
  otherDrinks: string[];
  // Meals
  mealsPerDay: number;
  mealTypes: Array<"BREAKFAST" | "LUNCH" | "DINNER" | "SNACK">;
  skipMealsFrequency: "never" | "sometimes" | "often";
  eatingOutPerWeek: number;
  mealQuality: number;
  snackingFrequency: "never" | "sometimes" | "often";
  // Diet
  dietType:
    | "omnivore"
    | "vegetarian"
    | "vegan"
    | "pescatarian"
    | "gluten_free"
    | "halal"
    | "kosher"
    | "other";
  pastDiets: string[];
  pastDietsSatisfied?: "yes" | "partial" | "no";
  currentDiet: string;
  // Sport history
  sportsHistory: string[];
  sportLevel: "recreational" | "club" | "competitive" | "elite";
  sportYears: number;
  sportsInterests: string[];
  equipment: string[];
  outdoorAllowed: boolean;
  coachPersona: "STRICT" | "FUN" | "ZEN" | "MILITARY" | "ELITE";
  coachName: string;
  coachAvatar: string;
  consentHealthData: boolean;
  consentMedicalDisclaimer: boolean;
  consentDoctorCleared: boolean;
};

const STEPS = [
  { key: "identity", label: "Identité" },
  { key: "body", label: "Corps" },
  { key: "goal", label: "Objectif" },
  { key: "medical", label: "Santé" },
  { key: "lifestyle", label: "Hygiène de vie" },
  { key: "equipment", label: "Matériel" },
  { key: "coach", label: "Mon coach" },
  { key: "consent", label: "Consentement" },
];

const GOALS = [
  { value: "WEIGHT_LOSS", label: "Perte de poids", emoji: "🔥" },
  { value: "MUSCLE_GAIN", label: "Prise de masse", emoji: "💪" },
  { value: "ENDURANCE", label: "Endurance", emoji: "🏃" },
  { value: "FITNESS", label: "Remise en forme", emoji: "⚡" },
  { value: "HEALTH", label: "Santé / bien-être", emoji: "❤️" },
] as const;

const ENVIRONMENTS = [
  { value: "GYM", label: "Salle de sport", emoji: "🏋️" },
  { value: "HOME", label: "Maison", emoji: "🏠" },
  { value: "OUTDOOR", label: "Extérieur", emoji: "🌳" },
] as const;

const LEVELS = [
  { value: "BEGINNER", label: "Débutant" },
  { value: "INTERMEDIATE", label: "Intermédiaire" },
  { value: "ADVANCED", label: "Avancé" },
  { value: "ELITE", label: "Elite" },
] as const;

const PERSONAS = [
  { value: "FUN", label: "Fun", emoji: "😄" },
  { value: "STRICT", label: "Strict", emoji: "🎯" },
  { value: "ZEN", label: "Zen", emoji: "🧘" },
  { value: "MILITARY", label: "Militaire", emoji: "🎖️" },
  { value: "ELITE", label: "Elite", emoji: "🏆" },
] as const;

const MEDICAL_FLAGS: Array<{ key: keyof State; label: string; warn?: boolean }> = [
  { key: "cardiacIssues", label: "Problèmes cardiaques connus", warn: true },
  { key: "hypertension", label: "Hypertension artérielle", warn: true },
  { key: "diabetes", label: "Diabète" },
  { key: "asthma", label: "Asthme" },
  { key: "jointPain", label: "Douleurs articulaires" },
  { key: "backPain", label: "Problèmes de dos" },
  { key: "pregnancy", label: "Grossesse en cours", warn: true },
  { key: "surgeryRecent", label: "Chirurgie récente (< 6 mois)", warn: true },
];

export function OnboardingWizard({ firstName }: { firstName: string }) {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [customOpen, setCustomOpen] = React.useState(false);
  const [customDraft, setCustomDraft] = React.useState("");
  const [state, setState] = React.useState<State>({
    firstName: firstName ?? "",
    birthDate: "",
    sex: "",
    heightCm: 175,
    weightKg: 72,
    fitnessLevel: "BEGINNER",
    goals: [],
    environment: "GYM",
    environments: [],
    customLocations: [],
    sessionsPerWeek: 3,
    sessionDurationMin: 45,
    injuries: [],
    conditions: [],
    medications: [],
    cardiacIssues: false,
    hypertension: false,
    diabetes: false,
    asthma: false,
    jointPain: false,
    backPain: false,
    pregnancy: false,
    surgeryRecent: false,
    smokes: false,
    alcoholUnitsPerWeek: 0,
    hoursOfSleep: 7,
    stressLevel: 5,
    nightShiftWork: false,
    wakesUpOften: false,
    insomnia: false,
    sleepAids: false,
    workActivity: "moderate",
    canMoveAtWork: true,
    waterLitersPerDay: 2,
    otherDrinks: [],
    mealsPerDay: 3,
    mealTypes: [],
    skipMealsFrequency: "never",
    eatingOutPerWeek: 0,
    mealQuality: 6,
    snackingFrequency: "sometimes",
    dietType: "omnivore",
    pastDiets: [],
    pastDietsSatisfied: undefined,
    currentDiet: "",
    sportsHistory: [],
    sportLevel: "recreational",
    sportYears: 0,
    sportsInterests: [],
    equipment: [],
    outdoorAllowed: true,
    coachPersona: "FUN",
    coachName: "Pulse",
    coachAvatar: "default",
    consentHealthData: false,
    consentMedicalDisclaimer: false,
    consentDoctorCleared: false,
  });

  const update = <K extends keyof State>(k: K, v: State[K]) => setState((s) => ({ ...s, [k]: v }));
  const addCustom = () => {
    const v = customDraft.trim();
    if (!v) return;
    if (state.customLocations.includes(v)) {
      setCustomDraft("");
      return;
    }
    if (state.customLocations.length >= 5) return;
    update("customLocations", [...state.customLocations, v]);
    setCustomDraft("");
  };
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const hasHighRiskMedical =
    state.cardiacIssues ||
    state.hypertension ||
    state.pregnancy ||
    state.surgeryRecent;

  const canProceed = () => {
    switch (STEPS[step]?.key) {
      case "identity":
        return state.firstName.trim().length > 0 && state.birthDate && state.sex;
      case "body":
        return state.heightCm > 0 && state.weightKg > 0;
      case "goal":
        return (
          state.goals.length > 0 &&
          (state.environments.length > 0 || state.customLocations.length > 0)
        );
      case "medical":
      case "lifestyle":
      case "equipment":
        return true;
      case "coach":
        return state.coachName.trim().length > 0;
      case "consent":
        return (
          state.consentHealthData &&
          state.consentMedicalDisclaimer &&
          (!hasHighRiskMedical || state.consentDoctorCleared)
        );
    }
    return true;
  };

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Erreur lors de l'enregistrement.");
      }
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue.");
    } finally {
      setSubmitting(false);
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">{STEPS[step]?.label}</CardTitle>
          <span className="text-xs text-muted-foreground">
            Étape {step + 1} / {STEPS.length}
          </span>
        </div>
        <Progress value={progress} className="mt-3" />
        <CardDescription className="mt-2">
          Chaque réponse aide votre coach à concevoir un programme sûr et efficace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid gap-4"
          >
            {STEPS[step]?.key === "identity" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input id="firstName" value={state.firstName} onChange={(e) => update("firstName", e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="birthDate">Date de naissance</Label>
                  <Input id="birthDate" type="date" value={state.birthDate} onChange={(e) => update("birthDate", e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Sexe</Label>
                  <Select value={state.sex} onValueChange={(v) => update("sex", v as State["sex"])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Homme</SelectItem>
                      <SelectItem value="FEMALE">Femme</SelectItem>
                      <SelectItem value="OTHER">Autre / préfère ne pas préciser</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {STEPS[step]?.key === "body" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Taille (cm)</Label>
                    <Input type="number" value={state.heightCm} onChange={(e) => update("heightCm", Number(e.target.value))} />
                  </div>
                  <div>
                    <Label>Poids (kg)</Label>
                    <Input type="number" step="0.1" value={state.weightKg} onChange={(e) => update("weightKg", Number(e.target.value))} />
                  </div>
                </div>
                <div>
                  <Label>Niveau sportif</Label>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    {LEVELS.map((l) => (
                      <button
                        key={l.value}
                        type="button"
                        onClick={() => update("fitnessLevel", l.value)}
                        className={cn(
                          "rounded-xl border p-3 text-sm font-medium transition",
                          state.fitnessLevel === l.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50",
                        )}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {STEPS[step]?.key === "goal" && (
              <>
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Label>Quels sont vos objectifs ?</Label>
                      <p className="mt-1 text-xs text-muted-foreground">
                        3 objectifs recommandés (jusqu'à 5). Le premier sélectionné devient
                        l'objectif principal — il guide la priorité du plan.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const allSelected = state.goals.length === GOALS.length;
                        update(
                          "goals",
                          allSelected ? [] : (GOALS.map((g) => g.value) as Goal[]),
                        );
                      }}
                      className="shrink-0 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/15"
                    >
                      {state.goals.length === GOALS.length
                        ? "Tout désélectionner"
                        : "Tout sélectionner"}
                    </button>
                  </div>
                  <div className="mt-3 grid gap-2">
                    {GOALS.map((g) => {
                      const idx = state.goals.indexOf(g.value as Goal);
                      const selected = idx >= 0;
                      const isPrimary = idx === 0;
                      const atMax = state.goals.length >= 5 && !selected;
                      return (
                        <button
                          key={g.value}
                          type="button"
                          disabled={atMax}
                          onClick={() => {
                            if (selected) {
                              update(
                                "goals",
                                state.goals.filter((x) => x !== g.value),
                              );
                            } else {
                              update("goals", [...state.goals, g.value as Goal]);
                            }
                          }}
                          className={cn(
                            "flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50",
                            selected
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50",
                          )}
                        >
                          <span className="flex items-center gap-3">
                            <span className="text-2xl">{g.emoji}</span>
                            <span className="font-medium">{g.label}</span>
                          </span>
                          {selected && (
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                                isPrimary
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              {isPrimary ? "Principal" : `#${idx + 1}`}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Label>Où vous entraînez-vous ?</Label>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Vous pouvez en cocher plusieurs (ex : salle + outdoor + maison).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const allSelected = state.environments.length === ENVIRONMENTS.length;
                        update(
                          "environments",
                          allSelected
                            ? []
                            : (ENVIRONMENTS.map((e) => e.value) as State["environments"]),
                        );
                      }}
                      className="shrink-0 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/15"
                    >
                      {state.environments.length === ENVIRONMENTS.length
                        ? "Tout désélectionner"
                        : "Tout sélectionner"}
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                    {ENVIRONMENTS.map((e) => {
                      const idx = state.environments.indexOf(e.value);
                      const selected = idx >= 0;
                      const isPrimary = idx === 0 && state.environments.length > 0;
                      return (
                        <button
                          key={e.value}
                          type="button"
                          onClick={() => {
                            const next = selected
                              ? state.environments.filter((x) => x !== e.value)
                              : [...state.environments, e.value as State["environments"][number]];
                            update("environments", next);
                            // primary stays the first selected
                            if (next.length > 0) update("environment", next[0]!);
                          }}
                          className={cn(
                            "relative flex flex-col items-center gap-1 rounded-xl border p-3 transition",
                            selected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/50",
                          )}
                        >
                          <span className="text-xl">{e.emoji}</span>
                          <span className="text-xs font-medium">{e.label}</span>
                          {selected && (
                            <span
                              className={cn(
                                "absolute right-1.5 top-1.5 rounded-full px-1.5 text-[9px] font-semibold uppercase",
                                isPrimary
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              {isPrimary ? "Principal" : `#${idx + 1}`}
                            </span>
                          )}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setCustomOpen((v) => !v)}
                      className={cn(
                        "relative flex flex-col items-center gap-1 rounded-xl border p-3 transition",
                        state.customLocations.length > 0 || customOpen
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      <span className="text-xl">📍</span>
                      <span className="text-xs font-medium">Autre…</span>
                      {state.customLocations.length > 0 && (
                        <span className="absolute right-1.5 top-1.5 rounded-full bg-primary px-1.5 text-[9px] font-semibold uppercase text-primary-foreground">
                          {state.customLocations.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {(customOpen || state.customLocations.length > 0) && (
                    <div className="mt-3 rounded-xl border border-border/60 bg-muted/40 p-3">
                      <Label htmlFor="custom-loc" className="text-xs">
                        Ajouter un autre lieu (ex : piscine, studio yoga, parc d'escalade…)
                      </Label>
                      <div className="mt-2 flex gap-2">
                        <Input
                          id="custom-loc"
                          value={customDraft}
                          maxLength={60}
                          placeholder="piscine, dojo, studio pilates…"
                          onChange={(e) => setCustomDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addCustom();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={addCustom}
                          disabled={
                            !customDraft.trim() || state.customLocations.length >= 5
                          }
                        >
                          Ajouter
                        </Button>
                      </div>
                      {state.customLocations.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {state.customLocations.map((loc) => (
                            <span
                              key={loc}
                              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                            >
                              {loc}
                              <button
                                type="button"
                                aria-label={`Retirer ${loc}`}
                                onClick={() =>
                                  update(
                                    "customLocations",
                                    state.customLocations.filter((x) => x !== loc),
                                  )
                                }
                                className="text-primary/70 hover:text-primary"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        Jusqu'à 5 lieux personnalisés. Le coach les prend en compte pour
                        composer vos séances.
                      </p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Séances / semaine</Label>
                    <Input type="number" min={1} max={7} value={state.sessionsPerWeek} onChange={(e) => update("sessionsPerWeek", Number(e.target.value))} />
                  </div>
                  <div>
                    <Label>Durée cible (min)</Label>
                    <Input type="number" min={15} max={180} step={5} value={state.sessionDurationMin} onChange={(e) => update("sessionDurationMin", Number(e.target.value))} />
                  </div>
                </div>
              </>
            )}

            {STEPS[step]?.key === "medical" && (
              <>
                <div className="rounded-xl border border-amber-400/40 bg-amber-50 p-3 text-xs text-amber-900">
                  Ces informations restent confidentielles et servent exclusivement à adapter vos séances
                  en respectant vos contre-indications.
                </div>
                <div className="grid gap-2">
                  {MEDICAL_FLAGS.map((f) => (
                    <label
                      key={f.key as string}
                      className={cn(
                        "flex items-center justify-between rounded-xl border p-3 text-sm transition",
                        state[f.key as keyof State]
                          ? "border-primary bg-primary/5"
                          : "border-border",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {f.warn && state[f.key as keyof State] && (
                          <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                        )}
                        {f.label}
                      </span>
                      <Checkbox
                        checked={Boolean(state[f.key as keyof State])}
                        onCheckedChange={(c) => update(f.key, (c === true) as never)}
                      />
                    </label>
                  ))}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="injuries">Blessures connues (séparées par virgule)</Label>
                  <Input
                    id="injuries"
                    placeholder="ex: genou droit, épaule gauche"
                    onBlur={(e) =>
                      update(
                        "injuries",
                        e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      )
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="conditions">Pathologies (séparées par virgule)</Label>
                  <Input
                    id="conditions"
                    placeholder="ex: arthrose, tendinite chronique"
                    onBlur={(e) =>
                      update(
                        "conditions",
                        e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      )
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="medications">Traitements en cours (séparés par virgule)</Label>
                  <Input
                    id="medications"
                    placeholder="ex: bêtabloquants, antihistaminiques"
                    onBlur={(e) =>
                      update(
                        "medications",
                        e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      )
                    }
                  />
                </div>
              </>
            )}

            {STEPS[step]?.key === "lifestyle" && (
              <LifestyleStep
                state={state}
                update={
                  update as <K extends keyof import("./lifestyle-step").LifestyleState>(
                    k: K,
                    v: import("./lifestyle-step").LifestyleState[K],
                  ) => void
                }
              />
            )}

            {STEPS[step]?.key === "equipment" && (
              <EquipmentStep
                sportsInterests={state.sportsInterests}
                equipment={state.equipment}
                outdoorAllowed={state.outdoorAllowed}
                onChange={(patch) => {
                  if (patch.sportsInterests !== undefined)
                    update("sportsInterests", patch.sportsInterests);
                  if (patch.equipment !== undefined) update("equipment", patch.equipment);
                  if (patch.outdoorAllowed !== undefined)
                    update("outdoorAllowed", patch.outdoorAllowed);
                }}
              />
            )}

            {STEPS[step]?.key === "coach" && (
              <>
                <div>
                  <Label>Nom de votre coach</Label>
                  <Input value={state.coachName} onChange={(e) => update("coachName", e.target.value)} maxLength={30} />
                </div>
                <div>
                  <Label>Choisissez un avatar</Label>
                  <div className="mt-2 grid grid-cols-5 gap-2">
                    {AVATAR_CATALOG.map((a) => (
                      <button
                        key={a.key}
                        type="button"
                        onClick={() => update("coachAvatar", a.key)}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-xl border p-2 transition",
                          state.coachAvatar === a.key
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50",
                        )}
                      >
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                          style={{ background: `linear-gradient(135deg, ${a.from}, ${a.to})` }}
                        >
                          {a.emoji}
                        </div>
                        <span className="text-[10px]">{a.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Personnalité du coach</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-5">
                    {PERSONAS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => update("coachPersona", p.value)}
                        className={cn(
                          "rounded-xl border p-3 text-sm font-medium transition",
                          state.coachPersona === p.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50",
                        )}
                      >
                        <div className="text-lg">{p.emoji}</div>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {STEPS[step]?.key === "consent" && (
              <>
                <div className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
                  <p className="mb-2 font-semibold text-foreground">Avertissement médical important</p>
                  <p>
                    CoachMe ne remplace ni un avis, ni un suivi médical. Les recommandations fournies
                    s'appuient sur vos déclarations et ne constituent pas un diagnostic. En cas de
                    douleur aiguë, d'étourdissements ou de symptômes inhabituels : arrêtez l'activité
                    et consultez un professionnel de santé. Les numéros d'urgence sont le 15 (SAMU) ou
                    le 112 en Europe.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox id="c-med" checked={state.consentMedicalDisclaimer} onCheckedChange={(c) => update("consentMedicalDisclaimer", c === true)} />
                  <Label htmlFor="c-med">
                    J'ai lu et je comprends l'avertissement médical ci-dessus.
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox id="c-data" checked={state.consentHealthData} onCheckedChange={(c) => update("consentHealthData", c === true)} />
                  <Label htmlFor="c-data">
                    J'autorise CoachMe à traiter mes données santé pour personnaliser mon coaching.
                  </Label>
                </div>
                {hasHighRiskMedical && (
                  <div className="flex items-center gap-3 rounded-xl border border-amber-400/60 bg-amber-50 p-3 text-sm">
                    <Checkbox id="c-doc" checked={state.consentDoctorCleared} onCheckedChange={(c) => update("consentDoctorCleared", c === true)} />
                    <Label htmlFor="c-doc">
                      Je certifie avoir obtenu l'accord de mon médecin pour pratiquer une activité
                      physique compte tenu de mes antécédents.
                    </Label>
                  </div>
                )}
              </>
            )}

            {error && (
              <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-between">
          <Button variant="ghost" onClick={prev} disabled={step === 0}>
            Précédent
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next} disabled={!canProceed()}>
              Continuer
            </Button>
          ) : (
            <Button onClick={submit} disabled={!canProceed() || submitting}>
              {submitting ? "Génération…" : "Générer mon plan"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
