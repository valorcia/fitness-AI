import type { CoachAppearance } from "@/lib/onboarding/coach-appearance";

type Persona = "STRICT" | "FUN" | "ZEN" | "MILITARY" | "ELITE";

/**
 * Maps onboarding choices to a natural-language prompt suitable for fal.ai
 * Flux Dev (text-to-image) or PuLID Flux (photo-locked). Unlike the previous
 * HeyGen mapper, we don't need to fit fixed enums — Flux understands plain
 * English natural descriptions, so we just stitch them together.
 */

const GENDER: Record<string, string> = {
  male: "male",
  female: "female",
  neutral: "androgynous",
};

const ETHNICITY: Record<string, string> = {
  european: "caucasian",
  african: "black african",
  asian: "east asian",
  "asian-american": "asian american",
  "south-asian": "south asian",
  "southeast-asian": "southeast asian",
  maghrebi: "middle eastern",
  latino: "latin",
  pacific: "pacific islander",
  mixed: "mixed ethnicity",
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
  FUN: "warm friendly genuine smile, approachable cheerful expression",
  STRICT: "intense focused serious gaze, no-nonsense expression",
  ZEN: "calm serene peaceful expression, balanced posture",
  MILITARY: "disciplined determined no-nonsense expression, upright posture",
  ELITE: "confident accomplished refined expression, mentor energy",
};

const SCENE =
  "standing confidently in a bright modern gym studio with large windows, soft natural daylight from the side, full body shot from head to toe, sharp focus, editorial fitness photography, vertical 9:16 composition, ultra realistic, 4k";

function pick<T extends string>(value: string | undefined, map: Record<string, T>): T | null {
  if (!value || value === "any") return null;
  return map[value] ?? null;
}

export type BuiltPrompt = {
  prompt: string;
};

export function buildCoachPrompt(
  appearance: CoachAppearance,
  persona: Persona,
  _coachName: string,
  opts: { omitFaceTraits?: boolean } = {},
): BuiltPrompt {
  const omitFace = opts.omitFaceTraits === true;

  const gender = pick(appearance.coachPreferredGender, GENDER);
  const ethnicity = omitFace ? null : pick(appearance.coachPreferredEthnicity, ETHNICITY);
  const hairColor = omitFace ? null : pick(appearance.coachPreferredHairColor, HAIR_COLOR);
  const hairStyle = omitFace ? null : pick(appearance.coachPreferredHairStyle, HAIR_STYLE);
  const faceShape = omitFace ? null : pick(appearance.coachPreferredFaceShape, FACE_SHAPE);
  const eyeColor = omitFace ? null : pick(appearance.coachPreferredEyeColor, EYE_COLOR);
  const eyeShape = omitFace ? null : pick(appearance.coachPreferredEyeShape, EYE_SHAPE);
  const skinTone = omitFace ? null : pick(appearance.coachPreferredSkinTone, SKIN_TONE);
  const mouth = omitFace ? null : pick(appearance.coachPreferredMouth, MOUTH);
  const nose = omitFace ? null : pick(appearance.coachPreferredNose, NOSE);
  const bodyHeight = omitFace ? null : pick(appearance.coachPreferredBodyHeight, BODY_HEIGHT);
  const bodyShape = omitFace ? null : pick(appearance.coachPreferredBodyShape, BODY_SHAPE);
  const top = pick(appearance.coachOutfitTop, OUTFIT_TOP);
  const bottom = pick(appearance.coachOutfitBottom, OUTFIT_BOTTOM);
  const color = pick(appearance.coachOutfitColor, OUTFIT_COLOR);
  const style = pick(appearance.coachOutfitStyle, OUTFIT_STYLE);

  const subject = `Professional ${gender ?? ""} fitness coach`.replace(/\s+/g, " ").trim();

  const hair = [hairColor, hairStyle].filter(Boolean).join(" ");
  const hairClause = hair ? `${hair} hair` : null;
  const bodyClause = [bodyHeight, bodyShape].filter(Boolean).join(", ") || null;

  const topClause = top ? (color ? `${color} ${top}` : top) : null;
  const bottomClause = bottom ? (color ? `${color} ${bottom}` : bottom) : null;
  const outfitParts = [topClause, bottomClause].filter(Boolean);
  const outfitClause = outfitParts.length > 0 ? `wearing ${outfitParts.join(" and ")}` : null;
  const styleClause = style ? `, ${style} sportswear style` : "";

  const parts = [
    subject,
    ethnicity,
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
    SCENE,
  ].filter(Boolean);

  return { prompt: parts.join(", ") };
}

export function appearanceSignature(appearance: Record<string, string>, persona: Persona): string {
  return [
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
}
