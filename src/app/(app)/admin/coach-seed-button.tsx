"use client";

import { useState } from "react";
import { Loader2, Sparkles, CheckCircle2, XCircle, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

type CoachResult = {
  slug: string;
  status: "generated" | "skipped" | "failed";
  url?: string;
  error?: string;
};

type SeedResponse = {
  summary: { total: number; generated: number; skipped: number; failed: number };
  estimatedCostUsd: number;
  results: CoachResult[];
};

export function CoachSeedButton() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SeedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSeed(force: boolean) {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(
        `/api/admin/seed-standard-coaches${force ? "?force=1" : ""}`,
        { method: "POST" },
      );
      if (res.status === 503) {
        const body = await res.json();
        setError(`Variable manquante : ${body.error}`);
        return;
      }
      if (!res.ok) {
        setError(`Erreur ${res.status}`);
        return;
      }
      const body: SeedResponse = await res.json();
      setData(body);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => handleSeed(false)}
          disabled={loading}
          className="gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Génération en cours…" : "Générer les coachs manquants"}
        </Button>
        <Button
          variant="outline"
          onClick={() => handleSeed(true)}
          disabled={loading}
        >
          Tout régénérer (force=1)
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Utilise fal.ai Flux Dev (~0,25 $ pour les 10 coachs). Nécessite{" "}
        <code className="font-mono">FAL_KEY</code> et{" "}
        <code className="font-mono">BLOB_READ_WRITE_TOKEN</code> dans Vercel.
      </p>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      ) : null}

      {data ? (
        <div className="grid gap-3">
          <div className="flex gap-4 text-sm">
            <span className="font-semibold text-green-600 dark:text-green-400">
              ✓ {data.summary.generated} générés
            </span>
            <span className="text-muted-foreground">
              ↷ {data.summary.skipped} déjà présents
            </span>
            {data.summary.failed > 0 ? (
              <span className="text-red-600 dark:text-red-400">
                ✗ {data.summary.failed} échecs
              </span>
            ) : null}
            {data.estimatedCostUsd > 0 ? (
              <span className="text-muted-foreground">
                ~${data.estimatedCostUsd.toFixed(2)}
              </span>
            ) : null}
          </div>

          <div className="grid gap-1.5">
            {data.results.map((r) => (
              <div
                key={r.slug}
                className="flex items-center gap-2 rounded-md border border-border/40 px-3 py-2 text-sm"
              >
                {r.status === "generated" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                ) : r.status === "failed" ? (
                  <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                ) : (
                  <SkipForward className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span className="font-mono text-xs text-muted-foreground">{r.slug}</span>
                {r.url ? (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-xs text-violet-600 hover:underline dark:text-violet-400"
                  >
                    voir
                  </a>
                ) : null}
                {r.error ? (
                  <span className="ml-auto text-xs text-red-500">{r.error}</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
