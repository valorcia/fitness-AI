"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SosButton() {
  const [sending, setSending] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);

  async function trigger() {
    setSending(true);
    setStatus(null);
    try {
      const pos = await new Promise<GeolocationPosition | null>((resolve) => {
        if (!navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
          (p) => resolve(p),
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 8000 },
        );
      });
      const res = await fetch("/api/safety/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: pos?.coords.latitude ?? null,
          lng: pos?.coords.longitude ?? null,
        }),
      });
      if (res.ok) setStatus("Vos contacts ont été prévenus.");
      else {
        const body = await res.json().catch(() => ({}));
        setStatus(body.error ?? "Impossible d'envoyer le SOS.");
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        size="xl"
        variant="destructive"
        className="h-24 w-24 rounded-full text-lg"
        onClick={trigger}
        disabled={sending}
      >
        <AlertTriangle className="h-6 w-6" />
        SOS
      </Button>
      {status && <p className="text-sm text-muted-foreground">{status}</p>}
    </div>
  );
}
