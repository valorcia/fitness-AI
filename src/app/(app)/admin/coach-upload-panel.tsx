"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle2, Loader2, ImageIcon, Link } from "lucide-react";
import { STANDARD_COACHES } from "@/lib/coach/standard-coaches";

type UploadStatus = "idle" | "uploading" | "done" | "error";
type Mode = "url" | "file";

type CoachState = {
  status: UploadStatus;
  url?: string;
  error?: string;
  mode?: Mode;
  inputUrl?: string;
};

export function CoachUploadPanel() {
  const [states, setStates] = useState<Record<string, CoachState>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function setCoachState(slug: string, next: Partial<CoachState>) {
    setStates((prev) => ({ ...prev, [slug]: { ...prev[slug], status: "idle", ...next } }));
  }

  async function saveUrl(slug: string, url: string) {
    if (!url.startsWith("http")) {
      setCoachState(slug, { status: "error", error: "L'URL doit commencer par http" });
      return;
    }
    setCoachState(slug, { status: "uploading", error: undefined });
    try {
      const res = await fetch("/api/admin/save-coach-portrait-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, url }),
      });
      const body = await res.json();
      if (!res.ok) {
        setCoachState(slug, { status: "error", error: body.error ?? `Erreur ${res.status}` });
      } else {
        setCoachState(slug, { status: "done", url });
      }
    } catch (e) {
      setCoachState(slug, { status: "error", error: e instanceof Error ? e.message : "Erreur réseau" });
    }
  }

  async function handleFile(slug: string, file: File) {
    setCoachState(slug, { status: "uploading", error: undefined });
    const form = new FormData();
    form.append("slug", slug);
    form.append("file", file);
    try {
      const res = await fetch("/api/admin/upload-coach-portrait", { method: "POST", body: form });
      const body = await res.json();
      if (!res.ok) {
        setCoachState(slug, { status: "error", error: body.error ?? `Erreur ${res.status}` });
      } else {
        setCoachState(slug, { status: "done", url: body.url });
      }
    } catch (e) {
      setCoachState(slug, { status: "error", error: e instanceof Error ? e.message : "Erreur réseau" });
    }
  }

  const done = Object.values(states).filter((s) => s.status === "done").length;

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Génère chaque image sur <strong>leonardo.ai</strong>, puis colle son URL ou uploade le fichier.
        </p>
        <span className="shrink-0 text-sm font-semibold text-violet-600 dark:text-violet-400">
          {done}/10 enregistrés
        </span>
      </div>

      <div className="grid gap-2">
        {STANDARD_COACHES.map((coach) => {
          const s: CoachState = states[coach.slug] ?? { status: "idle" };
          const isDone = s.status === "done";
          const isUploading = s.status === "uploading";
          const mode = s.mode ?? "url";

          return (
            <div
              key={coach.slug}
              className={`grid gap-2 rounded-lg border p-3 transition-colors ${
                isDone
                  ? "border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-950/20"
                  : "border-border bg-card"
              }`}
            >
              {/* Header row */}
              <div className="flex items-center gap-3">
                {isDone && s.url ? (
                  <img src={s.url} alt={coach.displayName} className="h-12 w-12 shrink-0 rounded-md object-cover" />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{coach.displayName}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{coach.persona}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                      {coach.gender === "female" ? "♀" : "♂"}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{coach.specialty}</p>
                </div>

                {isDone ? (
                  <CheckCircle2 className="h-6 w-6 shrink-0 text-green-500" />
                ) : isUploading ? (
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin text-violet-500" />
                ) : null}
              </div>

              {/* Prompt */}
              <details className="text-xs">
                <summary className="cursor-pointer text-violet-600 hover:underline dark:text-violet-400">
                  Voir le prompt leonardo.ai
                </summary>
                <p className="mt-1 rounded bg-muted p-2 leading-relaxed text-muted-foreground">{coach.prompt}</p>
              </details>

              {/* Input zone — hidden when done */}
              {!isDone && (
                <div className="grid gap-2">
                  {/* Mode tabs */}
                  <div className="flex gap-1 text-xs">
                    <button
                      onClick={() => setCoachState(coach.slug, { mode: "url" })}
                      className={`rounded px-2 py-1 font-medium transition-colors ${
                        mode === "url"
                          ? "bg-violet-600 text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      Coller une URL
                    </button>
                    <button
                      onClick={() => setCoachState(coach.slug, { mode: "file" })}
                      className={`rounded px-2 py-1 font-medium transition-colors ${
                        mode === "file"
                          ? "bg-violet-600 text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      Uploader un fichier
                    </button>
                  </div>

                  {mode === "url" ? (
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://cdn.leonardo.ai/..."
                        value={s.inputUrl ?? ""}
                        onChange={(e) => setCoachState(coach.slug, { inputUrl: e.target.value })}
                        className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500"
                        disabled={isUploading}
                      />
                      <button
                        onClick={() => void saveUrl(coach.slug, s.inputUrl ?? "")}
                        disabled={isUploading || !s.inputUrl}
                        className="flex shrink-0 items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                      >
                        <Link className="h-3.5 w-3.5" />
                        Enregistrer
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        ref={(el) => { inputRefs.current[coach.slug] = el; }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleFile(coach.slug, file);
                          e.target.value = "";
                        }}
                      />
                      <button
                        onClick={() => inputRefs.current[coach.slug]?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 disabled:opacity-50 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-300"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Choisir un fichier (nécessite Vercel Blob)
                      </button>
                    </>
                  )}

                  {s.error ? (
                    <p className="text-xs text-red-600 dark:text-red-400">{s.error}</p>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
