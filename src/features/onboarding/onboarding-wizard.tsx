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

type State = {
  firstName: string;
  birthDate: string;
  sex: "MALE" | "FEMALE" | "OTHER" | "";
  heightCm: number;
  weightKg: number;
  fitnessLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ELITE";
  goal: "WEIGHT_LOSS" | "MUSCLE_GAIN" | "ENDURANCE" | "FITNESS" | "HEALTH" | "";
  environment: "HOME" | "GYM" | "OUTDOOR";
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

const EQUIPMENT_OPTIONS = [
  "barbell", "dumbbell", "bench", "rack", "pull-up bar", "kettlebell", "bands",
  "cable machine", "treadmill", "bike", "rower", "assault bike", "box", "jump rope",
  "medicine ball", "foam roller", "trap bar", "dip bars",
];

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
  const [state, setState] = React.useState<State>({
    firstName: firstName ?? "",
    birthDate: "",
    sex: "",
    heightCm: 175,
    weightKg: 72,
    fitnessLevel: "BEGINNER",
    goal: "",
    environment: "GYM",
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
        return !!state.goal;
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
                  <Label>Quel est votre objectif ?</Label>
                  <div className="mt-1 grid gap-2">
                    {GOALS.map((g) => (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => update("goal", g.value)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border p-3 text-left transition",
                          state.goal === g.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50",
                        )}
                      >
                        <span className="text-2xl">{g.emoji}</span>
                        <span className="font-medium">{g.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Où vous entraînez-vous ?</Label>
                  <div className="mt-1 grid grid-cols-3 gap-2">
                    {ENVIRONMENTS.map((e) => (
                      <button
                        key={e.value}
                        type="button"
                        onClick={() => update("environment", e.value)}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-xl border p-3 transition",
                          state.environment === e.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50",
                        )}
                      >
                        <span className="text-xl">{e.emoji}</span>
                        <span className="text-xs font-medium">{e.label}</span>
                      </button>
                    ))}
                  </div>
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
              <>
                <div className="flex items-center justify-between rounded-xl border border-border p-3">
                  <Label htmlFor="smokes" className="text-sm">Je fume</Label>
                  <Checkbox id="smokes" checked={state.smokes} onCheckedChange={(c) => update("smokes", c === true)} />
                </div>
                <div>
                  <Label>Alcool (unités / semaine)</Label>
                  <Input type="number" min={0} max={60} value={state.alcoholUnitsPerWeek} onChange={(e) => update("alcoholUnitsPerWeek", Number(e.target.value))} />
                </div>
                <div>
                  <Label>Sommeil moyen (heures / nuit) : {state.hoursOfSleep}h</Label>
                  <input type="range" min={3} max={12} value={state.hoursOfSleep} onChange={(e) => update("hoursOfSleep", Number(e.target.value))} className="w-full accent-primary" />
                </div>
                <div>
                  <Label>Niveau de stress (1 = très détendu, 10 = très stressé) : {state.stressLevel}</Label>
                  <input type="range" min={1} max={10} value={state.stressLevel} onChange={(e) => update("stressLevel", Number(e.target.value))} className="w-full accent-primary" />
                </div>
              </>
            )}

            {STEPS[step]?.key === "equipment" && (
              <>
                <div>
                  <Label>Matériel disponible</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {EQUIPMENT_OPTIONS.map((eq) => {
                      const selected = state.equipment.includes(eq);
                      return (
                        <button
                          key={eq}
                          type="button"
                          onClick={() =>
                            update(
                              "equipment",
                              selected
                                ? state.equipment.filter((e) => e !== eq)
                                : [...state.equipment, eq],
                            )
                          }
                          className={cn(
                            "rounded-xl border px-3 py-2 text-sm capitalize transition",
                            selected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/50",
                          )}
                        >
                          {eq}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox id="outdoor" checked={state.outdoorAllowed} onCheckedChange={(c) => update("outdoorAllowed", c === true)} />
                  <Label htmlFor="outdoor">Entraînement extérieur autorisé (course, vélo, marche)</Label>
                </div>
              </>
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
