"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import { NotificationPreferences } from "./notification-preferences";
import { parseNotifPrefs, type NotificationPrefs } from "@/lib/notifications/config";

type Props = { initial: unknown };

type SaveStatus = "idle" | "saving" | "saved";

export function NotificationSettings({ initial }: Props) {
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
