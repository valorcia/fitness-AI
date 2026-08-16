"use client";

import { useState } from "react";
import { Bell, X } from "lucide-react";
import { usePush } from "./use-push";

export function PushPrompt() {
  const { state, subscribe } = usePush();
  const [dismissed, setDismissed] = useState(false);

  if (state !== "default" || dismissed) return null;

  return (
    <div className="mb-4 flex items-center gap-3 rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-900/40 dark:bg-violet-950/30">
      <Bell className="h-5 w-5 shrink-0 text-violet-600 dark:text-violet-400" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-violet-900 dark:text-violet-200">
          Active les notifications
        </p>
        <p className="text-xs text-violet-700/80 dark:text-violet-400">
          Rappels séances, hydratation, messages de ton coach.
        </p>
      </div>
      <button
        onClick={() => void subscribe()}
        className="shrink-0 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
      >
        Activer
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 text-violet-400 hover:text-violet-600"
        aria-label="Fermer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function PushToggle() {
  const { state, subscribe, unsubscribe } = usePush();

  if (state === "unsupported") return null;
  if (state === "blocked") {
    return (
      <p className="text-xs text-muted-foreground">
        Notifications bloquées. Autorise-les dans les paramètres de ton navigateur.
      </p>
    );
  }

  return (
    <button
      onClick={() => (state === "granted" ? void unsubscribe() : void subscribe())}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
        state === "granted"
          ? "bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          : "bg-violet-600 text-white hover:bg-violet-700"
      }`}
    >
      {state === "granted" ? "Désactiver les notifications" : "Activer les notifications"}
    </button>
  );
}
