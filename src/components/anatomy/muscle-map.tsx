"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type MuscleKey =
  | "chest"
  | "front-delts"
  | "biceps"
  | "forearms"
  | "abs"
  | "obliques"
  | "quads"
  | "calves"
  | "traps"
  | "rear-delts"
  | "back"
  | "lats"
  | "triceps"
  | "glutes"
  | "hamstrings";

type Props = {
  view?: "front" | "back" | "both";
  highlighted?: Partial<Record<MuscleKey, number>>; // 0..1 intensity
  onSelect?: (key: MuscleKey) => void;
  className?: string;
};

const BASE = "hsl(210 22% 92%)";
const STROKE = "hsl(210 35% 70%)";

// Minimalist anatomical silhouette. Not medically accurate — meant as a
// stylised summary of worked muscle groups.
function Path({
  d,
  data,
  k,
  highlighted,
  onSelect,
}: {
  d: string;
  data: Partial<Record<MuscleKey, number>>;
  k: MuscleKey;
  highlighted?: Props["highlighted"];
  onSelect?: Props["onSelect"];
}) {
  const intensity = highlighted?.[k] ?? 0;
  const fill = intensity > 0
    ? `hsl(172 72% ${Math.max(30, 60 - intensity * 30)}% / ${0.35 + intensity * 0.55})`
    : BASE;
  return (
    <path
      d={d}
      fill={fill}
      stroke={STROKE}
      strokeWidth={1}
      strokeLinejoin="round"
      onClick={() => onSelect?.(k)}
      className="transition-all duration-300 ease-out"
      style={{ cursor: onSelect ? "pointer" : "default" }}
    >
      <title>{k}</title>
    </path>
  );
}

export function MuscleMap({
  view = "both",
  highlighted = {},
  onSelect,
  className,
}: Props) {
  return (
    <div className={cn("flex items-center justify-center gap-6", className)}>
      {(view === "front" || view === "both") && (
        <svg viewBox="0 0 160 360" className="h-full max-h-80 w-auto" role="img" aria-label="Vue avant">
          {/* head */}
          <circle cx="80" cy="30" r="20" fill={BASE} stroke={STROKE} />
          {/* neck */}
          <rect x="72" y="48" width="16" height="14" fill={BASE} stroke={STROKE} rx="3" />
          {/* traps */}
          <Path k="traps" d="M52 62 Q80 48 108 62 L108 76 L52 76 Z" data={highlighted} highlighted={highlighted} onSelect={onSelect} />
          {/* chest */}
          <Path k="chest" d="M50 78 Q80 70 110 78 L114 128 Q80 140 46 128 Z" data={highlighted} highlighted={highlighted} onSelect={onSelect} />
          {/* front delts */}
          <Path k="front-delts" d="M34 76 Q46 70 52 78 L52 104 Q40 110 32 100 Z" data={highlighted} highlighted={highlighted} onSelect={onSelect} />
          <Path k="front-delts" d="M126 76 Q114 70 108 78 L108 104 Q120 110 128 100 Z" data={highlighted} highlighted={highlighted} onSelect={onSelect} />
          {/* biceps */}
          <Path k="biceps" d="M28 102 Q40 104 46 118 L40 156 Q26 150 22 126 Z" data={highlighted} highlighted={highlighted} onSelect={onSelect} />
          <Path k="biceps" d="M132 102 Q120 104 114 118 L120 156 Q134 150 138 126 Z" data={highlighted} highlighted={highlighted} onSelect={onSelect} />
          {/* forearms */}
          <Path k="forearms" d="M18 160 Q32 160 42 168 L38 204 Q22 202 14 186 Z" data={highlighted} highlighted={highlighted} onSelect={onSelect} />
          <Path k="forearms" d="M142 160 Q128 160 118 168 L122 204 Q138 202 146 186 Z" data={highlighted} highlighted={highlighted} onSelect={onSelect} />
          {/* abs */}
          <Path k="abs" d="M68 130 Q80 134 92 130 L92 186 Q80 192 68 186 Z" data={highlighted} highlighted={highlighted} onSelect={onSelect} />
          {/* obliques */}
          <Path k="obliques" d="M48 134 Q62 134 66 148 L66 188 Q52 184 46 168 Z" data={highlighted} highlighted={highlighted} onSelect={onSelect} />
          <Path k="obliques" d="M112 134 Q98 134 94 148 L94 188 Q108 184 114 168 Z" data={highlighted} highlighted={highlighted} onSelect={onSelect} />
          {/* quads */}
          <Path k="quads" d="M52 196 Q72 198 74 208 L70 286 Q54 282 50 240 Z" data={highlighted} highlighted={highlighted} onSelect={onSelect} />
          <Path k="quads" d="M108 196 Q88 198 86 208 L90 286 Q106 282 110 240 Z" data={highlighted} highlighted={highlighted} onSelect={onSelect} />
          {/* calves (front-ish) */}
          <Path k="calves" d="M56 290 L72 290 L70 338 L58 338 Z" data={highlighted} highlighted={highlighted} onSelect={onSelect} />
          <Path k="calves" d="M88 290 L104 290 L102 338 L90 338 Z" data={highlighted} highlighted={highlighted} onSelect={onSelect} />
        </svg>
      )}
      {(view === "back" || view === "both") && (
        <svg viewBox="0 0 160 360" className="h-full max-h-80 w-auto" role="img" aria-label="Vue arrière">
          {/* head */}
          <circle cx="80" cy="30" r="20" fill={BASE} stroke={STROKE} />
          <rect x="72" y="48" width="16" height="14" fill={BASE} stroke={STROKE} rx="3" />
          {/* traps back */}
          <Path k="traps" d="M50 62 Q80 46 110 62 L110 96 Q80 100 50 96 Z" data={highlighted} highlighted={highlighted} onSelect={onSelect} />
          {/* rear delts */}
          <Path k="rear-delts" d="M32 78 Q46 72 52 80 L52 104 Q38 108 30 98 Z" data={highlighted} highlighted={highlighted} onSelect={onSelect} />
          <Path k="rear-delts" d="M128 78 Q114 72 108 80 L108 104 Q122 108 130 98 Z" data={highlighted} highlighted={highlighted} onSelect={onSelect} />
          {/* upper back + lats */}
          <Path k="back" d="M52 96 L108 96 L108 132 L52 132 Z" data={highlighted} highlighted={highlighted} onSelect={onSelect} />
          <Path k="lats" d="M48 132 L112 132 L116 182 Q80 196 44 182 Z" data={highlighted} highlighted={highlighted} onSelect={onSelect} />
          {/* triceps */}
          <Path k="triceps" d="M28 104 Q40 106 46 120 L40 158 Q26 152 22 128 Z" data={highlighted} highlighted={highlighted} onSelect={onSelect} />
          <Path k="triceps" d="M132 104 Q120 106 114 120 L120 158 Q134 152 138 128 Z" data={highlighted} highlighted={highlighted} onSelect={onSelect} />
          {/* glutes */}
          <Path k="glutes" d="M52 186 Q80 182 108 186 L108 218 Q80 224 52 218 Z" data={highlighted} highlighted={highlighted} onSelect={onSelect} />
          {/* hamstrings */}
          <Path k="hamstrings" d="M52 222 Q72 222 74 232 L70 288 Q54 286 50 258 Z" data={highlighted} highlighted={highlighted} onSelect={onSelect} />
          <Path k="hamstrings" d="M108 222 Q88 222 86 232 L90 288 Q106 286 110 258 Z" data={highlighted} highlighted={highlighted} onSelect={onSelect} />
          {/* calves */}
          <Path k="calves" d="M56 292 L72 292 L70 338 L58 338 Z" data={highlighted} highlighted={highlighted} onSelect={onSelect} />
          <Path k="calves" d="M88 292 L104 292 L102 338 L90 338 Z" data={highlighted} highlighted={highlighted} onSelect={onSelect} />
        </svg>
      )}
    </div>
  );
}
