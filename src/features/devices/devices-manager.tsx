"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, PlugZap, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { DeviceProvider } from "@prisma/client";
import type { DeviceProviderMeta } from "@/lib/devices/catalog";

type Connection = {
  id: string;
  provider: DeviceProvider;
  status: string;
  lastSyncAt: string | null;
};

export function DevicesManager({
  catalog,
  connections: initialConnections,
  existingProviders,
}: {
  catalog: DeviceProviderMeta[];
  connections: Connection[];
  existingProviders: DeviceProvider[];
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<DeviceProvider | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);
  const [connections, setConnections] = React.useState(initialConnections);
  const connected = new Set(existingProviders);

  async function connect(provider: DeviceProvider) {
    setBusy(provider);
    setInfo(null);
    try {
      const res = await fetch(`/api/devices/connect/${provider.toLowerCase()}`, {
        method: "POST",
      });
      const body = await res.json();
      if (res.status === 501) {
        setInfo(body.error ?? "Intégration non configurée — ajoutez la clé correspondante.");
      } else if (body.authorizeUrl) {
        window.location.href = body.authorizeUrl;
      } else if (body.widgetUrl) {
        window.open(body.widgetUrl, "_blank", "noopener,noreferrer");
      } else if (body.ok) {
        setInfo(`${provider} activé en mode manuel.`);
        router.refresh();
      }
    } catch {
      setInfo("Erreur réseau.");
    } finally {
      setBusy(null);
    }
  }

  async function disconnect(id: string) {
    setBusy("TERRA");
    try {
      await fetch(`/api/devices/${id}`, { method: "DELETE" });
      setConnections((list) => list.filter((c) => c.id !== id));
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-5">
      {info && (
        <div className="rounded-xl border border-amber-400/40 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          {info}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {catalog.map((p) => {
          const isConnected = connected.has(p.provider);
          const conn = connections.find((c) => c.provider === p.provider);
          return (
            <div
              key={p.provider}
              className={cn(
                "group flex items-center gap-4 rounded-2xl border bg-card p-4 transition",
                isConnected ? "border-primary/40" : "border-border hover:border-primary/40",
              )}
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted"
                style={{ background: `${p.color}14`, color: p.color }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.logo} alt="" className="h-7 w-7 object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="truncate text-base font-semibold">{p.label}</div>
                  {isConnected && (
                    <Badge variant="success" className="gap-1">
                      <Check className="h-3 w-3" /> Connecté
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{p.tagline}</p>
                <div className="mt-1 flex flex-wrap gap-1 text-[10px] uppercase text-muted-foreground">
                  {p.capabilities.slice(0, 4).map((c) => (
                    <span key={c} className="rounded-full bg-muted px-1.5 py-0.5">
                      {c.replace("_", " ")}
                    </span>
                  ))}
                </div>
                {p.disabledReason && !isConnected && (
                  <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
                    {p.disabledReason}
                  </p>
                )}
                {conn?.lastSyncAt && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Dernière sync : {new Date(conn.lastSyncAt).toLocaleString("fr-FR")}
                  </p>
                )}
              </div>
              {isConnected && conn ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => disconnect(conn.id)}
                  disabled={busy === p.provider}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Déconnecter
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => connect(p.provider)}
                  disabled={busy === p.provider || Boolean(p.disabledReason)}
                >
                  {busy === p.provider ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <PlugZap className="h-4 w-4" />
                  )}
                  Connecter
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <ManualEntry />
    </div>
  );
}

function ManualEntry() {
  const router = useRouter();
  const [weight, setWeight] = React.useState("");
  const [sleep, setSleep] = React.useState("");
  const [steps, setSteps] = React.useState("");
  const [saving, setSaving] = React.useState<"weight" | "sleep" | "steps" | null>(null);

  async function save(kind: "WEIGHT" | "SLEEP" | "STEPS", value: string, unit: string) {
    const num = Number(value);
    if (!Number.isFinite(num) || num <= 0) return;
    setSaving(kind.toLowerCase() as never);
    try {
      await fetch("/api/devices/readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, value: num, unit, provider: "MANUAL" }),
      });
      if (kind === "WEIGHT") setWeight("");
      if (kind === "SLEEP") setSleep("");
      if (kind === "STEPS") setSteps("");
      router.refresh();
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-2 font-semibold">
        <PlugZap className="h-4 w-4 text-primary" /> Saisie rapide (sans appareil)
      </div>
      <p className="text-xs text-muted-foreground">
        En attendant de connecter votre balance ou votre montre, saisissez vos données ici.
      </p>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <div>
          <Label>Poids (kg)</Label>
          <div className="mt-1 flex gap-2">
            <Input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
            <Button onClick={() => save("WEIGHT", weight, "kg")} disabled={saving === "weight"}>
              +
            </Button>
          </div>
        </div>
        <div>
          <Label>Sommeil (min)</Label>
          <div className="mt-1 flex gap-2">
            <Input
              type="number"
              value={sleep}
              onChange={(e) => setSleep(e.target.value)}
            />
            <Button onClick={() => save("SLEEP", sleep, "min")} disabled={saving === "sleep"}>
              +
            </Button>
          </div>
        </div>
        <div>
          <Label>Pas du jour</Label>
          <div className="mt-1 flex gap-2">
            <Input
              type="number"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
            />
            <Button onClick={() => save("STEPS", steps, "count")} disabled={saving === "steps"}>
              +
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
