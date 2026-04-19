"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Play, Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type CoachProfile = {
  id: string;
  slug: string;
  displayName: string;
  gender: string;
  ageYears: number;
  specialty: string;
  style: string;
  tagline: string;
  bio: string;
  portraitUrl: string;
  elevenLabsVoiceId?: string | null;
  openaiVoice?: string | null;
  isPremium: boolean;
};

const STYLE_LABEL: Record<string, string> = {
  MILITARY: "Militaire",
  FRIENDLY: "Bienveillant",
  EXPERT: "Expert",
};

export function CoachGallery({
  coaches,
  currentSlug,
}: {
  coaches: CoachProfile[];
  currentSlug: string | null;
}) {
  const router = useRouter();
  const [selected, setSelected] = React.useState<string | null>(currentSlug);
  const [saving, setSaving] = React.useState<string | null>(null);
  const [playing, setPlaying] = React.useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  async function preview(coach: CoachProfile) {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlaying(coach.slug);
    try {
      const res = await fetch("/api/coach/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `Salut, moi c'est ${coach.displayName.split(" ")[0]}. ${coach.tagline}`,
          openaiVoice: coach.openaiVoice ?? "nova",
          elevenLabsVoiceId: coach.elevenLabsVoiceId ?? undefined,
          emotion: "checkin",
        }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setPlaying(null);
        URL.revokeObjectURL(url);
      };
      audio.play();
    } catch {
      setPlaying(null);
    }
  }

  async function choose(coach: CoachProfile) {
    setSaving(coach.slug);
    try {
      const res = await fetch("/api/coach/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coachProfileSlug: coach.slug }),
      });
      if (res.ok) {
        setSelected(coach.slug);
        router.refresh();
      }
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {coaches.map((coach) => {
        const isSelected = selected === coach.slug;
        const isPlaying = playing === coach.slug;
        const isSaving = saving === coach.slug;
        return (
          <div
            key={coach.id}
            className={cn(
              "relative overflow-hidden rounded-2xl border bg-card transition",
              isSelected ? "border-primary ring-2 ring-primary/40" : "border-border",
            )}
          >
            <div className="relative h-56 w-full bg-muted">
              <Image
                src={coach.portraitUrl}
                alt={coach.displayName}
                fill
                sizes="(min-width:768px) 360px, 90vw"
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-base font-bold">{coach.displayName}</div>
                    <div className="text-xs opacity-80">
                      {coach.specialty} · {coach.ageYears} ans
                    </div>
                  </div>
                  {coach.isPremium && (
                    <Badge variant="outline" className="gap-1 border-amber-300 text-amber-200">
                      <Crown className="h-3 w-3" /> Premium
                    </Badge>
                  )}
                </div>
              </div>
              {isSelected && (
                <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>

            <div className="space-y-3 p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="outline">{STYLE_LABEL[coach.style] ?? coach.style}</Badge>
                <span className="text-muted-foreground">{coach.tagline}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{coach.bio}</p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => preview(coach)}
                  disabled={isPlaying}
                >
                  {isPlaying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Écouter
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => choose(coach)}
                  disabled={isSaving || isSelected}
                  className="flex-1"
                >
                  {isSaving ? "…" : isSelected ? "Sélectionné" : "Choisir"}
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
