"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";
import { Volume2, VolumeX, CheckCircle2 } from "lucide-react";
import type { Workout, WorkoutSet, Exercise, WorkoutFeedback } from "@prisma/client";
import { FeedbackForm } from "./feedback-form";

type SetWithExercise = WorkoutSet & { exercise: Exercise };
type Props = { workout: Workout & { sets: SetWithExercise[]; feedback: WorkoutFeedback | null } };

export function WorkoutPlayer({ workout }: Props) {
  const router = useRouter();
  const [activeIdx, setActiveIdx] = React.useState(() =>
    Math.max(0, workout.sets.findIndex((s) => !s.completed)),
  );
  const [elapsed, setElapsed] = React.useState(0);
  const [voiceOn, setVoiceOn] = React.useState(true);
  const [restSecondsLeft, setRestSecondsLeft] = React.useState<number | null>(null);
  const [completedCount, setCompletedCount] = React.useState(
    workout.sets.filter((s) => s.completed).length,
  );

  React.useEffect(() => {
    if (workout.status === "COMPLETED") return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [workout.status]);

  React.useEffect(() => {
    if (restSecondsLeft === null) return;
    if (restSecondsLeft <= 0) {
      setRestSecondsLeft(null);
      speak("Prêt. Série suivante.");
      return;
    }
    const t = setTimeout(() => setRestSecondsLeft((r) => (r === null ? null : r - 1)), 1000);
    return () => clearTimeout(t);
  }, [restSecondsLeft, speak]);

  const activeSet = workout.sets[activeIdx];
  const total = workout.sets.length;
  const progress = total === 0 ? 0 : (completedCount / total) * 100;

  const speak = React.useCallback(
    (text: string) => {
      if (!voiceOn || typeof window === "undefined") return;
      const synth = window.speechSynthesis;
      if (!synth) return;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "fr-FR";
      synth.speak(u);
    },
    [voiceOn],
  );

  async function completeSet() {
    if (!activeSet) return;
    await fetch(`/api/workouts/${workout.id}/sets/${activeSet.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: true }),
    });
    setCompletedCount((c) => c + 1);
    setRestSecondsLeft(activeSet.restSec ?? 60);
    speak(`Série validée. Repos ${activeSet.restSec ?? 60} secondes.`);
    if (activeIdx + 1 < total) setActiveIdx((i) => i + 1);
  }

  async function finishWorkout() {
    await fetch(`/api/workouts/${workout.id}/complete`, { method: "POST" });
    router.refresh();
  }

  if (workout.status === "COMPLETED") {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <CardTitle>Séance terminée</CardTitle>
            </div>
            <CardDescription>
              {formatDuration(workout.durationSec ?? 0)} · {workout.caloriesKcal ?? "—"} kcal · Score{" "}
              {workout.score ?? "—"}/100
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div>Sets: {workout.sets.length}</div>
            <div>Exercices: {new Set(workout.sets.map((s) => s.exerciseId)).size}</div>
          </CardContent>
        </Card>
        {!workout.feedback && <FeedbackForm workoutId={workout.id} />}
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{workout.type}</CardTitle>
              <CardDescription>Séance en cours</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setVoiceOn((v) => !v)}
                aria-label="Toggle voice"
              >
                {voiceOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Badge variant="outline">{formatDuration(elapsed)}</Badge>
            </div>
          </div>
          <Progress value={progress} className="mt-3" />
        </CardHeader>
        <CardContent>
          {activeSet ? (
            <motion.div
              key={activeSet.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{activeSet.exercise.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {activeSet.targetSets ?? "?"} × {activeSet.targetReps ?? activeSet.targetTempo ?? "reps"}
                    {activeSet.targetWeight ? ` @ ${activeSet.targetWeight} kg` : ""}
                  </div>
                </div>
                <Badge>{activeIdx + 1} / {total}</Badge>
              </div>

              <div className="rounded-2xl border border-border/60 bg-secondary/40 p-4 text-sm text-muted-foreground">
                Cues :{" "}
                {activeSet.exercise.cues.length
                  ? activeSet.exercise.cues.join(" · ")
                  : "Bonne posture. Respiration rythmée."}
              </div>

              {restSecondsLeft !== null ? (
                <div className="rounded-2xl border border-primary/40 bg-primary/10 p-4 text-center">
                  <div className="text-xs uppercase tracking-wide text-primary">Repos</div>
                  <div className="text-3xl font-bold">{restSecondsLeft}s</div>
                </div>
              ) : (
                <Button size="lg" variant="glow" onClick={completeSet}>
                  Valider la série
                </Button>
              )}
            </motion.div>
          ) : (
            <p>Toutes les séries sont terminées.</p>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/workout")}>
          Quitter
        </Button>
        <Button onClick={finishWorkout}>Terminer la séance</Button>
      </div>
    </div>
  );
}
