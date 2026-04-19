"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Camera, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Result = {
  detected_items: Array<{
    name: string;
    portion?: string;
    estimated_grams?: number;
    kcal: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  }>;
  summary: string;
  confidence: number;
};

export function PhotoCapture() {
  const router = useRouter();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const cameraRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const [result, setResult] = React.useState<Result | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [totals, setTotals] = React.useState<{
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null>(null);

  async function onFile(file: File) {
    setError(null);
    setResult(null);
    setTotals(null);
    const MAX = 5 * 1024 * 1024;
    if (file.size > MAX) {
      setError("Image trop lourde (max 5 Mo).");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      setPending(true);
      try {
        const res = await fetch("/api/nutrition/photo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: dataUrl }),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Analyse impossible.");
        setResult(body.result);
        setTotals(body.totals);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur inconnue.");
      } finally {
        setPending(false);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>Analyse photo IA</CardTitle>
        </div>
        <CardDescription>
          Prenez en photo votre assiette : l'IA identifie les aliments et estime calories & macros.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          />
          <Button onClick={() => cameraRef.current?.click()} disabled={pending} variant="glow">
            <Camera className="h-4 w-4" /> Prendre une photo
          </Button>
          <Button onClick={() => fileRef.current?.click()} disabled={pending} variant="outline">
            <Upload className="h-4 w-4" /> Importer
          </Button>
        </div>

        {preview && (
          <div className="overflow-hidden rounded-2xl border border-border/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="plat" className="h-48 w-full object-cover" />
          </div>
        )}

        {pending && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 animate-pulse text-primary" />
            Analyse du plat…
          </p>
        )}

        {error && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {result && totals && (
          <div className="grid gap-3">
            <div className="grid grid-cols-4 gap-2 text-center">
              <Metric label="kcal" value={Math.round(totals.kcal)} />
              <Metric label="prot" value={`${Math.round(totals.protein)}g`} />
              <Metric label="gluc" value={`${Math.round(totals.carbs)}g`} />
              <Metric label="lip" value={`${Math.round(totals.fat)}g`} />
            </div>
            <ul className="divide-y divide-border/40 rounded-xl border border-border/60">
              {result.detected_items.map((it, i) => (
                <li key={i} className="flex items-center justify-between p-3 text-sm">
                  <div>
                    <div className="font-medium">{it.name}</div>
                    {it.portion && <div className="text-xs text-muted-foreground">{it.portion}</div>}
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>{Math.round(it.kcal)} kcal</div>
                    <div>
                      P{Math.round(it.protein_g)} · G{Math.round(it.carbs_g)} · L
                      {Math.round(it.fat_g)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">
              {result.summary} · Confiance {(result.confidence * 100).toFixed(0)}%. Ajusté & enregistré automatiquement.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border/40 p-2">
      <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}
