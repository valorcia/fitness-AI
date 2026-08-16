"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { track } from "@/lib/analytics/posthog-client";
import { PHEvent } from "@/lib/analytics/events";

const CONSENT_KEY = "cmf_consent_v1";

function setConsentCookie(value: string) {
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `cmf_consent=${value};max-age=${maxAge};path=/;SameSite=Lax`;
}

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) setVisible(true);
  }, []);

  function choose(choice: "all" | "essential") {
    localStorage.setItem(CONSENT_KEY, choice);
    setConsentCookie(choice);
    setVisible(false);
    track(PHEvent.RGPD_CONSENT_GIVEN, { choice });
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="consent"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm rounded-2xl border border-border bg-background p-5 shadow-xl"
        >
          <p className="mb-1 text-sm font-semibold text-foreground">🍪 Cookies</p>
          <p className="mb-4 text-xs text-muted-foreground leading-relaxed">
            On utilise des cookies pour améliorer l'app et analyser l'utilisation. Aucun cookie publicitaire.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => choose("essential")}
              className="flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/80"
            >
              Essentiels uniquement
            </button>
            <button
              onClick={() => choose("all")}
              className="flex-1 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700"
            >
              Tout accepter
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
