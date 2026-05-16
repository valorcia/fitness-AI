"use client";

import * as React from "react";
import { Bell, BellOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  NOTIFICATION_KINDS,
  type NotificationPrefs,
} from "@/lib/notifications/config";

type Props = {
  value: NotificationPrefs;
  onChange: (v: NotificationPrefs) => void;
};

export function NotificationPreferences({ value, onChange }: Props) {
  const setEnabled = (enabled: boolean) => onChange({ ...value, enabled });
  const setKind = (key: keyof NotificationPrefs, on: boolean) =>
    onChange({ ...value, [key]: on });

  const allOff = !value.enabled;

  return (
    <div className="grid gap-4">
      {/* Master toggle */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          {allOff ? (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Bell className="h-5 w-5 text-primary" />
          )}
          <div>
            <p className="text-sm font-semibold">Activer les notifications</p>
            <p className="text-xs text-muted-foreground">
              {allOff ? "Désactivées" : "Choisissez lesquelles ci-dessous"}
            </p>
          </div>
        </div>
        <Switch
          checked={value.enabled}
          onCheckedChange={setEnabled}
          aria-label="Activer les notifications"
        />
      </div>

      {/* Persuasion message when disabled */}
      {allOff && (
        <div className="rounded-xl border border-amber-400/40 bg-amber-50 dark:bg-amber-950/20 p-4 text-sm text-amber-800 dark:text-amber-300">
          <p className="font-semibold">Les notifications font vraiment la différence.</p>
          <p className="mt-1 leading-relaxed opacity-90">
            Boire plus, mieux dormir, ne pas lâcher après une semaine chargée — ce sont
            de petits rappels, mais ils changent les habitudes. Vous pouvez les modifier
            à tout moment depuis vos paramètres.
          </p>
        </div>
      )}

      {/* Per-kind toggles */}
      {!allOff && (
        <div className="grid gap-2">
          {NOTIFICATION_KINDS.map((kind) => {
            const active = value[kind.key] as boolean;
            return (
              <div
                key={kind.key}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-4 py-3 transition",
                  active ? "border-border bg-card" : "border-border/50 bg-muted/30 opacity-60",
                )}
              >
                <Label
                  htmlFor={`notif-${kind.key}`}
                  className="flex cursor-pointer items-center gap-3 text-sm"
                >
                  <span className="text-base">{kind.emoji}</span>
                  <div>
                    <span className="font-medium">{kind.label}</span>
                    <p className="text-xs text-muted-foreground">{kind.description}</p>
                  </div>
                </Label>
                <Switch
                  id={`notif-${kind.key}`}
                  checked={active}
                  onCheckedChange={(v) => setKind(kind.key, v)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
