import webpush from "web-push";
import { env } from "@/lib/env";

let _configured = false;

export function configurePush() {
  if (_configured) return;
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) return;
  webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
  _configured = true;
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  data?: Record<string, unknown>;
}

export async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload,
): Promise<boolean> {
  configurePush();
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) return false;

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify({
        ...payload,
        icon: payload.icon ?? "/icons/icon-192.png",
        badge: payload.badge ?? "/icons/badge-72.png",
      }),
    );
    return true;
  } catch (err: unknown) {
    const status = (err as { statusCode?: number }).statusCode;
    // 404/410 means subscription is gone — caller should delete it
    if (status === 404 || status === 410) return false;
    console.error("[WebPush]", err);
    return false;
  }
}

// Notification templates for the 8 supported types
export const PUSH_TEMPLATES = {
  hydration: (): PushPayload => ({
    title: "Coachmii-fit 💧",
    body: "N'oublie pas de boire un verre d'eau !",
    tag: "hydration",
    url: "/hydration",
  }),
  inactivity: (days: number): PushPayload => ({
    title: "Coachmii-fit 🏃",
    body: `Ça fait ${days} jours sans séance. Ton coach t'attend !`,
    tag: "inactivity",
    url: "/dashboard",
  }),
  sleepCheck: (): PushPayload => ({
    title: "Coachmii-fit 😴",
    body: "Comment as-tu dormi cette nuit ?",
    tag: "sleep-check",
    url: "/sleep",
  }),
  sessionFeedback: (workoutType: string): PushPayload => ({
    title: "Coachmii-fit 💪",
    body: `Ta séance ${workoutType} s'est bien passée ?`,
    tag: "session-feedback",
    url: "/workouts",
  }),
  streakReminder: (streak: number): PushPayload => ({
    title: `Coachmii-fit 🔥 ${streak} jours !`,
    body: "Ne brise pas ta série — une courte séance compte !",
    tag: "streak",
    url: "/dashboard",
  }),
  weeklyGoal: (percent: number): PushPayload => ({
    title: "Coachmii-fit 🎯",
    body: `Tu es à ${percent}% de ton objectif hebdo. Allez !`,
    tag: "weekly-goal",
    url: "/progression",
  }),
  coachMessage: (coach: string, msg: string): PushPayload => ({
    title: `Message de ${coach} 🤖`,
    body: msg,
    tag: "coach-message",
    url: "/coach",
  }),
  planReady: (): PushPayload => ({
    title: "Coachmii-fit ✨",
    body: "Ton nouveau programme est prêt !",
    tag: "plan-ready",
    url: "/planning",
  }),
};
