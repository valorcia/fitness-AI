"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import type { CoachAppearance } from "@/lib/onboarding/coach-appearance";
import { cn } from "@/lib/utils";

type Persona = "STRICT" | "FUN" | "ZEN" | "MILITARY" | "ELITE";

type GenerationState = {
  imageUrl: string | null;
  loading: boolean;
  failed: boolean;
  generated: boolean;
  /** Human-readable reason when failed=true (HTTP status + server message). */
  errorReason: string | null;
  /** Trigger a new generation against HeyGen. */
  generate: () => void;
  /** True once the persisted-avatar bootstrap GET has resolved. */
  bootstrapped: boolean;
};

type Props = {
  appearance: CoachAppearance;
  persona: Persona;
  coachName: string;
  className?: string;
  /** Shared generation state from `useCoachPreview` — supply the SAME object to every preview instance to avoid duplicate fetches. */
  generation: GenerationState;
};

const PERSONA_LABEL: Record<Persona, string> = {
  FUN: "Bienveillant",
  STRICT: "Exigeant",
  ZEN: "Apaisant",
  MILITARY: "Coach militaire",
  ELITE: "Mentor expert",
};

const OUTFIT_COLOR_HEX: Record<string, string> = {
  black: "#0F172A",
  white: "#F8FAFC",
  grey: "#9CA3AF",
  navy: "#1B3954",
  teal: "#14B8A6",
  green: "#16A34A",
  red: "#DC2626",
  orange: "#F97316",
  yellow: "#F59E0B",
  pink: "#EC4899",
  purple: "#8B5CF6",
};

const COACH_APPEARANCE_KEYS = [
  "coachPreferredGender",
  "coachPreferredEthnicity",
  "coachPreferredHairColor",
  "coachPreferredHairStyle",
  "coachPreferredFaceShape",
  "coachPreferredEyeColor",
  "coachPreferredEyeShape",
  "coachPreferredSkinTone",
  "coachPreferredMouth",
  "coachPreferredNose",
  "coachPreferredBodyHeight",
  "coachPreferredBodyShape",
  "coachOutfitTop",
  "coachOutfitBottom",
  "coachOutfitColor",
  "coachOutfitStyle",
] as const;

/** Pick only the coach-related string fields. The wizard hands us its full
 * onboarding state which contains numbers, booleans and arrays the avatar
 * endpoint must never see. */
function pickCoachAppearance(input: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of COACH_APPEARANCE_KEYS) {
    const v = input[k];
    if (typeof v === "string" && v.length > 0) out[k] = v;
  }
  return out;
}

export function appearanceSignature(a: CoachAppearance, persona: Persona) {
  return [
    persona,
    a.coachPreferredGender,
    a.coachPreferredEthnicity,
    a.coachPreferredHairColor,
    a.coachPreferredHairStyle,
    a.coachPreferredFaceShape,
    a.coachPreferredEyeColor,
    a.coachPreferredEyeShape,
    a.coachPreferredSkinTone,
    a.coachPreferredMouth,
    a.coachPreferredNose,
    a.coachPreferredBodyHeight,
    a.coachPreferredBodyShape,
    a.coachOutfitTop,
    a.coachOutfitBottom,
    a.coachOutfitColor,
    a.coachOutfitStyle,
  ]
    .map((v) => v ?? "any")
    .join("|");
}

/**
 * Shared hook so multiple <CoachAvatarPreview /> instances (sticky desktop +
 * floating mobile) reuse a single state and a single in-flight request.
 *
 * Generation is opt-in: nothing happens until the user clicks the "Generate"
 * button (calls `generate()`). On mount we GET the persisted avatar from the
 * DB so returning users see their coach immediately without spending credits.
 */
export function useCoachPreview(
  appearance: CoachAppearance,
  persona: Persona,
  coachName: string,
): GenerationState {
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [errorReason, setErrorReason] = React.useState<string | null>(null);
  const [bootstrapped, setBootstrapped] = React.useState(false);
  const bootstrapStarted = React.useRef(false);
  const abortRef = React.useRef<AbortController | null>(null);

  // Keep latest values in refs so `generate` doesn't need to be re-created on
  // every render (which would force consumers to memoize).
  const latest = React.useRef({ appearance, persona, coachName });
  latest.current = { appearance, persona, coachName };

  // Bootstrap from Preference.coachAvatarUrl (persistent per-user).
  React.useEffect(() => {
    if (bootstrapStarted.current) return;
    bootstrapStarted.current = true;
    fetch("/api/coach-avatar", { method: "GET" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { url: string | null } | null) => {
        if (data?.url) setImageUrl(data.url);
      })
      .catch(() => {
        /* silent — bootstrap is best-effort */
      })
      .finally(() => setBootstrapped(true));
  }, []);

  const generate = React.useCallback(() => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);
    setFailed(false);
    setErrorReason(null);

    const body = JSON.stringify({
      appearance: pickCoachAppearance(
        latest.current.appearance as unknown as Record<string, unknown>,
      ),
      persona: latest.current.persona,
      coachName: latest.current.coachName,
    });

    const POLL_INTERVAL_MS = 2000;
    const POLL_DEADLINE_MS = 90_000; // 90s total budget client-side

    const pollUntilDone = async (
      generationId: string,
      signature: string | undefined,
      deadline: number,
    ): Promise<string> => {
      while (Date.now() < deadline) {
        if (ac.signal.aborted) throw new DOMException("Aborted", "AbortError");
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        const params = new URLSearchParams({ id: generationId });
        if (signature) params.set("sig", signature);
        const res = await fetch(`/api/coach-avatar?${params.toString()}`, {
          method: "GET",
          signal: ac.signal,
        });
        if (!res.ok) continue;
        const data = (await res.json()) as {
          status?: string;
          url?: string;
          error?: string;
        };
        if (data.status === "success" && data.url) return data.url;
        if (data.status === "failed") {
          throw new Error(data.error ?? "HeyGen generation failed");
        }
      }
      throw new Error("Generation timed out (90s)");
    };

    (async () => {
      try {
        const submitRes = await fetch("/api/coach-avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          signal: ac.signal,
        });
        if (!submitRes.ok) {
          const payload = await submitRes.json().catch(() => null);
          const serverMsg = payload?.error ?? `HTTP ${submitRes.status}`;
          throw new Error(`${submitRes.status} — ${serverMsg}`);
        }
        const submitData = (await submitRes.json()) as {
          url?: string;
          generationId?: string;
          signature?: string;
          cached?: boolean;
        };

        // Cache hit short-circuit — server already had the URL.
        if (submitData.url) {
          setImageUrl(submitData.url);
          return;
        }

        if (!submitData.generationId) {
          throw new Error("No generationId returned");
        }

        const finalUrl = await pollUntilDone(
          submitData.generationId,
          submitData.signature,
          Date.now() + POLL_DEADLINE_MS,
        );
        setImageUrl(finalUrl);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setFailed(true);
        setErrorReason(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return {
    imageUrl,
    loading,
    failed,
    generated: imageUrl !== null,
    errorReason,
    generate,
    bootstrapped,
  };
}

/** Full-body human silhouette shown before any AI avatar is generated. */
function CoachSilhouette({ accentColor }: { accentColor: string }) {
  return (
    <svg
      viewBox="0 0 100 220"
      className="absolute inset-0 m-auto h-[85%] w-auto"
      fill={accentColor}
      aria-hidden
    >
      {/* head */}
      <ellipse cx="50" cy="22" rx="16" ry="18" opacity="0.25" />
      {/* neck */}
      <rect x="44" y="38" width="12" height="10" rx="4" opacity="0.22" />
      {/* torso */}
      <ellipse cx="50" cy="82" rx="22" ry="30" opacity="0.2" />
      {/* left arm */}
      <rect x="24" y="50" width="10" height="52" rx="5" transform="rotate(-8 29 76)" opacity="0.18" />
      {/* right arm */}
      <rect x="66" y="50" width="10" height="52" rx="5" transform="rotate(8 71 76)" opacity="0.18" />
      {/* left leg */}
      <rect x="32" y="110" width="14" height="68" rx="7" transform="rotate(-3 39 144)" opacity="0.2" />
      {/* right leg */}
      <rect x="54" y="110" width="14" height="68" rx="7" transform="rotate(3 61 144)" opacity="0.2" />
    </svg>
  );
}

export function CoachAvatarPreview({
  appearance,
  persona,
  coachName,
  className,
  generation,
}: Props) {
  const accent =
    appearance.coachOutfitColor && appearance.coachOutfitColor !== "any"
      ? OUTFIT_COLOR_HEX[appearance.coachOutfitColor] ?? "#14B8A6"
      : "#14B8A6";

  return (
    <div className={cn("rounded-3xl border border-border bg-card p-4 shadow-xl", className)}>
      {/*
       * `isolate` creates a new stacking context so `overflow-hidden` correctly
       * clips the CSS scale() transform applied by framer-motion in all browsers
       * (Safari and some Chromium versions otherwise bleed the scaled image
       * slightly past the rounded corners).
       */}
      <div
        className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl isolate"
        style={{ background: `linear-gradient(180deg, ${accent}22 0%, ${accent}66 100%)` }}
      >
        <AnimatePresence mode="wait">
          {generation.imageUrl ? (
            <motion.div
              key={generation.imageUrl}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, scale: [1, 1.012, 1], y: [0, -2, 0] }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 0.35 },
                scale: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              <img
                src={generation.imageUrl}
                alt={`Portrait IA du coach ${coachName}`}
                className="absolute inset-0 h-full w-full object-cover object-top"
                loading="eager"
              />
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <CoachSilhouette accentColor={accent} />
            </motion.div>
          )}
        </AnimatePresence>

        {generation.loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2 text-white">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-xs font-medium">Génération du coach…</span>
            </div>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent p-3 text-white">
          <div className="text-base font-semibold drop-shadow">{coachName || "Votre coach"}</div>
          <div className="text-xs opacity-80">{PERSONA_LABEL[persona]}</div>
        </div>

        <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-primary shadow">
          <Sparkles className="h-3 w-3" />
          {generation.generated ? "IA" : "Aperçu"}
        </span>
      </div>

      <p className="mt-3 px-1 text-center text-[11px] leading-snug text-muted-foreground">
        {generation.failed
          ? `Génération IA indisponible. (${generation.errorReason ?? "raison inconnue"})`
          : generation.generated
            ? "Portrait IA. Modifie un attribut puis relance la génération si besoin."
            : "Sélectionne tes critères ci-contre puis clique sur « Générer mon avatar »."}
      </p>
    </div>
  );
}
