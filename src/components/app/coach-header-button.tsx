"use client";

import Link from "next/link";
import { CoachPortrait } from "@/features/coach/coach-portrait";

type Props = {
  portraitUrl: string | null;
  coachName: string;
  fallbackKey?: string;
};

/**
 * Small pill-shaped coach avatar shown in the app header. Clicking it opens
 * the coach chat — keeping the coach one tap away from every screen.
 */
export function CoachHeaderButton({ portraitUrl, coachName, fallbackKey }: Props) {
  return (
    <Link
      href="/coach"
      title={`Discuter avec ${coachName}`}
      className="group inline-flex items-center gap-2 rounded-full border border-border/60 bg-background pl-1 pr-3 py-1 transition hover:border-primary/50 hover:bg-primary/5"
    >
      <CoachPortrait
        portraitUrl={portraitUrl}
        name={coachName}
        size="xs"
        fallbackKey={fallbackKey}
      />
      <span className="text-xs font-medium leading-none">{coachName}</span>
    </Link>
  );
}
