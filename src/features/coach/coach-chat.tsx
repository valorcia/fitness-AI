"use client";

import * as React from "react";
import Image from "next/image";
import { Loader2, Mic, MicOff, Send, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CoachAvatar } from "./coach-avatar";

type Msg = { role: "user" | "assistant"; content: string };

type Props = {
  coachName?: string;
  coachAvatar?: string;
  voiceEnabled?: boolean;
  openaiVoice?: string;
  elevenLabsVoiceId?: string;
  portraitUrl?: string | null;
};

export function CoachChat({
  coachName = "Pulse",
  coachAvatar = "default",
  voiceEnabled = true,
  openaiVoice,
  elevenLabsVoiceId,
  portraitUrl,
}: Props) {
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<Msg[]>([
    {
      role: "assistant",
      content: `Salut, moi c'est ${coachName}. Quel est ton objectif aujourd'hui ?`,
    },
  ]);
  const [pending, setPending] = React.useState(false);
  const [recording, setRecording] = React.useState(false);
  const [ttsLoading, setTtsLoading] = React.useState<number | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);

  async function send(content: string) {
    if (!content.trim() || pending) return;
    const next: Msg[] = [...messages, { role: "user", content: content.trim() }];
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
      if (voiceEnabled) void playVoice(buffer, messages.length + 1);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Erreur réseau." }]);
    } finally {
      setPending(false);
    }
  }

  async function playVoice(text: string, index: number) {
    if (!text.trim()) return;
    setTtsLoading(index);
    try {
      const res = await fetch("/api/coach/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          openaiVoice: openaiVoice ?? "nova",
          elevenLabsVoiceId,
          emotion: "supportive",
        }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => URL.revokeObjectURL(url);
      await audio.play();
    } catch {
      /* ignore */
    } finally {
      setTtsLoading(null);
    }
  }

  async function toggleRecording() {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }
    if (!navigator.mediaDevices) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: "audio/webm" });
        const fd = new FormData();
        fd.append("audio", blob, "input.webm");
        setPending(true);
        try {
          const res = await fetch("/api/coach/voice/transcribe", { method: "POST", body: fd });
          const body = await res.json();
          if (res.ok && body.text) {
            await send(body.text);
          }
        } finally {
          setPending(false);
        }
      };
      mediaRecorderRef.current = rec;
      rec.start();
      setRecording(true);
    } catch {
      setRecording(false);
    }
  }

  return (
    <div className="flex h-[380px] flex-col gap-3">
      <div className="flex items-center gap-2 border-b border-border/40 pb-2">
        {portraitUrl ? (
          <div className="relative h-10 w-10 overflow-hidden rounded-full">
            <Image src={portraitUrl} alt={coachName} fill sizes="40px" className="object-cover" unoptimized />
          </div>
        ) : (
          <CoachAvatar avatarKey={coachAvatar} size="sm" />
        )}
        <div className="flex-1">
          <div className="text-sm font-semibold">{coachName}</div>
          <div className="text-xs text-muted-foreground">
            {voiceEnabled ? "Voix IA réaliste activée" : "Mode texte"}
          </div>
        </div>
      </div>

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
            <div className="flex items-start justify-between gap-2">
              <span className="whitespace-pre-wrap">{m.content || "…"}</span>
              {m.role === "assistant" && voiceEnabled && m.content && (
                <button
                  type="button"
                  onClick={() => playVoice(m.content, i)}
                  className="rounded-full p-1 text-muted-foreground transition hover:bg-white/10"
                  aria-label="Écouter"
                >
                  {ttsLoading === i ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <Button
          type="button"
          size="icon"
          variant={recording ? "destructive" : "outline"}
          onClick={toggleRecording}
          disabled={pending}
          aria-label="Dicter"
        >
          {recording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Posez une question à votre coach…"
          disabled={pending || recording}
        />
        <Button size="icon" type="submit" disabled={pending || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
