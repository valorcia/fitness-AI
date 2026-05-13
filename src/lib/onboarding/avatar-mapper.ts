/**
 * Maps our 15 coach-appearance preferences to a DiceBear `personas` URL.
 * DiceBear is free, returns SVG, supports rich query parameters per style.
 *
 * https://www.dicebear.com/styles/personas/
 */

import type { CoachAppearance } from "./coach-appearance";

const HAIR_COLOR_HEX: Record<string, string> = {
  black: "1b1b1b",
  "dark-brown": "3b2412",
  brown: "5c3a21",
  blond: "d9b26a",
  red: "a14b2c",
  grey: "9ca3af",
  white: "f1f5f9",
};

const SKIN_HEX: Record<string, string> = {
  fair: "f4d7c2",
  light: "e6b89a",
  medium: "c68f6e",
  tan: "a06a4a",
  dark: "6b3f2a",
  deep: "3f1f12",
};

// DiceBear personas hair variants. Picked to roughly match our shape values.
const HAIR_VARIANT: Record<string, string> = {
  short: "shortCombover",
  medium: "shortCombover",
  long: "longHair",
  curly: "longCurly",
  straight: "longHair",
  braided: "longHair",
  ponytail: "longHair",
  bun: "longHair",
  shaved: "bald",
};

const FACIAL_HAIR_PROBABILITY: Record<string, number> = {
  // bump beard probability for "male" gender; otherwise 0
  male: 60,
  female: 0,
  neutral: 10,
  any: 30,
};

const MOUTH_VARIANT: Record<string, string> = {
  thin: "smile",
  medium: "smile",
  full: "bigSmile",
};

const NOSE_VARIANT: Record<string, string> = {
  small: "smallRound",
  medium: "mediumRound",
  wide: "wrinkles",
  aquiline: "mediumRound",
  upturned: "smallRound",
};

const BODY_VARIANT: Record<string, string> = {
  slim: "squared",
  athletic: "rounded",
  muscular: "checkered",
  curvy: "rounded",
  stocky: "squared",
};

const OUTFIT_BG: Record<string, string> = {
  black: "0f172a",
  white: "f8fafc",
  grey: "9ca3af",
  navy: "1b3954",
  teal: "14b8a6",
  red: "dc2626",
  yellow: "f59e0b",
  pink: "ec4899",
  purple: "8b5cf6",
};

function pickOrDefault<T>(value: string | undefined, table: Record<string, T>, fallback: T): T {
  if (!value || value === "any") return fallback;
  return table[value] ?? fallback;
}

export function buildAvatarUrl(prefs: CoachAppearance, seed: string): string {
  const hairColor = pickOrDefault(prefs.coachPreferredHairColor, HAIR_COLOR_HEX, "5c3a21");
  const skinColor = pickOrDefault(prefs.coachPreferredSkinTone, SKIN_HEX, "c68f6e");
  const hair = pickOrDefault(prefs.coachPreferredHairStyle, HAIR_VARIANT, "shortCombover");
  const mouth = pickOrDefault(prefs.coachPreferredMouth, MOUTH_VARIANT, "smile");
  const nose = pickOrDefault(prefs.coachPreferredNose, NOSE_VARIANT, "mediumRound");
  const body = pickOrDefault(prefs.coachPreferredBodyShape, BODY_VARIANT, "rounded");
  const facialHairProb =
    pickOrDefault(prefs.coachPreferredGender, FACIAL_HAIR_PROBABILITY, 30);
  const bg =
    prefs.coachOutfitColor && prefs.coachOutfitColor !== "any"
      ? OUTFIT_BG[prefs.coachOutfitColor] ?? "14b8a6"
      : "14b8a6";

  // Deterministic seed: combine the chosen attributes so the underlying
  // generated face stays stable while the user is tweaking. Using the user
  // seed makes the same combo render the same face across reloads.
  const compositeSeed = `${seed}-${prefs.coachPreferredGender ?? "any"}-${
    prefs.coachPreferredEthnicity ?? "any"
  }-${prefs.coachPreferredFaceShape ?? "any"}-${prefs.coachPreferredEyeColor ?? "any"}-${
    prefs.coachPreferredEyeShape ?? "any"
  }-${prefs.coachPreferredBodyHeight ?? "any"}-${prefs.coachOutfitType ?? "any"}-${
    prefs.coachOutfitStyle ?? "any"
  }`;

  const params = new URLSearchParams({
    seed: compositeSeed,
    skinColor,
    hairColor,
    hair,
    mouth,
    nose,
    body,
    backgroundColor: bg,
    backgroundType: "gradientLinear",
    facialHairProbability: String(facialHairProb),
    radius: "20",
    size: "320",
  });

  return `https://api.dicebear.com/9.x/personas/svg?${params.toString()}`;
}
