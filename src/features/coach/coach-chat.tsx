"use client";

import * as React from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

export function CoachChat() {
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<Msg[]>([
    {
      role: "assistant",
      content: "Je suis votre coach. Quel est votre objectif aujourd'hui ?",
    },
  ]);
  const [pending, setPending] = React.useState(false);

  async function send() {
    if (!input.trim() || pending) return;
    const next: Msg[] = [...messages, { role: "user", content: input.trim() }];
    setMessages(next);
    setInput("");
    setPending(true);
    try {
      const res = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({}));
        setMessages((m) => [
          ...m,
          { role: "assistant", content: body.error ?? "Coach indisponible." },
        ]);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = m.slice();
          copy[copy.length - 1] = { role: "assistant", content: buffer };
          return copy;
        });
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Erreur réseau." }]);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex h-[320px] flex-col gap-3">
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[90%] rounded-2xl px-3 py-2 text-sm",
              m.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "mr-auto bg-secondary text-secondary-foreground",
            )}
          >
            {m.role === "assistant" && (
              <Sparkles className="mr-1 inline h-3.5 w-3.5 text-primary" />
            )}
            <span className="whitespace-pre-wrap">{m.content || "…"}</span>
          </div>
        ))}
      </div>
      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Posez une question à votre coach…"
          disabled={pending}
        />
        <Button size="icon" type="submit" disabled={pending || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
