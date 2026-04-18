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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  injuries: string[];
  cardiacIssues: boolean;
  jointPain: boolean;
  equipment: string[];
  outdoorAllowed: boolean;
  consentHealthData: boolean;
};

const STEPS = ["Identité", "Corps", "Objectif", "Santé", "Matériel", "Consentement"];

const EQUIPMENT_OPTIONS = [
  "barbell",
  "dumbbell",
  "bench",
  "rack",
  "pull-up bar",
  "kettlebell",
  "bands",
  "treadmill",
  "bike",
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
    injuries: [],
    cardiacIssues: false,
    jointPain: false,
    equipment: [],
    outdoorAllowed: true,
    consentHealthData: false,
  });

  const update = <K extends keyof State>(k: K, v: State[K]) => setState((s) => ({ ...s, [k]: v }));

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const canProceed = () => {
    switch (step) {
      case 0:
        return state.firstName.trim().length > 0 && state.birthDate && state.sex;
      case 1:
        return state.heightCm > 0 && state.weightKg > 0;
      case 2:
        return !!state.goal;
      case 3:
      case 4:
        return true;
      case 5:
        return state.consentHealthData;
    }
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
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">{STEPS[step]}</CardTitle>
          <span className="text-xs text-muted-foreground">
            Étape {step + 1} / {STEPS.length}
          </span>
        </div>
        <Progress value={progress} className="mt-3" />
        <CardDescription className="mt-2">
          Quelques minutes pour personnaliser votre coach IA.
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
            {step === 0 && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={state.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="birthDate">Date de naissance</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={state.birthDate}
                    onChange={(e) => update("birthDate", e.target.value)}
                  />
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
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="height">Taille (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={state.heightCm}
                      onChange={(e) => update("heightCm", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Poids (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={state.weightKg}
                      onChange={(e) => update("weightKg", Number(e.target.value))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Niveau sportif</Label>
                  <Select
                    value={state.fitnessLevel}
                    onValueChange={(v) => update("fitnessLevel", v as State["fitnessLevel"])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEGINNER">Débutant</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermédiaire</SelectItem>
                      <SelectItem value="ADVANCED">Avancé</SelectItem>
                      <SelectItem value="ELITE">Elite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <div>
                  <Label>Objectif principal</Label>
                  <Select value={state.goal} onValueChange={(v) => update("goal", v as State["goal"])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un objectif" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WEIGHT_LOSS">Perte de poids</SelectItem>
                      <SelectItem value="MUSCLE_GAIN">Prise de masse</SelectItem>
                      <SelectItem value="ENDURANCE">Endurance</SelectItem>
                      <SelectItem value="FITNESS">Remise en forme</SelectItem>
                      <SelectItem value="HEALTH">Santé / bien-être</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Environnement préféré</Label>
                  <Select
                    value={state.environment}
                    onValueChange={(v) => update("environment", v as State["environment"])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GYM">Salle de sport</SelectItem>
                      <SelectItem value="HOME">Maison</SelectItem>
                      <SelectItem value="OUTDOOR">Extérieur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Séances par semaine</Label>
                  <Input
                    type="number"
                    min={1}
                    max={7}
                    value={state.sessionsPerWeek}
                    onChange={(e) => update("sessionsPerWeek", Number(e.target.value))}
                  />
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="cardiac"
                    checked={state.cardiacIssues}
                    onCheckedChange={(c) => update("cardiacIssues", c === true)}
                  />
                  <Label htmlFor="cardiac">Problèmes cardiaques connus</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="joint"
                    checked={state.jointPain}
                    onCheckedChange={(c) => update("jointPain", c === true)}
                  />
                  <Label htmlFor="joint">Douleurs articulaires récurrentes</Label>
                </div>
                <div>
                  <Label htmlFor="injuries">Blessures (séparées par virgule)</Label>
                  <Input
                    id="injuries"
                    placeholder="ex: genou, épaule"
                    onBlur={(e) =>
                      update(
                        "injuries",
                        e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      )
                    }
                  />
                </div>
                {(state.cardiacIssues || state.jointPain) && (
                  <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
                    Consultez un professionnel de santé avant de débuter. Le coach adaptera les
                    intensités en conséquence.
                  </p>
                )}
              </>
            )}
            {step === 4 && (
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
                          className={`rounded-xl border px-3 py-2 text-sm capitalize transition ${
                            selected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-foreground hover:border-primary/50"
                          }`}
                          onClick={() =>
                            update(
                              "equipment",
                              selected
                                ? state.equipment.filter((e) => e !== eq)
                                : [...state.equipment, eq],
                            )
                          }
                        >
                          {eq}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="outdoor"
                    checked={state.outdoorAllowed}
                    onCheckedChange={(c) => update("outdoorAllowed", c === true)}
                  />
                  <Label htmlFor="outdoor">Entraînement extérieur autorisé (course, vélo, marche)</Label>
                </div>
              </>
            )}
            {step === 5 && (
              <>
                <div className="rounded-xl border border-border/60 p-4 text-sm text-muted-foreground">
                  Nous utilisons vos données santé uniquement pour personnaliser vos programmes. Vous
                  pouvez retirer votre consentement à tout moment.
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="consent"
                    checked={state.consentHealthData}
                    onCheckedChange={(c) => update("consentHealthData", c === true)}
                  />
                  <Label htmlFor="consent">
                    J'accepte le traitement de mes données santé pour personnaliser mon coaching.
                  </Label>
                </div>
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
            <Button onClick={submit} disabled={!canProceed() || submitting} variant="glow">
              {submitting ? "Génération…" : "Générer mon plan"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
