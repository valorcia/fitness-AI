"use client";

import { Bell, BellOff, X } from "lucide-react";
import { useState } from "react";
import { usePush } from "./use-push";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function PushPrompt() {
  const { state, loading, subscribe } = usePush();
  const [dismissed, setDismissed] = useState(false);

  if (state === "unsupported" || state === "granted" || state === "blocked" || dismissed) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex items-start gap-3 p-4">
        <Bell className="mt-0.5 size-5 shrink-0 text-primary" />
        <div className="flex-1">
          <p className="text-sm font-medium">Active les notifications</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Reçois tes rappels d&apos;hydratation, de séance et les messages de ton coach — directement sur ton téléphone.
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" disabled={loading} onClick={subscribe}>
              {loading ? "En cours…" : "Activer"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setDismissed(true)}>
              Plus tard
            </Button>
          </div>
        </div>
        <button
          className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground"
          onClick={() => setDismissed(true)}
        >
          <X className="size-4" />
        </button>
      </CardContent>
    </Card>
  );
}

export function PushToggle() {
  const { state, loading, subscribe, unsubscribe } = usePush();

  if (state === "unsupported") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <BellOff className="size-4" />
        <span>Notifications non supportées sur cet appareil</span>
      </div>
    );
  }

  if (state === "blocked") {
    return (
      <div className="text-sm text-muted-foreground">
        <BellOff className="mr-1 inline size-4" />
        Notifications bloquées — active-les dans les paramètres de ton navigateur
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant={state === "granted" ? "outline" : "default"}
      disabled={loading}
      onClick={state === "granted" ? unsubscribe : subscribe}
    >
      <Bell className="mr-1.5 size-4" />
      {loading ? "…" : state === "granted" ? "Désactiver les notifications" : "Activer les notifications"}
    </Button>
  );
}
