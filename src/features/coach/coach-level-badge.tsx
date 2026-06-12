import { COACH_LEVELS, type CoachLevelInfo } from "@/lib/coach/level";
import { cn } from "@/lib/utils";

type Props = {
  info: CoachLevelInfo;
  className?: string;
  /** Compact = pill only, full = pill + label + progress bar. */
  variant?: "compact" | "full";
};

const TONE: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  2: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30",
  3: "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30",
  4: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  5: "bg-gradient-to-r from-amber-400/20 via-yellow-400/20 to-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40",
};

export function CoachLevelBadge({ info, className, variant = "compact" }: Props) {
  const meta = COACH_LEVELS[info.level];

  if (variant === "compact") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
          TONE[info.level],
          className,
        )}
        title={meta.description}
      >
        <span>{meta.emoji}</span>
        <span>Niv. {info.level} · {meta.label}</span>
      </span>
    );
  }

  return (
    <div className={cn("rounded-2xl border bg-card p-4", TONE[info.level], className)}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{meta.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
              Niveau {info.level}
            </p>
            <p className="text-base font-bold">{meta.label}</p>
          </div>
          <p className="mt-1 text-xs leading-snug opacity-90">{meta.description}</p>
          {info.level < 5 && (
            <div className="mt-3">
              <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider opacity-70">
                <span>Vers Niv. {info.level + 1}</span>
                <span>{info.progressPercent}%</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-current/10">
                <div
                  className="h-full rounded-full bg-current/60 transition-all"
                  style={{ width: `${info.progressPercent}%` }}
                />
              </div>
              {meta.nextHint && (
                <p className="mt-2 text-[11px] opacity-75">{meta.nextHint}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
