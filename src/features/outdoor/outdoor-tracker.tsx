"use client";

import * as React from "react";
import { Play, Square, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistance, formatDuration, formatPace } from "@/lib/utils";

type Point = { lat: number; lng: number; t: number; speed?: number | null };

function haversine(a: Point, b: Point) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function OutdoorTracker() {
  const [status, setStatus] = React.useState<"idle" | "running" | "paused">("idle");
  const [points, setPoints] = React.useState<Point[]>([]);
  const [elapsed, setElapsed] = React.useState(0);
  const watchIdRef = React.useRef<number | null>(null);
  const startTimeRef = React.useRef<number | null>(null);
  const pausedOffsetRef = React.useRef(0);
  const lastTimeRef = React.useRef<number>(0);

  const distance = React.useMemo(() => {
    let d = 0;
    for (let i = 1; i < points.length; i++) d += haversine(points[i - 1]!, points[i]!);
    return d;
  }, [points]);

  const paceSecPerKm = distance > 100 ? Math.round((elapsed / distance) * 1000) : null;

  React.useEffect(() => {
    if (status !== "running") return;
    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - (startTimeRef.current ?? Date.now())) / 1000) + pausedOffsetRef.current);
    }, 1000);
    return () => clearInterval(t);
  }, [status]);

  function start() {
    if (!navigator.geolocation) {
      alert("Géolocalisation non disponible.");
      return;
    }
    startTimeRef.current = Date.now();
    pausedOffsetRef.current = 0;
    setPoints([]);
    setElapsed(0);
    setStatus("running");
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const p: Point = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          speed: pos.coords.speed,
          t: Date.now(),
        };
        // throttle: 1 point per second max
        if (p.t - lastTimeRef.current < 1000) return;
        lastTimeRef.current = p.t;
        setPoints((prev) => [...prev, p]);
      },
      () => {
        /* ignore */
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 },
    );
  }

  function pause() {
    if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    pausedOffsetRef.current = elapsed;
    startTimeRef.current = null;
    setStatus("paused");
  }

  function resume() {
    startTimeRef.current = Date.now();
    setStatus("running");
    watchIdRef.current = navigator.geolocation.watchPosition((pos) => {
      setPoints((prev) => [
        ...prev,
        {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          speed: pos.coords.speed,
          t: Date.now(),
        },
      ]);
    });
  }

  async function stop() {
    if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
    setStatus("idle");
    if (points.length > 2) {
      await fetch("/api/outdoor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "CARDIO_RUN",
          durationSec: elapsed,
          distanceM: distance,
          points: points.map((p) => ({ lat: p.lat, lng: p.lng, recordedAt: new Date(p.t).toISOString(), speed: p.speed })),
        }),
      });
    }
  }

  const last = points[points.length - 1];

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-3 gap-3">
        <Metric label="Distance" value={formatDistance(distance)} />
        <Metric label="Durée" value={formatDuration(elapsed)} />
        <Metric label="Allure" value={formatPace(paceSecPerKm)} />
      </div>
      <div className="rounded-2xl border border-border/60 bg-secondary/40 p-4 text-sm text-muted-foreground">
        <div>
          Position :{" "}
          {last ? (
            <span>
              {last.lat.toFixed(5)}, {last.lng.toFixed(5)}
            </span>
          ) : (
            <span>— (démarrez pour capter)</span>
          )}
        </div>
        <Badge variant="outline" className="mt-2 uppercase">
          {status}
        </Badge>
        <p className="mt-3 text-xs">
          L'affichage carte (Mapbox / Leaflet) est branché côté serveur à l'API{" "}
          <code>/api/outdoor</code>. Activez la clé mapbox côté env pour le rendu visuel.
        </p>
      </div>
      <div className="flex items-center gap-2">
        {status === "idle" && (
          <Button size="lg" variant="glow" onClick={start}>
            <Play className="h-4 w-4" /> Démarrer
          </Button>
        )}
        {status === "running" && (
          <>
            <Button size="lg" variant="outline" onClick={pause}>
              <Pause className="h-4 w-4" /> Pause
            </Button>
            <Button size="lg" variant="destructive" onClick={stop}>
              <Square className="h-4 w-4" /> Stop
            </Button>
          </>
        )}
        {status === "paused" && (
          <>
            <Button size="lg" variant="default" onClick={resume}>
              <Play className="h-4 w-4" /> Reprendre
            </Button>
            <Button size="lg" variant="destructive" onClick={stop}>
              <Square className="h-4 w-4" /> Enregistrer
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 text-center">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
