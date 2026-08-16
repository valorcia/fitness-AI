"use client";

import { useState, useEffect, useCallback } from "react";
import { track } from "@/lib/analytics/posthog-client";
import { PHEvent } from "@/lib/analytics/events";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

type PushState = "unsupported" | "blocked" | "granted" | "default";

export function usePush() {
  const [state, setState] = useState<PushState>("default");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    navigator.permissions.query({ name: "notifications" }).then((perm) => {
      if (perm.state === "denied") setState("blocked");
      else if (perm.state === "granted") setState("granted");
      else setState("default");
    });
  }, []);

  const subscribe = useCallback(async () => {
    setError(null);
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      setError("Les notifications ne sont pas encore configurées sur ce serveur.");
      return;
    }

    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const existing = await registration.pushManager.getSubscription();
      if (existing) await existing.unsubscribe();

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
      });

      const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
      if (!res.ok) throw new Error("Erreur lors de l'enregistrement de l'abonnement.");

      setState("granted");
      track(PHEvent.PUSH_PERMISSION_GRANTED);
    } catch (e) {
      if (e instanceof Error && e.name === "NotAllowedError") {
        setState("blocked");
      } else {
        setError(e instanceof Error ? e.message : "Impossible d'activer les notifications.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      if (!reg) return;
      const sub = await reg.pushManager.getSubscription();
      if (!sub) return;
      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      await sub.unsubscribe();
      setState("default");
      track(PHEvent.NOTIFICATION_TOGGLED, { enabled: false });
    } finally {
      setLoading(false);
    }
  }, []);

  return { state, loading, error, subscribe, unsubscribe };
}
