"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, MessageCircleMore } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CoachPortrait } from "./coach-portrait";

type Props = {
  firstName: string;
  coachName: string;
  portraitUrl: string | null;
  /** Short personalized line under the greeting. */
  message: string;
  /** Optional secondary action callout (e.g. next workout). */
  callout?: string | null;
  fallbackKey?: string;
};

/**
 * Hero card shown at the top of the dashboard. Combines the user's coach
 * portrait with a time-aware greeting and a clear CTA to open the coach chat.
 */
export function CoachGreetingCard({
  firstName,
  coachName,
  portraitUrl,
  message,
  callout,
  fallbackKey,
}: Props) {
  return (
    <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card">
      <CardContent className="flex items-start gap-4 p-5">
        <CoachPortrait
          portraitUrl={portraitUrl}
          name={coachName}
          size="lg"
          fallbackKey={fallbackKey}
        />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            {coachName} • votre coach
          </p>
          <p className="mt-1 text-xl font-bold leading-tight">
            Bonjour {firstName} <span aria-hidden>👋</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          {callout && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              {callout}
            </p>
          )}
        </div>
        <Link
          href="/coach"
          className="hidden shrink-0 self-center md:block"
          aria-label={`Discuter avec ${coachName}`}
        >
          <Button size="sm" variant="outline" className="gap-1">
            <MessageCircleMore className="h-4 w-4" />
            Discuter
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
