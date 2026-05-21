"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CoachAvatar } from "./coach-avatar";

type Size = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const SIZE: Record<Size, { dim: string; ring: string }> = {
  xs: { dim: "h-7 w-7", ring: "ring-1" },
  sm: { dim: "h-10 w-10", ring: "ring-2" },
  md: { dim: "h-16 w-16", ring: "ring-2" },
  lg: { dim: "h-24 w-24", ring: "ring-2" },
  xl: { dim: "h-36 w-36", ring: "ring-2" },
  "2xl": { dim: "h-56 w-56", ring: "ring-4" },
};

type Props = {
  portraitUrl?: string | null;
  name?: string;
  /** Emoji-bubble fallback key when portraitUrl is null. */
  fallbackKey?: string;
  size?: Size;
  className?: string;
  /** Optional subtle pulse animation, e.g. for active speaking coach. */
  active?: boolean;
};

/**
 * Renders the user's coach portrait (real photoreal image from fal.ai or a
 * standard coach), falling back to the legacy emoji bubble when no portrait
 * is available yet (e.g. fresh account, generation pending).
 */
export function CoachPortrait({
  portraitUrl,
  name,
  fallbackKey = "default",
  size = "sm",
  className,
  active = false,
}: Props) {
  const sz = SIZE[size];

  if (!portraitUrl) {
    const legacySize = size === "xs" || size === "sm" ? "sm" : size === "md" ? "md" : "lg";
    return <CoachAvatar avatarKey={fallbackKey} size={legacySize} className={className} />;
  }

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full ring-primary/30",
        sz.dim,
        sz.ring,
        active && "ring-primary/70",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={portraitUrl}
        alt={name ?? "Coach"}
        className="h-full w-full object-cover"
        loading="lazy"
      />
      {active && (
        <span
          className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-primary/60 animate-pulse"
          aria-hidden
        />
      )}
    </div>
  );
}
