"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import type { PHEventName } from "./events";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
      person_profiles: "identified_only",
      autocapture: false,
      capture_pageview: true,
      capture_pageleave: true,
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  posthog.identify(userId, traits);
}

export function track(event: PHEventName, properties?: Record<string, unknown>) {
  posthog.capture(event, properties);
}
