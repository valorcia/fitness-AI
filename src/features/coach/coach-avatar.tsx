import type { CoachPersona } from "@prisma/client";
import { cn } from "@/lib/utils";

export const AVATAR_CATALOG = [
  { key: "default", label: "Pulse", emoji: "💪", from: "#3b82f6", to: "#22d3ee" },
  { key: "zen",     label: "Zen",    emoji: "🧘", from: "#22c55e", to: "#06b6d4" },
  { key: "beast",   label: "Beast",  emoji: "🔥", from: "#ef4444", to: "#f59e0b" },
  { key: "officer", label: "Officer", emoji: "🎖️", from: "#6366f1", to: "#0ea5e9" },
  { key: "elite",   label: "Elite",  emoji: "🏆", from: "#f59e0b", to: "#f43f5e" },
];

export const PERSONA_LABEL: Record<CoachPersona, string> = {
  STRICT: "Strict",
  FUN: "Fun",
  ZEN: "Zen",
  MILITARY: "Militaire",
  ELITE: "Elite",
};

export function CoachAvatar({
  avatarKey = "default",
  name,
  size = "md",
  className,
}: {
  avatarKey?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const config = AVATAR_CATALOG.find((a) => a.key === avatarKey) ?? AVATAR_CATALOG[0]!;
  const dim = size === "sm" ? "h-10 w-10 text-lg" : size === "lg" ? "h-28 w-28 text-5xl" : "h-16 w-16 text-3xl";
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full ring-2 ring-primary/20",
          dim,
        )}
        style={{ background: `linear-gradient(135deg, ${config.from}, ${config.to})` }}
      >
        <span>{config.emoji}</span>
      </div>
      {name && (
        <div>
          <div className="text-sm font-semibold">{name}</div>
          <div className="text-xs text-muted-foreground">{config.label}</div>
        </div>
      )}
    </div>
  );
}
