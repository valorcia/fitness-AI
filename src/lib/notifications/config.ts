export type NotificationKey =
  | "water"
  | "inactivity"
  | "sleep"
  | "sessionFeedback"
  | "upcomingSession"
  | "energyCheckin"
  | "streak"
  | "weeklyRecap";

export type NotificationPrefs = { enabled: boolean } & Record<NotificationKey, boolean>;

export const NOTIFICATION_KINDS: Array<{
  key: NotificationKey;
  label: string;
  description: string;
  emoji: string;
  defaultOn: boolean;
}> = [
  {
    key: "water",
    label: "Hydratation",
    description: "Rappels réguliers pour penser à boire un verre d'eau.",
    emoji: "💧",
    defaultOn: true,
  },
  {
    key: "inactivity",
    label: "Inactivité prolongée",
    description: "Alerte douce si tu n'as pas bougé depuis 48 h.",
    emoji: "🛋️",
    defaultOn: true,
  },
  {
    key: "sleep",
    label: "Qualité du sommeil",
    description: "Check-in matinal : as-tu bien dormi ? Si non, pourquoi ?",
    emoji: "😴",
    defaultOn: true,
  },
  {
    key: "sessionFeedback",
    label: "Retour sur la séance",
    description: "Ta dernière séance s'est passée comment ? L'IA adapte la suite.",
    emoji: "🏋️",
    defaultOn: true,
  },
  {
    key: "upcomingSession",
    label: "Rappel de séance",
    description: "Notification 30 min avant chaque séance planifiée.",
    emoji: "⏰",
    defaultOn: true,
  },
  {
    key: "energyCheckin",
    label: "Énergie du jour",
    description: "Comment tu te sens ? L'IA ajuste l'intensité en conséquence.",
    emoji: "⚡",
    defaultOn: true,
  },
  {
    key: "streak",
    label: "Félicitations streak",
    description: "Message de victoire quand tu enchaînes plusieurs jours d'activité.",
    emoji: "🔥",
    defaultOn: true,
  },
  {
    key: "weeklyRecap",
    label: "Récap hebdomadaire",
    description: "Résumé de ta semaine : séances, progrès, objectifs à venir.",
    emoji: "📊",
    defaultOn: false,
  },
];

export const DEFAULT_NOTIF_PREFS: NotificationPrefs = {
  enabled: true,
  water: true,
  inactivity: true,
  sleep: true,
  sessionFeedback: true,
  upcomingSession: true,
  energyCheckin: true,
  streak: true,
  weeklyRecap: false,
};

export function parseNotifPrefs(raw: unknown): NotificationPrefs {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const getBool = (key: string, fallback: boolean) =>
    typeof obj[key] === "boolean" ? (obj[key] as boolean) : fallback;
  return {
    enabled: getBool("enabled", true),
    water: getBool("water", true),
    inactivity: getBool("inactivity", true),
    sleep: getBool("sleep", true),
    sessionFeedback: getBool("sessionFeedback", true),
    upcomingSession: getBool("upcomingSession", true),
    energyCheckin: getBool("energyCheckin", true),
    streak: getBool("streak", true),
    weeklyRecap: getBool("weeklyRecap", false),
  };
}
