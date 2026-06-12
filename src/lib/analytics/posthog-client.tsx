"use client";

import * as React from "react";
import posthog from "posthog-js";
import { PostHogProvider as Provider } from "posthog-js/react";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";

let initialized = false;
function ensureInitialized() {
  if (initialized || !KEY || typeof window === "undefined") return;
  posthog.init(KEY, {
    api_host: HOST,
    capture_pageview: true,
    capture_pageleave: true,
    persistence: "localStorage+cookie",
    autocapture: false,
    person_profiles: "identified_only",
    loaded: () => {
      initialized = true;
    },
  });
  initialized = true;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    ensureInitialized();
  }, []);
  if (!KEY) return <>{children}</>;
  return <Provider client={posthog}>{children}</Provider>;
}

/** Identify the current user on the client. Call after login. */
export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  if (!KEY || typeof window === "undefined") return;
  ensureInitialized();
  posthog.identify(userId, traits);
}

/** Capture a custom event from the client. */
export function track(event: string, properties?: Record<string, unknown>) {
  if (!KEY || typeof window === "undefined") return;
  ensureInitialized();
  posthog.capture(event, properties);
}
