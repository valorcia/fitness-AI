"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Sparkles, Wand2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GeneratedPlan } from "@/services/plan-conversational";

type Props = {
  defaults: { sessionsPerWeek: number; sessionDurationMin: number };
  initialProposal: { id: string; summary: string; payload: GeneratedPlan } | null;
};

const INTENSITIES = [
  { value: "light", label: "Léger" },
  { value: "balanced", label: "Équilibré" },
  { value: "intense", label: "Intense" },
] as const;

const GOAL_OVERRIDES = [
  { value: "", label: "Suivre mon objectif" },
  { value: "WEIGHT_LOSS", label: "Perte de poids" },
  { value: "MUSCLE_GAIN", label: "Prise de masse" },
  { value: "ENDURANCE", label: "Endurance" },
  { value: "FITNESS", label: "Remise en forme" },
  { value: "HEALTH", label: "Santé" },
] as const;

const QUICK_PROMPTS = [
  { label: "10 jours de vacances, pas de matériel", value: "Je pars 10 jours en vacances, je n'aurai pas de matériel. Garde-moi du cardio + mobilité uniquement." },
  { label: "Focus haut du corps 4 semaines", value: "Donne-moi 4 semaines orientées haut du corps avec 2 séances jambes intégrées." },
  { label: "Préparer un 10 km dans 8 semaines", value: "Je cours un 10 km dans 8 semaines, il me faut un plan running progressif." },
  { label: "Récup après blessure", value: "Je sors d'une entorse de cheville, 3 semaines de reprise très progressive, sans impact." },
];

export function PlanningStudio({ defaults, initialProposal }: Props) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [proposal, setProposal] = React.useState(initialProposal);
  const [busy, setBusy] = React.useState<"apply" | "reject" | null>(null);

  // form
  const [extraContext, setExtraContext] = React.useState("");
  const [weeks, setWeeks] = React.useState(4);
  const [sessionsPerWeek, setSessionsPerWeek] = React.useState(defaults.sessionsPerWeek);
  const [sessionDurationMin, setSessionDurationMin] = React.useState(defaults.sessionDurationMin);
  const [intensityBias, setIntensityBias] = React.useState<"light" | "balanced" | "intense">(
    "balanced",
  );
  const [goalOverride, setGoalOverride] = React.useState("");
  const [focus, setFocus] = React.useState("");

  async function propose() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/coach/plan/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weeks,
          sessionsPerWeek,
          sessionDurationMin,
          intensityBias,
          goalOverride: goalOverride || undefined,
          focus: focus || undefined,
          extraContext: extraContext || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Erreur");
      }
      const body = await res.json();
      setProposal({ id: body.proposal.id, summary: body.plan.summary, payload: body.plan });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setPending(false);
    }
  }

  async function accept() {
    if (!proposal) return;
    setBusy("apply");
    try {
      const res = await fetch("/api/coach/plan/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId: proposal.id, replaceExisting: true }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Erreur");
      }
      setProposal(null);
      router.push("/workout/plan");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(null);
    }
  }

  async function reject() {
    if (!proposal) return;
    setBusy("reject");
    try {
      await fetch("/api/coach/plan/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId: proposal.id }),
      });
      setProposal(null);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-5">
      {!proposal && (
        <>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q.label}
                type="button"
                onClick={() => setExtraContext(q.value)}
                className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/50 hover:text-foreground"
              >
                {q.label}
              </button>
            ))}
          </div>

          <div className="grid gap-3">
            <Label htmlFor="context">Dites-moi votre besoin (conversation libre)</Label>
            <textarea
              id="context"
              value={extraContext}
              onChange={(e) => setExtraContext(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Ex : je voyage dans 2 semaines, je veux quelque chose d'intense mais court (30 min max), en chambre d'hôtel."
              className="w-full resize-none rounded-xl border border-input bg-background/60 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label>Objectif pour ce plan</Label>
              <select
                value={goalOverride}
                onChange={(e) => setGoalOverride(e.target.value)}
                className="mt-1 w-full rounded-xl border border-input bg-background/60 p-2.5 text-sm"
              >
                {GOAL_OVERRIDES.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Focus</Label>
              <Input
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                placeholder="Ex : haut du corps, cardio seuil, explosivité"
              />
            </div>
            <div>
              <Label>Durée du plan</Label>
              <div className="mt-1 flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={16}
                  value={weeks}
                  onChange={(e) => setWeeks(Math.min(16, Math.max(1, Number(e.target.value) || 1)))}
                />
                <span className="text-xs text-muted-foreground">semaines</span>
              </div>
            </div>
            <div>
              <Label>Séances / semaine · durée</Label>
              <div className="mt-1 flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={7}
                  value={sessionsPerWeek}
                  onChange={(e) =>
                    setSessionsPerWeek(Math.min(7, Math.max(1, Number(e.target.value) || 1)))
                  }
                />
                <Input
                  type="number"
                  min={15}
                  max={180}
                  step={5}
                  value={sessionDurationMin}
                  onChange={(e) =>
                    setSessionDurationMin(
                      Math.min(180, Math.max(15, Number(e.target.value) || 45)),
                    )
                  }
                />
                <span className="text-xs text-muted-foreground">min</span>
              </div>
            </div>
          </div>

          <div>
            <Label>Intensité</Label>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {INTENSITIES.map((i) => (
                <button
                  key={i.value}
                  type="button"
                  onClick={() => setIntensityBias(i.value)}
                  className={cn(
                    "rounded-xl border p-2.5 text-sm font-medium transition",
                    intensityBias === i.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  {i.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button onClick={propose} disabled={pending} size="lg">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Proposer un plan
          </Button>
        </>
      )}

      {proposal && (
        <div className="grid gap-4">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
              <Sparkles className="h-4 w-4" />
              Proposition du coach
            </div>
            <p className="text-sm">{proposal.summary}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <Badge variant="outline">{proposal.payload.weeks} semaines</Badge>
              <Badge variant="outline">{proposal.payload.sessionsPerWeek} séances/sem</Badge>
              <Badge variant="outline">{proposal.payload.goal}</Badge>
            </div>
          </div>

          <div className="grid gap-2">
            {proposal.payload.sessions.slice(0, 10).map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-border/60 p-3 text-sm"
              >
                <div>
                  <div className="font-semibold">
                    Jour {s.dayOffset + 1} · {s.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {s.type} · {s.durationMin} min · {s.blocks.length} blocs
                  </div>
                </div>
                <Badge variant="outline">{s.type}</Badge>
              </div>
            ))}
            {proposal.payload.sessions.length > 10 && (
              <div className="text-center text-xs text-muted-foreground">
                + {proposal.payload.sessions.length - 10} autres séances
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={accept} disabled={busy !== null} size="lg">
              {busy === "apply" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Valider ce plan
            </Button>
            <Button onClick={reject} disabled={busy !== null} size="lg" variant="outline">
              <X className="h-4 w-4" />
              Proposer autre chose
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
