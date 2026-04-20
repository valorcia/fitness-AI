import * as React from "react";
import { cn } from "@/lib/utils";

type RingSpec = {
  label: string;
  unit: string;
  value: number;
  target: number;
  from: string;
  to: string;
};

type Props = {
  move: { value: number; target: number };       // kcal
  exercise: { value: number; target: number };   // minutes active
  stand: { value: number; target: number };      // séances / réveils actifs
  className?: string;
};

function Ring({
  spec,
  index,
  radius,
  stroke,
  gap,
}: {
  spec: RingSpec;
  index: number;
  radius: number;
  stroke: number;
  gap: number;
}) {
  const r = radius - index * (stroke + gap);
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, spec.target === 0 ? 0 : spec.value / spec.target);
  const dash = `${c * pct} ${c}`;
  const id = `ring-${index}`;
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={spec.from} />
          <stop offset="100%" stopColor={spec.to} />
        </linearGradient>
      </defs>
      <circle cx="0" cy="0" r={r} stroke="currentColor" strokeOpacity="0.12" strokeWidth={stroke} fill="none" />
      <circle
        cx="0"
        cy="0"
        r={r}
        stroke={`url(#${id})`}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={dash}
        fill="none"
        transform="rotate(-90)"
      />
    </>
  );
}

export function ActivityRings({ move, exercise, stand, className }: Props) {
  const rings: RingSpec[] = [
    { label: "Mouvement", unit: "kcal", value: move.value, target: move.target, from: "#EF4444", to: "#F97316" },
    { label: "Activité", unit: "min", value: exercise.value, target: exercise.target, from: "#14B8A6", to: "#22D3EE" },
    { label: "Séances", unit: "", value: stand.value, target: stand.target, from: "#8B5CF6", to: "#EC4899" },
  ];
  return (
    <div className={cn("flex items-center gap-5 text-foreground", className)}>
      <svg viewBox="-80 -80 160 160" width="140" height="140" aria-hidden>
        <g>
          {rings.map((spec, i) => (
            <Ring key={spec.label} spec={spec} index={i} radius={70} stroke={14} gap={3} />
          ))}
        </g>
      </svg>
      <ul className="space-y-2 text-sm">
        {rings.map((r) => {
          const pct = r.target === 0 ? 0 : Math.round((r.value / r.target) * 100);
          return (
            <li key={r.label} className="flex items-baseline gap-3">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: `linear-gradient(135deg, ${r.from}, ${r.to})` }}
              />
              <div>
                <div className="font-semibold">
                  {Math.round(r.value)} {r.unit && <span className="text-xs font-normal text-muted-foreground">{r.unit}</span>}
                </div>
                <div className="text-xs text-muted-foreground">
                  {r.label} · {pct}%
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
