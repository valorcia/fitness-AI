import type { CoachAppearance } from "@/lib/onboarding/coach-appearance";

type Persona = "STRICT" | "FUN" | "ZEN" | "MILITARY" | "ELITE";

/**
 * Maps onboarding choices to the payload expected by HeyGen Photo Avatar API:
 *   POST https://api.heygen.com/v2/photo_avatar/photo/generate
 *
 * The API accepts `gender`, `age`, `ethnicity`, `pose`, `orientation`, `style`
 * and a free-text `appearance` field. We translate every UI choice into the
 * narrowest schema field when possible, and stuff the rest into `appearance`.
 *
 * Reference: https://docs.heygen.com/reference/photo-avatar-api
 */

type HeyGenGender = "Man" | "Woman" | "Unspecified";
type HeyGenAge = "Young Adult" | "Early Middle Age" | "Late Middle Age" | "Senior" | "Unspecified";
type HeyGenEthnicity =
  | "White"
  | "Black"
  | "Asian American"
  | "East Asian"
  | "South Asian"
  | "Southeast Asian"
  | "Middle Eastern"
  | "Hispanic"
  | "Pacific Islander"
  | "Mixed";
type HeyGenPose = "half_body" | "close_up" | "full_body";
type HeyGenOrientation = "square" | "vertical" | "horizontal";
type HeyGenStyle = "Realistic" | "Pixar" | "Cinematic" | "Vintage" | "Noir" | "Cyberpunk" | "Pop Art";

const GENDER_MAP: Record<string, HeyGenGender> = {
  male: "Man",
  female: "Woman",
  neutral: "Unspecified",
};

const ETHNICITY_MAP: Record<string, HeyGenEthnicity> = {
  european: "White",
  african: "Black",
  asian: "East Asian",
  maghrebi: "Middle Eastern",
  latino: "Hispanic",
  mixed: "Mixed",
};

const HAIR_COLOR: Record<string, string> = {
  black: "jet-black",
  "dark-brown": "dark brown",
  brown: "brown",
  blond: "natural blond",
  red: "auburn red",
  grey: "salt-and-pepper grey",
  white: "platinum white",
};

const HAIR_STYLE: Record<string, string> = {
  short: "short cropped",
  medium: "medium-length",
  long: "long flowing",
  curly: "curly textured",
  straight: "sleek straight",
  braided: "braided",
  ponytail: "high ponytail",
  bun: "neat bun",
  shaved: "shaved buzz cut",
};

const FACE_SHAPE: Record<string, string> = {
  oval: "oval face",
  round: "round face",
  square: "square jawline",
  heart: "heart-shaped face",
  long: "elongated face",
  diamond: "diamond-shaped face",
};

const EYE_COLOR: Record<string, string> = {
  brown: "warm brown eyes",
  blue: "bright blue eyes",
  green: "emerald green eyes",
  hazel: "hazel eyes",
  grey: "steel grey eyes",
  black: "dark eyes",
};

const EYE_SHAPE: Record<string, string> = {
  round: "round eyes",
  almond: "almond-shaped eyes",
  hooded: "hooded eyes",
  monolid: "monolid eyes",
  downturned: "slightly downturned eyes",
  upturned: "upturned eyes",
};

const SKIN_TONE: Record<string, string> = {
  fair: "very fair porcelain skin",
  light: "light skin",
  medium: "medium skin",
  tan: "tan skin",
  dark: "dark brown skin",
  deep: "deep ebony skin",
};

const MOUTH: Record<string, string> = {
  thin: "thin lips",
  medium: "natural lips",
  full: "full lips",
};

const NOSE: Record<string, string> = {
  small: "small nose",
  medium: "medium nose",
  wide: "broad nose",
  aquiline: "aquiline nose",
  upturned: "slightly upturned nose",
};

const BODY_HEIGHT: Record<string, string> = {
  short: "short stature",
  average: "average height",
  tall: "tall stature",
};

const BODY_SHAPE: Record<string, string> = {
  slim: "slim lean build",
  athletic: "athletic toned build",
  muscular: "muscular build",
  curvy: "curvy build",
  stocky: "stocky strong build",
};

const OUTFIT_TOP: Record<string, string> = {
  tank: "athletic tank top",
  tee: "fitted sport t-shirt",
  polo: "sport polo shirt",
  crop: "sport crop top",
  longsleeve: "long-sleeve performance top",
  sweatshirt: "fitted sweatshirt",
  hoodie: "fitted hoodie",
  zip: "zip-up training jacket",
  jacket: "technical windbreaker jacket",
};

const OUTFIT_BOTTOM: Record<string, string> = {
  shorts: "athletic shorts",
  cycling: "cycling bib shorts",
  leggings: "compression leggings",
  capri: "capri leggings",
  jogger: "fitted joggers",
  "track-pants": "track pants",
  skort: "sport skort",
};

const OUTFIT_COLOR: Record<string, string> = {
  black: "black",
  white: "white",
  grey: "heather grey",
  navy: "navy blue",
  teal: "teal",
  green: "forest green",
  red: "vibrant red",
  orange: "bright orange",
  yellow: "mustard yellow",
  pink: "hot pink",
  purple: "deep purple",
};

const OUTFIT_STYLE: Record<string, string> = {
  minimal: "minimal clean",
  streetwear: "streetwear",
  premium: "premium technical athleisure",
  bold: "bold colorful",
  vintage: "vintage 90s",
  technical: "high-performance compression",
};

const PERSONA_VIBE: Record<Persona, string> = {
  FUN: "warm friendly smile, approachable expression",
  STRICT: "intense focused gaze, serious expression",
  ZEN: "calm serene expression, peaceful posture",
  MILITARY: "disciplined determined expression, upright posture",
  ELITE: "confident accomplished expression, refined demeanor",
};

function pick<T extends string>(value: string | undefined, map: Record<string, T>): T | null {
  if (!value || value === "any") return null;
  return map[value] ?? null;
}

export type HeyGenPhotoRequest = {
  name: string;
  age: HeyGenAge;
  gender: HeyGenGender;
  ethnicity: HeyGenEthnicity;
  orientation: HeyGenOrientation;
  pose: HeyGenPose;
  style: HeyGenStyle;
  appearance: string;
};

export type BuiltHeyGenPrompt = {
  request: HeyGenPhotoRequest;
  /** Stable signature for caching. */
  signature: string;
};

export function buildHeyGenPhotoRequest(
  appearance: CoachAppearance,
  persona: Persona,
  coachName: string,
): BuiltHeyGenPrompt {
  const gender = pick(appearance.coachPreferredGender, GENDER_MAP) ?? "Unspecified";
  const ethnicity = pick(appearance.coachPreferredEthnicity, ETHNICITY_MAP) ?? "Mixed";
  const hairColor = pick(appearance.coachPreferredHairColor, HAIR_COLOR);
  const hairStyle = pick(appearance.coachPreferredHairStyle, HAIR_STYLE);
  const faceShape = pick(appearance.coachPreferredFaceShape, FACE_SHAPE);
  const eyeColor = pick(appearance.coachPreferredEyeColor, EYE_COLOR);
  const eyeShape = pick(appearance.coachPreferredEyeShape, EYE_SHAPE);
  const skinTone = pick(appearance.coachPreferredSkinTone, SKIN_TONE);
  const mouth = pick(appearance.coachPreferredMouth, MOUTH);
  const nose = pick(appearance.coachPreferredNose, NOSE);
  const bodyHeight = pick(appearance.coachPreferredBodyHeight, BODY_HEIGHT);
  const bodyShape = pick(appearance.coachPreferredBodyShape, BODY_SHAPE);
  const top = pick(appearance.coachOutfitTop, OUTFIT_TOP);
  const bottom = pick(appearance.coachOutfitBottom, OUTFIT_BOTTOM);
  const color = pick(appearance.coachOutfitColor, OUTFIT_COLOR);
  const style = pick(appearance.coachOutfitStyle, OUTFIT_STYLE);

  const hair = [hairColor, hairStyle].filter(Boolean).join(" ");
  const hairClause = hair ? `${hair} hair` : null;
  const bodyClause = [bodyHeight, bodyShape].filter(Boolean).join(", ") || null;

  const topClause = top ? (color ? `${color} ${top}` : top) : null;
  const bottomClause = bottom ? (color ? `${color} ${bottom}` : bottom) : null;
  const outfitParts = [topClause, bottomClause].filter(Boolean);
  const outfitClause = outfitParts.length > 0 ? `wearing ${outfitParts.join(" and ")}` : null;
  const styleClause = style ? `, ${style} sportswear style` : "";

  const appearanceParts = [
    skinTone,
    hairClause,
    eyeColor,
    eyeShape,
    faceShape,
    mouth,
    nose,
    bodyClause,
    outfitClause ? `${outfitClause}${styleClause}` : null,
    PERSONA_VIBE[persona],
    "professional fitness coach standing in a bright modern gym studio, soft natural daylight, sharp focus on the entire body from head to feet, editorial fitness photography",
  ].filter(Boolean);

  const request: HeyGenPhotoRequest = {
    name: coachName || "Coach",
    age: "Young Adult",
    gender,
    ethnicity,
    orientation: "vertical",
    pose: "full_body",
    style: "Realistic",
    appearance: appearanceParts.join(", "),
  };

  const signature = [
    persona,
    appearance.coachPreferredGender,
    appearance.coachPreferredEthnicity,
    appearance.coachPreferredHairColor,
    appearance.coachPreferredHairStyle,
    appearance.coachPreferredFaceShape,
    appearance.coachPreferredEyeColor,
    appearance.coachPreferredEyeShape,
    appearance.coachPreferredSkinTone,
    appearance.coachPreferredMouth,
    appearance.coachPreferredNose,
    appearance.coachPreferredBodyHeight,
    appearance.coachPreferredBodyShape,
    appearance.coachOutfitTop,
    appearance.coachOutfitBottom,
    appearance.coachOutfitColor,
    appearance.coachOutfitStyle,
  ]
    .map((v) => v ?? "any")
    .join("|");

  return { request, signature };
}
