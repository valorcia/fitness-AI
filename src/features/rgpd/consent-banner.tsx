"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/posthog-client";
import { PHEvent } from "@/lib/analytics/events";

const CONSENT_KEY = "cmf_consent_v1";

type ConsentChoice = "all" | "essential";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show once per browser
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) setVisible(true);
  }, []);

  const accept = (choice: ConsentChoice) => {
    localStorage.setItem(CONSENT_KEY, choice);
    // Write a first-party cookie so the server can read it too
    document.cookie = `cmf_consent=${choice};max-age=${60 * 60 * 24 * 365};path=/;SameSite=Lax`;
    track(PHEvent.RGPD_CONSENT_GIVEN, { choice });
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl rounded-2xl border bg-background/95 p-4 shadow-2xl backdrop-blur-md md:bottom-6 md:left-auto md:right-6 md:max-w-md"
        >
          <div className="flex gap-3">
            <Shield className="mt-0.5 size-5 shrink-0 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Tes données, ton contrôle 🔒</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Coachmii-fit utilise des cookies essentiels pour ton compte, et des cookies d&apos;analyse (PostHog, Sentry) pour améliorer l&apos;application. Tes données de santé sont chiffrées et ne sont jamais vendues.{" "}
                <Link href="/rgpd" className="underline">
                  En savoir plus
                </Link>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => accept("all")} className="text-xs">
                  Tout accepter
                </Button>
                <Button size="sm" variant="outline" onClick={() => accept("essential")} className="text-xs">
                  Essentiels uniquement
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
