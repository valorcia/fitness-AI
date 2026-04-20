import type { DeviceProvider } from "@prisma/client";

export type DeviceCapability =
  | "weight"
  | "body_composition"
  | "heart_rate"
  | "hrv"
  | "sleep"
  | "steps"
  | "workout"
  | "vo2_max"
  | "readiness"
  | "blood_pressure"
  | "spo2";

export type DeviceProviderMeta = {
  provider: DeviceProvider;
  label: string;
  tagline: string;
  logo: string;
  color: string;
  capabilities: DeviceCapability[];
  integrationMode: "oauth" | "terra" | "native" | "manual";
  disabledReason?: string;
};

/**
 * OAuth flows are scaffolded. They activate as soon as the corresponding
 * env vars are present (e.g. GARMIN_CLIENT_ID, WITHINGS_CLIENT_ID,
 * TERRA_API_KEY …). Before that, each card exposes a "manual sync" fallback.
 */
export const DEVICE_CATALOG: DeviceProviderMeta[] = [
  {
    provider: "GARMIN",
    label: "Garmin",
    tagline: "Montres & cardio-fréquencemètres. VO2max, sommeil, FC.",
    logo: "https://cdn.simpleicons.org/garmin",
    color: "#007CC3",
    capabilities: ["heart_rate", "hrv", "sleep", "steps", "workout", "vo2_max"],
    integrationMode: "oauth",
  },
  {
    provider: "FITBIT",
    label: "Fitbit",
    tagline: "Activité, sommeil, fréquence cardiaque.",
    logo: "https://cdn.simpleicons.org/fitbit",
    color: "#00B0B9",
    capabilities: ["heart_rate", "sleep", "steps", "workout"],
    integrationMode: "oauth",
  },
  {
    provider: "OURA",
    label: "Oura Ring",
    tagline: "Sommeil, HRV, readiness.",
    logo: "https://cdn.simpleicons.org/oura",
    color: "#1E1E1E",
    capabilities: ["sleep", "hrv", "readiness", "heart_rate"],
    integrationMode: "oauth",
  },
  {
    provider: "WITHINGS",
    label: "Withings",
    tagline: "Balance, tension artérielle, sommeil.",
    logo: "https://cdn.simpleicons.org/withings",
    color: "#009999",
    capabilities: ["weight", "body_composition", "blood_pressure", "heart_rate", "sleep"],
    integrationMode: "oauth",
  },
  {
    provider: "POLAR",
    label: "Polar",
    tagline: "Montres FC, Flow, entraînements.",
    logo: "https://cdn.simpleicons.org/polar",
    color: "#D50029",
    capabilities: ["heart_rate", "hrv", "workout", "sleep", "vo2_max"],
    integrationMode: "oauth",
  },
  {
    provider: "STRAVA",
    label: "Strava",
    tagline: "Courses, vélo, activités outdoor.",
    logo: "https://cdn.simpleicons.org/strava",
    color: "#FC4C02",
    capabilities: ["workout", "heart_rate"],
    integrationMode: "oauth",
  },
  {
    provider: "APPLE_HEALTH",
    label: "Apple Santé",
    tagline: "Activité, FC, sommeil via HealthKit (app mobile).",
    logo: "https://cdn.simpleicons.org/apple",
    color: "#000000",
    capabilities: ["heart_rate", "sleep", "steps", "workout", "weight"],
    integrationMode: "native",
    disabledReason: "Disponible dans l'app iOS — à venir",
  },
  {
    provider: "GOOGLE_FIT",
    label: "Google Fit / Health Connect",
    tagline: "Activité Android via Health Connect.",
    logo: "https://cdn.simpleicons.org/googlefit",
    color: "#4285F4",
    capabilities: ["heart_rate", "sleep", "steps", "workout"],
    integrationMode: "native",
    disabledReason: "Disponible dans l'app Android — à venir",
  },
  {
    provider: "TERRA",
    label: "Terra (tout-en-un)",
    tagline: "30+ appareils via un seul OAuth (recommandé MVP).",
    logo: "https://tryterra.co/favicon.ico",
    color: "#111827",
    capabilities: [
      "heart_rate",
      "hrv",
      "sleep",
      "steps",
      "workout",
      "vo2_max",
      "readiness",
      "weight",
    ],
    integrationMode: "terra",
  },
  {
    provider: "MANUAL",
    label: "Saisie manuelle",
    tagline: "Poids, sommeil, pas — toujours disponible.",
    logo: "/coachme-mark.svg",
    color: "#14B8A6",
    capabilities: ["weight", "sleep", "steps", "blood_pressure"],
    integrationMode: "manual",
  },
];
