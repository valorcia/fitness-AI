"use client";

import * as React from "react";
import { Brain, Check, Loader2, Plus, Trash2, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Memory = {
  id: string;
  kind: string;
  content: string;
  weight: number;
  source: string | null;
  createdAt: string;
};

type Props = {
  initial: Memory[];
  coachName: string;
};

const KIND_LABEL: Record<string, { label: string; emoji: string }> = {
  injury: { label: "Blessure", emoji: "🩹" },
  goal: { label: "Objectif", emoji: "🎯" },
  preference: { label: "Préférence", emoji: "💛" },
  life_event: { label: "Événement de vie", emoji: "🌱" },
  perf_record: { label: "Record", emoji: "🏅" },
  win: { label: "Victoire", emoji: "🔥" },
  loss: { label: "Échec assumé", emoji: "🫂" },
  conversation: { label: "Note", emoji: "💬" },
};

const KIND_OPTIONS = Object.entries(KIND_LABEL).map(([key, v]) => ({ value: key, ...v }));

export function MemoriesList({ initial, coachName }: Props) {
  const [memories, setMemories] = React.useState<Memory[]>(initial);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");
  const [busy, setBusy] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);
  const [newKind, setNewKind] = React.useState<string>("preference");
  const [newContent, setNewContent] = React.useState("");

  const grouped = React.useMemo(() => {
    const m = new Map<string, Memory[]>();
    for (const mem of memories) {
      const arr = m.get(mem.kind) ?? [];
      arr.push(mem);
      m.set(mem.kind, arr);
    }
    return Array.from(m.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [memories]);

  const startEdit = (mem: Memory) => {
    setEditingId(mem.id);
    setDraft(mem.content);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setDraft("");
  };

  const saveEdit = async (mem: Memory) => {
    if (!draft.trim() || draft.trim().length < 5) return;
    setBusy(mem.id);
    try {
      const res = await fetch(`/api/coach/memories/${mem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft.trim() }),
      });
      if (res.ok) {
        setMemories((arr) =>
          arr.map((m) => (m.id === mem.id ? { ...m, content: draft.trim() } : m)),
        );
        cancelEdit();
      }
    } finally {
      setBusy(null);
    }
  };

  const remove = async (mem: Memory) => {
    if (!confirm(`Supprimer ce souvenir ?\n\n«${mem.content}»`)) return;
    setBusy(mem.id);
    try {
      const res = await fetch(`/api/coach/memories/${mem.id}`, { method: "DELETE" });
      if (res.ok) setMemories((arr) => arr.filter((m) => m.id !== mem.id));
    } finally {
      setBusy(null);
    }
  };

  const addMemory = async () => {
    if (!newContent.trim() || newContent.trim().length < 5) return;
    setBusy("__new__");
    try {
      const res = await fetch("/api/coach/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: newKind, content: newContent.trim(), weight: 8 }),
      });
      if (res.ok) {
        // refetch
        const list = await fetch("/api/coach/memories").then((r) => r.json());
        setMemories(list.memories ?? []);
        setAdding(false);
        setNewContent("");
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid gap-5">
      <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <Brain className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="flex-1 text-sm">
          <p className="font-semibold">Voici tout ce que {coachName} retient de toi.</p>
          <p className="mt-1 text-muted-foreground">
            Tu peux corriger, compléter ou supprimer chaque souvenir à tout moment. {coachName} utilise
            ces informations pour adapter son accompagnement.
          </p>
        </div>
      </div>

      {!adding ? (
        <Button variant="outline" className="self-start" onClick={() => setAdding(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Ajouter un souvenir
        </Button>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="grid gap-3">
            <div>
              <Label htmlFor="new-kind">Catégorie</Label>
              <Select value={newKind} onValueChange={setNewKind}>
                <SelectTrigger id="new-kind" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KIND_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.emoji} {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="new-content">Souvenir</Label>
              <Input
                id="new-content"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Ex. : J'ai mal au genou droit en course longue."
                maxLength={200}
                className="mt-1.5"
              />
              <p className="mt-1 text-xs text-muted-foreground">{newContent.length}/200</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={addMemory}
                disabled={busy !== null || newContent.trim().length < 5}
              >
                {busy === "__new__" ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-1.5 h-4 w-4" />
                )}
                Enregistrer
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setAdding(false);
                  setNewContent("");
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}

      {memories.length === 0 ? (
        <div className="flex items-start gap-3 rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <div>
            <p className="font-semibold">Aucun souvenir pour le moment.</p>
            <p className="mt-1 text-muted-foreground">
              Au fil de tes conversations et de tes séances, {coachName} va apprendre à te connaître.
              Tu peux aussi lui dire dès maintenant ce qui compte pour toi.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-5">
          {grouped.map(([kind, items]) => {
            const meta = KIND_LABEL[kind] ?? { label: kind, emoji: "💬" };
            return (
              <section key={kind} className="rounded-2xl border border-border bg-card">
                <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
                  <span className="text-lg">{meta.emoji}</span>
                  <h3 className="text-sm font-bold uppercase tracking-wide">{meta.label}</h3>
                  <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {items.length}
                  </span>
                </div>
                <ul className="divide-y divide-border/40">
                  {items.map((mem) => (
                    <li key={mem.id} className="px-4 py-3">
                      {editingId === mem.id ? (
                        <div className="grid gap-2">
                          <Input
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            maxLength={200}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => saveEdit(mem)}
                              disabled={busy === mem.id || draft.trim().length < 5}
                            >
                              {busy === mem.id ? (
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Check className="mr-1.5 h-3.5 w-3.5" />
                              )}
                              Enregistrer
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEdit}>
                              <X className="mr-1.5 h-3.5 w-3.5" />
                              Annuler
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <p
                            className={cn(
                              "min-w-0 flex-1 cursor-text text-sm leading-snug",
                              busy === mem.id && "opacity-50",
                            )}
                            onClick={() => startEdit(mem)}
                          >
                            {mem.content}
                          </p>
                          <div className="flex shrink-0 items-center gap-1.5">
                            <span
                              className={cn(
                                "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                                mem.weight >= 8
                                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                  : mem.weight >= 5
                                    ? "bg-primary/15 text-primary"
                                    : "bg-muted text-muted-foreground",
                              )}
                              title={`Importance ${mem.weight.toFixed(0)}/10`}
                            >
                              {mem.weight.toFixed(0)}
                            </span>
                            <button
                              type="button"
                              onClick={() => remove(mem)}
                              disabled={busy === mem.id}
                              className="rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              aria-label="Supprimer ce souvenir"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
