import webpush from "web-push";
import { env } from "@/lib/env";

let configured = false;

export function configurePush() {
  if (configured || !env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) return;
  webpush.setVapidDetails(
    env.VAPID_SUBJECT,
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY,
  );
  configured = true;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

export async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload,
): Promise<boolean> {
  configurePush();
  try {
    await webpush.sendNotification(
      { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
      JSON.stringify(payload),
    );
    return true;
  } catch (err: unknown) {
    const status = (err as { statusCode?: number })?.statusCode;
    if (status === 404 || status === 410) return false; // stale subscription
    throw err;
  }
}

export const PUSH_TEMPLATES = {
  hydration: (): PushPayload => ({
    title: "💧 Rappel hydratation",
    body: "Tu as atteint ton objectif d'eau aujourd'hui ?",
    url: "/dashboard",
    tag: "hydration",
  }),
  inactivity: (name: string): PushPayload => ({
    title: `🏃 ${name} t'attend !`,
    body: "Ça fait 2 jours sans séance. On reprend ?",
    url: "/workouts",
    tag: "inactivity",
  }),
  sleepCheck: (): PushPayload => ({
    title: "😴 Comment tu as dormi ?",
    body: "Note ton sommeil pour optimiser ta récupération.",
    url: "/dashboard",
    tag: "sleep",
  }),
  sessionFeedback: (): PushPayload => ({
    title: "🔥 Super séance !",
    body: "Comment tu te sens ? Donne ton ressenti.",
    url: "/workouts",
    tag: "feedback",
  }),
  streakReminder: (streak: number): PushPayload => ({
    title: `🔥 Série de ${streak} jours !`,
    body: "Ne laisse pas tomber ta série ! Fais au moins 10 min aujourd'hui.",
    url: "/workouts",
    tag: "streak",
  }),
  weeklyGoal: (pct: number): PushPayload => ({
    title: "📊 Bilan de la semaine",
    body: `Tu as atteint ${pct}% de ton objectif hebdo. Continue !`,
    url: "/dashboard",
    tag: "weekly",
  }),
  coachMessage: (coachName: string, msg: string): PushPayload => ({
    title: `💬 Message de ${coachName}`,
    body: msg,
    url: "/coach",
    tag: "coach",
  }),
  planReady: (): PushPayload => ({
    title: "📅 Ton plan est prêt !",
    body: "Ton coach a créé un nouveau programme personnalisé.",
    url: "/planning",
    tag: "plan",
  }),
};
