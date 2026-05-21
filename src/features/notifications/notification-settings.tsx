"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import { NotificationPreferences } from "./notification-preferences";
import { parseNotifPrefs, type NotificationPrefs } from "@/lib/notifications/config";
import { CoachPortrait } from "@/features/coach/coach-portrait";

type Props = {
  initial: unknown;
  coach?: {
    displayName: string;
    portraitUrl: string | null;
    avatarKey: string;
  };
};

type SaveStatus = "idle" | "saving" | "saved";

export function NotificationSettings({ initial, coach }: Props) {
  const [prefs, setPrefs] = React.useState<NotificationPrefs>(() => parseNotifPrefs(initial));
  const [status, setStatus] = React.useState<SaveStatus>("idle");
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (next: NotificationPrefs) => {
    setPrefs(next);
    setStatus("saving");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        await fetch("/api/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notifications: next }),
        });
        setStatus("saved");
        timerRef.current = setTimeout(() => setStatus("idle"), 2000);
      } catch {
        setStatus("idle");
      }
    }, 600);
  };

  return (
    <div className="grid gap-4">
      {coach && (
        <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-3">
          <CoachPortrait
            portraitUrl={coach.portraitUrl}
            name={coach.displayName}
            size="sm"
            fallbackKey={coach.avatarKey}
          />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              {coach.displayName}
            </p>
            <p className="mt-0.5 text-sm leading-snug">
              C'est moi qui te ferai parvenir ces rappels. Choisis ceux qui t'aident vraiment —
              tu peux changer d'avis à tout moment.
            </p>
          </div>
        </div>
      )}
      <NotificationPreferences value={prefs} onChange={handleChange} />
      {status !== "idle" && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {status === "saving" ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Check className="h-3 w-3 text-green-500" />
          )}
          {status === "saving" ? "Enregistrement…" : "Préférences enregistrées"}
        </p>
      )}
    </div>
  );
}
