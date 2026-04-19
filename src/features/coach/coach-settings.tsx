"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { CoachPersona } from "@prisma/client";
import { AVATAR_CATALOG, CoachAvatar, PERSONA_LABEL } from "./coach-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const PERSONAS: CoachPersona[] = ["STRICT", "FUN", "ZEN", "MILITARY", "ELITE"];

export function CoachSettings({
  initial,
}: {
  initial: {
    coachPersona: CoachPersona;
    coachName: string;
    coachAvatar: string;
    voiceEnabled: boolean;
  };
}) {
  const router = useRouter();
  const [persona, setPersona] = React.useState(initial.coachPersona);
  const [name, setName] = React.useState(initial.coachName);
  const [avatar, setAvatar] = React.useState(initial.coachAvatar);
  const [voice, setVoice] = React.useState(initial.voiceEnabled);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachPersona: persona,
          coachName: name,
          coachAvatar: avatar,
          voiceEnabled: voice,
        }),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-center py-4">
        <CoachAvatar avatarKey={avatar} name={name} size="lg" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="coach-name">Nom du coach</Label>
        <Input
          id="coach-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={30}
        />
      </div>

      <div className="grid gap-2">
        <Label>Avatar</Label>
        <div className="grid grid-cols-5 gap-2">
          {AVATAR_CATALOG.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() => setAvatar(a.key)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border p-2 transition",
                avatar === a.key
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50",
              )}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                style={{ background: `linear-gradient(135deg, ${a.from}, ${a.to})` }}
              >
                {a.emoji}
              </div>
              <span className="text-[10px]">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Personnalité</Label>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          {PERSONAS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPersona(p)}
              className={cn(
                "rounded-xl border p-3 text-sm font-medium transition",
                persona === p
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-foreground hover:border-primary/50",
              )}
            >
              {PERSONA_LABEL[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
        <div>
          <div className="font-medium">Voix coach</div>
          <div className="text-xs text-muted-foreground">Lecture audio des consignes pendant les séances.</div>
        </div>
        <Switch checked={voice} onCheckedChange={setVoice} />
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </Button>
        {saved && <span className="text-sm text-emerald-400">Enregistré ✓</span>}
      </div>
    </div>
  );
}
