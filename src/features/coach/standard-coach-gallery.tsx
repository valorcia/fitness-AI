"use client";

import * as React from "react";
import { Check, Loader2, User2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type StandardCoachItem = {
  slug: string;
  displayName: string;
  persona: "FUN" | "STRICT" | "ZEN" | "MILITARY" | "ELITE";
  gender: "male" | "female";
  specialty: string;
  style: string;
  tagline: string;
  portraitUrl: string | null;
};

const PERSONA_LABEL: Record<StandardCoachItem["persona"], string> = {
  FUN: "Bienveillant",
  STRICT: "Exigeant",
  ZEN: "Apaisant",
  MILITARY: "Militaire",
  ELITE: "Mentor",
};

const PERSONA_EMOJI: Record<StandardCoachItem["persona"], string> = {
  FUN: "🤗",
  STRICT: "🎯",
  ZEN: "🧘",
  MILITARY: "🪖",
  ELITE: "🏆",
};

type Props = {
  /** Currently selected coach slug. */
  value: string | null;
  /** Called when the user picks a different coach. */
  onChange: (slug: string, coach: StandardCoachItem) => void;
  className?: string;
};

export function StandardCoachGallery({ value, onChange, className }: Props) {
  const [coaches, setCoaches] = React.useState<StandardCoachItem[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/standard-coaches")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data: { coaches: StandardCoachItem[] }) => {
        if (!cancelled) setCoaches(data.coaches);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
        Impossible de charger les coachs ({error})
      </p>
    );
  }

  if (!coaches) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Chargement des coachs…
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5", className)}>
      {coaches.map((c) => {
        const selected = value === c.slug;
        return (
          <button
            key={c.slug}
            type="button"
            onClick={() => onChange(c.slug, c)}
            className={cn(
              "group relative flex flex-col overflow-hidden rounded-2xl border bg-card text-left transition",
              selected
                ? "border-primary ring-2 ring-primary/40"
                : "border-border hover:border-primary/50",
            )}
            aria-pressed={selected}
          >
            {/* Portrait */}
            <div className="relative aspect-[9/16] w-full overflow-hidden bg-muted">
              {c.portraitUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.portraitUrl}
                  alt={`Coach ${c.displayName}`}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <User2 className="h-10 w-10 opacity-40" />
                </div>
              )}
              {selected && (
                <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                  <Check className="h-4 w-4" />
                </div>
              )}
              <div className="absolute left-2 top-2 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur">
                {PERSONA_EMOJI[c.persona]} {PERSONA_LABEL[c.persona]}
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-0.5 p-2.5">
              <p className="text-sm font-semibold leading-tight">{c.displayName}</p>
              <p className="text-[11px] leading-tight text-muted-foreground line-clamp-2">
                {c.specialty}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
