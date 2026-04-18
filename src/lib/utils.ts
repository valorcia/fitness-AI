import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

export function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = h ? [h, m, s] : [m, s];
  return parts.map((n) => String(n).padStart(2, "0")).join(":");
}

export function formatPace(secondsPerKm: number | null | undefined) {
  if (!secondsPerKm || !Number.isFinite(secondsPerKm)) return "—";
  const m = Math.floor(secondsPerKm / 60);
  const s = Math.floor(secondsPerKm % 60);
  return `${m}'${String(s).padStart(2, "0")}"/km`;
}

export function bmrMifflinStJeor(params: {
  weightKg: number;
  heightCm: number;
  ageYears: number;
  sex: "MALE" | "FEMALE" | "OTHER";
}) {
  const { weightKg, heightCm, ageYears, sex } = params;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return sex === "MALE" ? base + 5 : base - 161;
}

export function dailyWaterNeedMl(params: {
  weightKg: number;
  tempC?: number;
  workoutsToday?: number;
}) {
  const { weightKg, tempC = 20, workoutsToday = 0 } = params;
  const base = weightKg * 35;
  const heat = tempC > 25 ? (tempC - 25) * 40 : 0;
  const training = workoutsToday * 500;
  return Math.round(base + heat + training);
}

export function ageFromBirthDate(birth: Date | string) {
  const d = typeof birth === "string" ? new Date(birth) : birth;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

export function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
