"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CoachPortrait } from "./coach-portrait";

type Props = {
  portraitUrl: string | null;
  coachName: string;
  /** Current cue or motivational line. Changes trigger a fade-in animation. */
  message: string;
  fallbackKey?: string;
  /** Highlight the bubble (e.g. when the coach is "speaking" via TTS). */
  active?: boolean;
};

/**
 * Coach speech bubble displayed during a workout. The message animates
 * whenever it changes so the user notices the new cue.
 */
export function CoachCueBubble({
  portraitUrl,
  coachName,
  message,
  fallbackKey,
  active = false,
}: Props) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-3">
      <CoachPortrait
        portraitUrl={portraitUrl}
        name={coachName}
        size="sm"
        fallbackKey={fallbackKey}
        active={active}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
          {coachName}
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-0.5 text-sm leading-snug"
          >
            {message}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
