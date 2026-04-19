"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const KINDS = [
  { key: "NOTE", label: "Note" },
  { key: "WORKOUT", label: "Séance" },
  { key: "RUN", label: "Course" },
  { key: "ACHIEVEMENT", label: "Exploit" },
  { key: "PHOTO", label: "Photo" },
] as const;

export function CommunityComposer() {
  const router = useRouter();
  const [kind, setKind] = React.useState<(typeof KINDS)[number]["key"]>("NOTE");
  const [content, setContent] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit() {
    if (!content.trim() || pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, content }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Publication impossible.");
      }
      setContent("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardContent className="grid gap-3 p-4">
        <div className="flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <button
              key={k.key}
              type="button"
              onClick={() => setKind(k.key)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                kind === k.key
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Quoi de neuf ? Nouveau PR, série dingue, 10km bouclé…"
          rows={3}
          maxLength={600}
          className="w-full resize-none rounded-xl border border-input bg-background/60 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {error && (
          <p className="rounded border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
            {error}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            <Sparkles className="mr-1 inline h-3 w-3" />
            Partagé avec toute la communauté
          </span>
          <Button onClick={submit} disabled={pending || !content.trim()} size="sm">
            <Send className="h-4 w-4" /> Publier
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
