"use client";

import { useState } from "react";
import { Bell, Loader2, X } from "lucide-react";
import { usePush } from "./use-push";

export function PushPrompt() {
  const { state, loading, error, subscribe } = usePush();
  const [dismissed, setDismissed] = useState(false);

  if (state !== "default" || dismissed) return null;

  return (
    <div className="mb-4 flex flex-col gap-2 rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-900/40 dark:bg-violet-950/30">
      <div className="flex items-center gap-3">
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
          disabled={loading}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          {loading ? "Activation…" : "Activer"}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 text-violet-400 hover:text-violet-600"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {error ? (
        <p className="pl-8 text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}

export function PushToggle() {
  const { state, loading, error, subscribe, unsubscribe } = usePush();

  if (state === "unsupported") return null;
  if (state === "blocked") {
    return (
      <p className="text-xs text-muted-foreground">
        Notifications bloquées. Autorise-les dans les paramètres de ton navigateur.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        disabled={loading}
        onClick={() => (state === "granted" ? void unsubscribe() : void subscribe())}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
          state === "granted"
            ? "bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            : "bg-violet-600 text-white hover:bg-violet-700"
        }`}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {state === "granted" ? "Désactiver les notifications" : "Activer les notifications"}
      </button>
      {error ? <p className="text-xs text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  );
}
