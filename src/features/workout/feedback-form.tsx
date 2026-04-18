"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function FeedbackForm({ workoutId }: { workoutId: string }) {
  const router = useRouter();
  const [difficulty, setDifficulty] = React.useState(6);
  const [pain, setPain] = React.useState(false);
  const [soreness, setSoreness] = React.useState(3);
  const [motivation, setMotivation] = React.useState(7);
  const [energy, setEnergy] = React.useState(7);
  const [submitting, setSubmitting] = React.useState(false);

  async function submit() {
    setSubmitting(true);
    await fetch(`/api/workouts/${workoutId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ difficulty, pain, soreness, motivation, energy }),
    });
    setSubmitting(false);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comment était la séance ?</CardTitle>
        <CardDescription>
          Vos retours permettent au coach IA d'adapter la prochaine séance.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Slider label="Difficulté" value={difficulty} min={1} max={10} onChange={setDifficulty} />
        <Slider label="Courbatures" value={soreness} min={0} max={10} onChange={setSoreness} />
        <Slider label="Motivation" value={motivation} min={1} max={10} onChange={setMotivation} />
        <Slider label="Énergie" value={energy} min={1} max={10} onChange={setEnergy} />
        <div className="flex items-center gap-3">
          <Checkbox id="pain" checked={pain} onCheckedChange={(c) => setPain(c === true)} />
          <Label htmlFor="pain">J'ai ressenti une douleur inhabituelle</Label>
        </div>
        <Button onClick={submit} disabled={submitting}>
          {submitting ? "Envoi…" : "Envoyer"}
        </Button>
      </CardContent>
    </Card>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {value}/{max}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}
