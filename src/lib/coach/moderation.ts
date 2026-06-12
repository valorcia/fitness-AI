import OpenAI from "openai";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

const client = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

export type ModerationVerdict =
  | { ok: true }
  | {
      ok: false;
      reason: "self_harm" | "violence" | "sexual" | "hate" | "other";
      /** Pre-written reply to surface back to the user instead of calling Claude. */
      message: string;
    };

const SELF_HARM_MESSAGE = `Je vois que tu traverses quelque chose de difficile. Je suis ton coach sport, je ne suis pas formé pour t'accompagner sur ces sujets — mais des personnes le sont, 24h/24, sans jugement.

🇫🇷 **3114** — numéro national de prévention du suicide (gratuit, anonyme)
🚨 **112** ou **15** — urgence vitale

Tu n'es pas seul·e. Appelle, parle. On reprendra l'entraînement quand tu seras prêt·e.`;

const VIOLENCE_MESSAGE =
  "Désolé, je ne peux pas répondre à ça. Je suis là pour t'aider à progresser en sport. On parle de ton prochain entraînement ?";

const SEXUAL_MESSAGE =
  "Je suis ton coach sportif — restons sur ces sujets. De quoi as-tu envie de parler côté entraînement ?";

const HATE_MESSAGE =
  "Je préfère qu'on reste dans un échange constructif. On parle plutôt de ton sport ?";

const OTHER_MESSAGE =
  "Désolé, je ne peux pas traiter cette demande. Tu peux la reformuler ?";

/**
 * Runs OpenAI's free Moderation API on user input before sending to Claude.
 *
 * Behaviour:
 *   - self_harm → blocking, returns the suicide prevention helpline message
 *     (FR 3114 + emergency 112/15). DOES NOT call Claude.
 *   - violence / hate / sexual / sexual/minors → blocking, polite redirect.
 *   - all other / unflagged → passes through (ok: true).
 *   - on API failure → fail open (ok: true). Never block due to infra issues.
 *
 * Cost: 0 € — OpenAI Moderation is free.
 */
export async function moderateUserInput(text: string): Promise<ModerationVerdict> {
  if (!client) return { ok: true };
  if (!text || text.trim().length < 3) return { ok: true };

  try {
    const res = await client.moderations.create({
      model: "omni-moderation-latest",
      input: text.slice(0, 4000),
    });
    const result = res.results[0];
    if (!result?.flagged) return { ok: true };

    const cats = result.categories as unknown as Record<string, boolean>;

    // ── Priority 1: self-harm / suicide ──
    if (
      cats["self-harm"] ||
      cats["self-harm/intent"] ||
      cats["self-harm/instructions"]
    ) {
      logger.warn("moderation_self_harm_detected", { textLen: text.length });
      return { ok: false, reason: "self_harm", message: SELF_HARM_MESSAGE };
    }

    // ── Priority 2: minors / illegal sexual ──
    if (cats["sexual/minors"]) {
      logger.warn("moderation_blocked_minors");
      return { ok: false, reason: "sexual", message: SEXUAL_MESSAGE };
    }

    // ── Priority 3: violence ──
    if (cats.violence || cats["violence/graphic"]) {
      return { ok: false, reason: "violence", message: VIOLENCE_MESSAGE };
    }

    // ── Priority 4: hate / harassment ──
    if (cats.hate || cats["hate/threatening"] || cats.harassment || cats["harassment/threatening"]) {
      return { ok: false, reason: "hate", message: HATE_MESSAGE };
    }

    // ── Priority 5: sexual content ──
    if (cats.sexual) {
      return { ok: false, reason: "sexual", message: SEXUAL_MESSAGE };
    }

    return { ok: false, reason: "other", message: OTHER_MESSAGE };
  } catch (e) {
    // Fail open — never block legitimate users because moderation API is down.
    logger.warn("moderation_api_failed_fail_open", {
      error: e instanceof Error ? e.message : String(e),
    });
    return { ok: true };
  }
}
