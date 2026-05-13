/**
 * Coach appearance — catalog of all customization options used by the
 * onboarding wizard. Values are stored on Preference.coachPreferred*.
 *
 * The visual final coach is rendered as a photorealistic AI portrait
 * (Generated.Photos API / Replicate SDXL — see plan below). Until that
 * pipeline is wired, the closest CoachProfile photo from the existing
 * catalog is used as a stand-in.
 */

export type Option<V extends string> = {
  value: V;
  label: string;
  /** Optional swatch (hex) for color attributes. */
  swatch?: string;
  /** Optional emoji preview for shape attributes. */
  emoji?: string;
  /** Optional short caption shown under the label. */
  hint?: string;
};

export const ANY: Option<"any"> = { value: "any", label: "Indifférent" };

export const GENDER_OPTIONS: Option<string>[] = [
  ANY,
  { value: "male", label: "Homme", emoji: "👨" },
  { value: "female", label: "Femme", emoji: "👩" },
  { value: "neutral", label: "Non-binaire", emoji: "🧑" },
];

export const ETHNICITY_OPTIONS: Option<string>[] = [
  ANY,
  { value: "european", label: "Européen·ne" },
  { value: "african", label: "Africain·e" },
  { value: "asian", label: "Asiatique" },
  { value: "maghrebi", label: "Maghrébin·e / Moyen-Orient" },
  { value: "latino", label: "Latino / Hispanique" },
  { value: "mixed", label: "Métissé·e" },
];

export const HAIR_COLOR_OPTIONS: Option<string>[] = [
  ANY,
  { value: "black", label: "Noir", swatch: "#1B1B1B" },
  { value: "dark-brown", label: "Brun foncé", swatch: "#3B2412" },
  { value: "brown", label: "Brun", swatch: "#5C3A21" },
  { value: "blond", label: "Blond", swatch: "#D9B26A" },
  { value: "red", label: "Roux", swatch: "#A14B2C" },
  { value: "grey", label: "Gris", swatch: "#9CA3AF" },
  { value: "white", label: "Blanc", swatch: "#F1F5F9" },
];

export const HAIR_STYLE_OPTIONS: Option<string>[] = [
  ANY,
  { value: "short", label: "Court", emoji: "✂️" },
  { value: "medium", label: "Mi-long", emoji: "💇" },
  { value: "long", label: "Long", emoji: "👱" },
  { value: "curly", label: "Bouclés / frisés", emoji: "👨‍🦱" },
  { value: "straight", label: "Lisses / raides", emoji: "👩‍🦰" },
  { value: "braided", label: "Tressés", emoji: "🧑‍🦱" },
  { value: "ponytail", label: "Queue de cheval", emoji: "🎽" },
  { value: "bun", label: "Chignon", emoji: "🍡" },
  { value: "shaved", label: "Crâne rasé", emoji: "👨‍🦲" },
];

export const FACE_SHAPE_OPTIONS: Option<string>[] = [
  ANY,
  { value: "oval", label: "Ovale" },
  { value: "round", label: "Rond" },
  { value: "square", label: "Carré" },
  { value: "heart", label: "Cœur" },
  { value: "long", label: "Allongé" },
  { value: "diamond", label: "Diamant" },
];

export const EYE_COLOR_OPTIONS: Option<string>[] = [
  ANY,
  { value: "brown", label: "Marron", swatch: "#5B3A1E" },
  { value: "blue", label: "Bleu", swatch: "#3B82F6" },
  { value: "green", label: "Vert", swatch: "#22C55E" },
  { value: "hazel", label: "Noisette", swatch: "#A56C2E" },
  { value: "grey", label: "Gris", swatch: "#9CA3AF" },
  { value: "black", label: "Noir", swatch: "#1F2937" },
];

export const EYE_SHAPE_OPTIONS: Option<string>[] = [
  ANY,
  { value: "round", label: "Ronds" },
  { value: "almond", label: "En amande" },
  { value: "hooded", label: "Capuchonnés" },
  { value: "monolid", label: "Monolid" },
  { value: "downturned", label: "Tombants" },
  { value: "upturned", label: "Relevés" },
];

export const SKIN_TONE_OPTIONS: Option<string>[] = [
  ANY,
  { value: "fair", label: "Très claire", swatch: "#F4D7C2" },
  { value: "light", label: "Claire", swatch: "#E6B89A" },
  { value: "medium", label: "Médium", swatch: "#C68F6E" },
  { value: "tan", label: "Hâlée", swatch: "#A06A4A" },
  { value: "dark", label: "Foncée", swatch: "#6B3F2A" },
  { value: "deep", label: "Très foncée", swatch: "#3F1F12" },
];

export const MOUTH_OPTIONS: Option<string>[] = [
  ANY,
  { value: "thin", label: "Fines" },
  { value: "medium", label: "Moyennes" },
  { value: "full", label: "Pulpeuses" },
];

export const NOSE_OPTIONS: Option<string>[] = [
  ANY,
  { value: "small", label: "Petit" },
  { value: "medium", label: "Moyen" },
  { value: "wide", label: "Large" },
  { value: "aquiline", label: "Aquilin" },
  { value: "upturned", label: "Retroussé" },
];

export const BODY_HEIGHT_OPTIONS: Option<string>[] = [
  ANY,
  { value: "short", label: "Petite (< 1m70)" },
  { value: "average", label: "Moyenne (1m70-1m85)" },
  { value: "tall", label: "Grande (> 1m85)" },
];

export const BODY_SHAPE_OPTIONS: Option<string>[] = [
  ANY,
  { value: "slim", label: "Mince", emoji: "🥒" },
  { value: "athletic", label: "Athlétique", emoji: "🏃" },
  { value: "muscular", label: "Musclé·e", emoji: "💪" },
  { value: "curvy", label: "Pulpeux·se", emoji: "⏳" },
  { value: "stocky", label: "Trapu·e", emoji: "🪨" },
];

// ─── Tenue sportive ───────────────────────────────────────────
export const OUTFIT_TOP_OPTIONS: Option<string>[] = [
  ANY,
  { value: "tank", label: "Débardeur", emoji: "🎽" },
  { value: "tee", label: "T-shirt sport", emoji: "👕" },
  { value: "polo", label: "Polo", emoji: "🥻" },
  { value: "crop", label: "Brassière / crop", emoji: "🩱" },
  { value: "longsleeve", label: "Manches longues", emoji: "👔" },
  { value: "sweatshirt", label: "Sweat / pull", emoji: "🧶" },
  { value: "hoodie", label: "Hoodie à capuche", emoji: "🧥" },
  { value: "zip", label: "Veste zippée", emoji: "🦺" },
  { value: "jacket", label: "Veste technique / coupe-vent", emoji: "🧥" },
];

export const OUTFIT_BOTTOM_OPTIONS: Option<string>[] = [
  ANY,
  { value: "shorts", label: "Short", emoji: "🩳" },
  { value: "cycling", label: "Cuissard", emoji: "🚴" },
  { value: "leggings", label: "Legging", emoji: "🧘" },
  { value: "capri", label: "Pantacourt", emoji: "🦵" },
  { value: "jogger", label: "Jogger", emoji: "🏃" },
  { value: "track-pants", label: "Pantalon de survêtement", emoji: "🧦" },
  { value: "skort", label: "Skort / jupe-short", emoji: "🩰" },
];

export const OUTFIT_COLOR_OPTIONS: Option<string>[] = [
  ANY,
  { value: "black", label: "Noir", swatch: "#0F172A" },
  { value: "white", label: "Blanc", swatch: "#F8FAFC" },
  { value: "grey", label: "Gris", swatch: "#9CA3AF" },
  { value: "navy", label: "Bleu marine", swatch: "#1B3954" },
  { value: "teal", label: "Teal", swatch: "#14B8A6" },
  { value: "green", label: "Vert", swatch: "#16A34A" },
  { value: "red", label: "Rouge", swatch: "#DC2626" },
  { value: "orange", label: "Orange", swatch: "#F97316" },
  { value: "yellow", label: "Jaune", swatch: "#F59E0B" },
  { value: "pink", label: "Rose", swatch: "#EC4899" },
  { value: "purple", label: "Violet", swatch: "#8B5CF6" },
];

export const OUTFIT_STYLE_OPTIONS: Option<string>[] = [
  ANY,
  { value: "minimal", label: "Minimal", hint: "Coupe sobre, sans logo" },
  { value: "streetwear", label: "Streetwear", hint: "Hip-hop, oversize" },
  { value: "premium", label: "Premium", hint: "Lululemon-like, technique" },
  { value: "bold", label: "Bold", hint: "Couleurs vives, motifs" },
  { value: "vintage", label: "Vintage", hint: "Années 80-90" },
  { value: "technical", label: "Technique", hint: "Compression, performance" },
];

export type CoachAppearance = {
  coachPreferredGender?: string;
  coachPreferredEthnicity?: string;
  coachPreferredHairColor?: string;
  coachPreferredHairStyle?: string;
  coachPreferredFaceShape?: string;
  coachPreferredEyeColor?: string;
  coachPreferredEyeShape?: string;
  coachPreferredSkinTone?: string;
  coachPreferredMouth?: string;
  coachPreferredNose?: string;
  coachPreferredBodyHeight?: string;
  coachPreferredBodyShape?: string;
  coachOutfitTop?: string;
  coachOutfitBottom?: string;
  coachOutfitColor?: string;
  coachOutfitStyle?: string;
  coachOutfitType?: string; // legacy
};

export const COACH_APPEARANCE_DEFAULT: CoachAppearance = {
  coachPreferredGender: "any",
  coachPreferredEthnicity: "any",
  coachPreferredHairColor: "any",
  coachPreferredHairStyle: "any",
  coachPreferredFaceShape: "any",
  coachPreferredEyeColor: "any",
  coachPreferredEyeShape: "any",
  coachPreferredSkinTone: "any",
  coachPreferredMouth: "any",
  coachPreferredNose: "any",
  coachPreferredBodyHeight: "any",
  coachPreferredBodyShape: "any",
  coachOutfitTop: "any",
  coachOutfitBottom: "any",
  coachOutfitColor: "any",
  coachOutfitStyle: "any",
};
