"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle2, Loader2, ImageIcon } from "lucide-react";
import { STANDARD_COACHES } from "@/lib/coach/standard-coaches";

type UploadStatus = "idle" | "uploading" | "done" | "error";

type CoachState = {
  status: UploadStatus;
  url?: string;
  error?: string;
};

export function CoachUploadPanel() {
  const [states, setStates] = useState<Record<string, CoachState>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function setCoachState(slug: string, next: Partial<CoachState>) {
    setStates((prev) => ({ ...prev, [slug]: { ...prev[slug], status: "idle", ...next } }));
  }

  async function handleFile(slug: string, file: File) {
    setCoachState(slug, { status: "uploading", error: undefined });

    const form = new FormData();
    form.append("slug", slug);
    form.append("file", file);

    try {
      const res = await fetch("/api/admin/upload-coach-portrait", {
        method: "POST",
        body: form,
      });
      const body = await res.json();
      if (!res.ok) {
        setCoachState(slug, { status: "error", error: body.error ?? `Erreur ${res.status}` });
      } else {
        setCoachState(slug, { status: "done", url: body.url });
      }
    } catch (e) {
      setCoachState(slug, {
        status: "error",
        error: e instanceof Error ? e.message : "Erreur réseau",
      });
    }
  }

  const done = Object.values(states).filter((s) => s.status === "done").length;

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Génère chaque image sur{" "}
          <strong>leonardo.ai</strong> avec le prompt fourni, puis uploade-la ici.
          Les images sont stockées dans Vercel Blob.
        </p>
        <span className="shrink-0 text-sm font-semibold text-violet-600 dark:text-violet-400">
          {done}/10 uploadés
        </span>
      </div>

      <div className="grid gap-2">
        {STANDARD_COACHES.map((coach) => {
          const s = states[coach.slug];
          const isDone = s?.status === "done";
          const isUploading = s?.status === "uploading";

          return (
            <div
              key={coach.slug}
              className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                isDone
                  ? "border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-950/20"
                  : "border-border bg-card"
              }`}
            >
              {/* Portrait preview or placeholder */}
              {isDone && s.url ? (
                <img
                  src={s.url}
                  alt={coach.displayName}
                  className="h-12 w-12 shrink-0 rounded-md object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              )}

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{coach.displayName}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                    {coach.persona}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                    {coach.gender === "female" ? "♀" : "♂"}
                  </span>
                </div>
                <p className="truncate text-xs text-muted-foreground">{coach.specialty}</p>

                {/* Prompt (collapsible) */}
                <details className="mt-1">
                  <summary className="cursor-pointer text-xs text-violet-600 hover:underline dark:text-violet-400">
                    Voir le prompt leonardo.ai
                  </summary>
                  <p className="mt-1 rounded bg-muted p-2 text-[11px] leading-relaxed text-muted-foreground">
                    {coach.prompt}
                  </p>
                </details>

                {s?.error ? (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{s.error}</p>
                ) : null}
              </div>

              {/* Upload button / status */}
              <div className="shrink-0">
                {isDone ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : isUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
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
                      className="flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-300 dark:hover:bg-violet-900/40"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Uploader
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
