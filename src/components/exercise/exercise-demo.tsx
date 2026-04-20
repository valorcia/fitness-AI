"use client";

import * as React from "react";
import type { ExerciseCategory } from "@prisma/client";
import { cn } from "@/lib/utils";

/**
 * Schematic animated demonstration of a movement trajectory.
 * Uses SVG motion paths — always works without external video assets.
 * Looks like the little exercise animations in Apple Fitness+ / Whoop.
 */

type Props = {
  category: ExerciseCategory;
  slug?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const TRAJECTORIES: Record<
  string,
  { path: string; fromFill: string; toFill: string; accent: string }
> = {
  "barbell-back-squat": {
    path: "M30 70 L30 40 L110 40 L110 70",
    fromFill: "#0F766E",
    toFill: "#14B8A6",
    accent: "#F59E0B",
  },
  "bench-press": {
    path: "M20 60 L40 40 L100 40 L120 60",
    fromFill: "#DC2626",
    toFill: "#F97316",
    accent: "#FBBF24",
  },
  "deadlift": {
    path: "M70 90 L70 30",
    fromFill: "#F59E0B",
    toFill: "#EF4444",
    accent: "#FDE68A",
  },
  "pull-up": {
    path: "M70 80 L70 30",
    fromFill: "#8B5CF6",
    toFill: "#EC4899",
    accent: "#FCE7F3",
  },
};

const CATEGORY_PATH: Record<
  ExerciseCategory,
  { path: string; fromFill: string; toFill: string }
> = {
  LOWER: { path: "M30 70 L30 40 L110 40 L110 70", fromFill: "#0F766E", toFill: "#14B8A6" },
  UPPER_PUSH: { path: "M20 60 L70 30 L120 60", fromFill: "#DC2626", toFill: "#F97316" },
  UPPER_PULL: { path: "M70 80 L70 25", fromFill: "#8B5CF6", toFill: "#EC4899" },
  FULL_BODY: { path: "M30 80 L70 30 L110 80", fromFill: "#F59E0B", toFill: "#EF4444" },
  CORE: { path: "M20 70 Q70 40 120 70", fromFill: "#F43F5E", toFill: "#F59E0B" },
  CARDIO: { path: "M10 70 Q40 40 70 60 T130 60", fromFill: "#10B981", toFill: "#22D3EE" },
  MOBILITY: { path: "M20 60 C40 40, 100 80, 120 60", fromFill: "#6366F1", toFill: "#A855F7" },
};

export function ExerciseDemo({ category, slug, size = "md", className }: Props) {
  const custom = slug ? TRAJECTORIES[slug] : undefined;
  const preset = custom ?? CATEGORY_PATH[category];
  const height = size === "sm" ? 64 : size === "lg" ? 160 : 110;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        size === "sm" ? "h-16" : size === "lg" ? "h-40" : "h-28",
        className,
      )}
      style={{
        background: `linear-gradient(135deg, ${preset.fromFill} 0%, ${preset.toFill} 100%)`,
      }}
    >
      <svg
        viewBox="0 0 140 100"
        width="100%"
        height={height}
        aria-hidden
        className="absolute inset-0"
      >
        <defs>
          <linearGradient id={`track-${category}-${slug ?? "x"}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="white" stopOpacity="0.2" />
            <stop offset="100%" stopColor="white" stopOpacity="0.55" />
          </linearGradient>
          <pattern id={`grid-${category}-${slug ?? "x"}`} width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeOpacity="0.08" strokeWidth="0.5" />
          </pattern>
          <filter id={`blur-${category}-${slug ?? "x"}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>

        <rect width="140" height="100" fill={`url(#grid-${category}-${slug ?? "x"})`} />

        {/* trajectory track */}
        <path
          d={preset.path}
          fill="none"
          stroke={`url(#track-${category}-${slug ?? "x"})`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* moving head, looping along the path */}
        <circle r="6" fill="white" filter={`url(#blur-${category}-${slug ?? "x"})`} opacity="0.6">
          <animateMotion dur="2.4s" repeatCount="indefinite" path={preset.path} rotate="auto" />
        </circle>
        <circle r="4.5" fill="white">
          <animateMotion dur="2.4s" repeatCount="indefinite" path={preset.path} rotate="auto" />
        </circle>

        {/* decorative sparks */}
        <g opacity="0.8">
          <circle cx="120" cy="20" r="1.4" fill="white">
            <animate attributeName="opacity" values="0;1;0" dur="2.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="20" cy="18" r="1.2" fill="white">
            <animate attributeName="opacity" values="1;0;1" dur="3.6s" repeatCount="indefinite" />
          </circle>
          <circle cx="110" cy="82" r="1.1" fill="white">
            <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    </div>
  );
}
