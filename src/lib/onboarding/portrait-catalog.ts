/**
 * Curated catalogue of REAL full-body sport portraits (Unsplash). Each entry
 * is tagged with the morphology attributes used in the onboarding wizard so
 * the avatar preview can pick the closest match as the user composes their
 * coach.
 *
 * Every photo ID has been verified to load on Unsplash via the URLs already
 * used elsewhere in the project (seed.ts, coach gallery, dashboard hero).
 */

const PHOTO = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&h=900&q=70`;

export type CoachPortrait = {
  id: string;
  imageUrl: string;
  gender: "male" | "female" | "neutral";
  ethnicity: "european" | "african" | "asian" | "maghrebi" | "latino" | "mixed";
  hairColor?: "black" | "dark-brown" | "brown" | "blond" | "red" | "grey" | "white";
  hairStyle?: "short" | "medium" | "long" | "curly" | "straight" | "braided" | "ponytail" | "bun" | "shaved";
  skinTone?: "fair" | "light" | "medium" | "tan" | "dark" | "deep";
  bodyShape?: "slim" | "athletic" | "muscular" | "curvy" | "stocky";
};

export const PORTRAIT_CATALOG: CoachPortrait[] = [
  {
    id: "alex",
    imageUrl: PHOTO("1605296867304-46d5465a13f1"),
    gender: "male",
    ethnicity: "european",
    hairColor: "brown",
    hairStyle: "short",
    skinTone: "light",
    bodyShape: "muscular",
  },
  {
    id: "lea",
    imageUrl: PHOTO("1438761681033-6461ffad8d80"),
    gender: "female",
    ethnicity: "asian",
    hairColor: "black",
    hairStyle: "long",
    skinTone: "light",
    bodyShape: "athletic",
  },
  {
    id: "marcus",
    imageUrl: PHOTO("1568602471122-7832951cc4c5"),
    gender: "male",
    ethnicity: "african",
    hairColor: "black",
    hairStyle: "short",
    skinTone: "dark",
    bodyShape: "muscular",
  },
  {
    id: "sofia",
    imageUrl: PHOTO("1531746020798-e6953c6e8e04"),
    gender: "female",
    ethnicity: "european",
    hairColor: "brown",
    hairStyle: "long",
    skinTone: "medium",
    bodyShape: "athletic",
  },
  {
    id: "sam",
    imageUrl: PHOTO("1534528741775-53994a69daeb"),
    gender: "neutral",
    ethnicity: "mixed",
    hairColor: "dark-brown",
    hairStyle: "short",
    skinTone: "medium",
    bodyShape: "athletic",
  },
  {
    id: "kenji",
    imageUrl: PHOTO("1506794778202-cad84cf45f1d"),
    gender: "male",
    ethnicity: "asian",
    hairColor: "black",
    hairStyle: "short",
    skinTone: "light",
    bodyShape: "slim",
  },
  {
    id: "nora",
    imageUrl: PHOTO("1517841905240-472988babdf9"),
    gender: "female",
    ethnicity: "maghrebi",
    hairColor: "dark-brown",
    hairStyle: "long",
    skinTone: "medium",
    bodyShape: "athletic",
  },
  {
    id: "maya",
    imageUrl: PHOTO("1580489944761-15a19d654956"),
    gender: "female",
    ethnicity: "african",
    hairColor: "black",
    hairStyle: "curly",
    skinTone: "dark",
    bodyShape: "curvy",
  },
  {
    id: "athlete-1",
    imageUrl: PHOTO("1532029837206-abbe2b7620e3"),
    gender: "male",
    ethnicity: "european",
    hairColor: "dark-brown",
    hairStyle: "short",
    skinTone: "tan",
    bodyShape: "muscular",
  },
  {
    id: "athlete-2",
    imageUrl: PHOTO("1517836357463-d25dfeac3438"),
    gender: "male",
    ethnicity: "mixed",
    hairColor: "black",
    hairStyle: "short",
    skinTone: "medium",
    bodyShape: "athletic",
  },
];

const ANY = "any";

export function scorePortrait(
  p: CoachPortrait,
  prefs: {
    coachPreferredGender?: string;
    coachPreferredEthnicity?: string;
    coachPreferredHairColor?: string;
    coachPreferredHairStyle?: string;
    coachPreferredSkinTone?: string;
    coachPreferredBodyShape?: string;
  },
): number {
  let s = 0;
  if (prefs.coachPreferredGender && prefs.coachPreferredGender !== ANY) {
    if (p.gender === prefs.coachPreferredGender) s += 60;
    else s -= 30;
  }
  if (prefs.coachPreferredEthnicity && prefs.coachPreferredEthnicity !== ANY) {
    if (p.ethnicity === prefs.coachPreferredEthnicity) s += 40;
    else s -= 15;
  }
  if (prefs.coachPreferredHairColor && prefs.coachPreferredHairColor !== ANY) {
    if (p.hairColor === prefs.coachPreferredHairColor) s += 15;
  }
  if (prefs.coachPreferredHairStyle && prefs.coachPreferredHairStyle !== ANY) {
    if (p.hairStyle === prefs.coachPreferredHairStyle) s += 10;
  }
  if (prefs.coachPreferredSkinTone && prefs.coachPreferredSkinTone !== ANY) {
    if (p.skinTone === prefs.coachPreferredSkinTone) s += 12;
  }
  if (prefs.coachPreferredBodyShape && prefs.coachPreferredBodyShape !== ANY) {
    if (p.bodyShape === prefs.coachPreferredBodyShape) s += 12;
  }
  return s;
}

export function pickBestPortrait(prefs: Parameters<typeof scorePortrait>[1]): CoachPortrait {
  return [...PORTRAIT_CATALOG]
    .map((p) => ({ p, s: scorePortrait(p, prefs) }))
    .sort((a, b) => b.s - a.s)[0]!.p;
}
