import type { CoachAppearance } from "@/lib/onboarding/coach-appearance";

type Persona = "STRICT" | "FUN" | "ZEN" | "MILITARY" | "ELITE";

const GENDER: Record<string, string> = {
  male: "man",
  female: "woman",
  neutral: "androgynous person",
};

const ETHNICITY: Record<string, string> = {
  european: "European",
  african: "Black African",
  asian: "East Asian",
  maghrebi: "Middle Eastern / North African",
  latino: "Latino",
  mixed: "mixed-race",
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
  ponytail: "tied in a high ponytail",
  bun: "tied in a neat bun",
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
  brown: "warm brown",
  blue: "bright blue",
  green: "emerald green",
  hazel: "hazel",
  grey: "steel grey",
  black: "dark",
};

const EYE_SHAPE: Record<string, string> = {
  round: "round",
  almond: "almond-shaped",
  hooded: "hooded",
  monolid: "monolid",
  downturned: "slightly downturned",
  upturned: "upturned",
};

const SKIN_TONE: Record<string, string> = {
  fair: "very fair porcelain",
  light: "light",
  medium: "medium",
  tan: "tan",
  dark: "dark brown",
  deep: "deep ebony",
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
  short: "short",
  average: "average height",
  tall: "tall",
};

const BODY_SHAPE: Record<string, string> = {
  slim: "slim lean",
  athletic: "athletic toned",
  muscular: "muscular",
  curvy: "curvy",
  stocky: "stocky strong",
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
  STRICT: "intense focused gaze, serious expression, confident posture",
  ZEN: "calm serene expression, peaceful aura",
  MILITARY: "disciplined determined expression, upright posture",
  ELITE: "confident accomplished expression, refined demeanor",
};

function pick<T extends string>(value: string | undefined, map: Record<string, T>): T | null {
  if (!value || value === "any") return null;
  return map[value] ?? null;
}

export type BuiltPrompt = {
  prompt: string;
  /** Stable signature for caching. */
  signature: string;
};

export function buildCoachPrompt(appearance: CoachAppearance, persona: Persona): BuiltPrompt {
  const gender = pick(appearance.coachPreferredGender, GENDER) ?? "person";
  const ethnicity = pick(appearance.coachPreferredEthnicity, ETHNICITY);
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

  // Hair clause
  const hair = [hairColor, hairStyle].filter(Boolean).join(" ");
  const hairClause = hair ? `${hair} hair` : null;

  // Eye clause
  const eyes = [eyeColor, eyeShape].filter(Boolean).join(" ");
  const eyesClause = eyes ? `${eyes} eyes` : null;

  // Body clause
  const body = [bodyHeight, bodyShape].filter(Boolean).join(" ");
  const bodyClause = body ? `${body} build` : null;

  // Outfit clause
  const topClause = top ? (color ? `${color} ${top}` : top) : null;
  const bottomClause = bottom ? (color ? `${color} ${bottom}` : bottom) : null;
  const outfitParts = [topClause, bottomClause].filter(Boolean);
  const outfitClause = outfitParts.length > 0 ? `wearing ${outfitParts.join(" and ")}` : null;
  const styleClause = style ? `, ${style} sportswear style` : "";

  const subject = [
    "professional fitness coach,",
    ethnicity ? `${ethnicity}` : null,
    gender,
    "in their late 20s to mid 30s",
  ]
    .filter(Boolean)
    .join(" ");

  const features = [skinTone ? `${skinTone} skin` : null, hairClause, eyesClause, faceShape, mouth, nose]
    .filter(Boolean)
    .join(", ");

  const prompt = [
    `Full-body photorealistic portrait of a ${subject}.`,
    features ? `${features}.` : "",
    bodyClause ? `${bodyClause}.` : "",
    outfitClause ? `${outfitClause}${styleClause}.` : "",
    `${PERSONA_VIBE[persona]}, standing confidently, looking directly at camera.`,
    "Modern bright gym studio background, soft natural daylight, shallow depth of field, sharp focus on face and full body, hyperrealistic, professional fashion photography, 35mm full body shot, vertical portrait orientation, ultra detailed skin texture, 8k.",
  ]
    .filter(Boolean)
    .join(" ");

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

  return { prompt, signature };
}

export const COACH_NEGATIVE_PROMPT =
  "cartoon, anime, illustration, painting, render, 3d, cgi, low quality, blurry, deformed, disfigured, extra limbs, watermark, text, logo, multiple people";
