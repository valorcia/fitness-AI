/**
 * 10 pré-générés "standard coaches" disponibles dans l'offre gratuite.
 * Sélectionnables par les utilisateurs FREE. Les utilisateurs PREMIUM peuvent
 * en plus charger leur propre photo ou personnaliser entièrement.
 *
 * Le slug sert d'identifiant stable et est stocké dans Preference.coachProfileSlug.
 * Les portraits sont générés une fois via /api/admin/seed-standard-coaches.
 */

export type StandardCoach = {
  slug: string;
  displayName: string;
  persona: "FUN" | "STRICT" | "ZEN" | "MILITARY" | "ELITE";
  gender: "male" | "female";
  ageYears: number;
  ethnicity: string;
  specialty: string;
  /** Internal style key used by the existing CoachProfile model. */
  style: "FRIENDLY" | "MILITARY" | "EXPERT";
  bio: string;
  tagline: string;
  /** Deterministic prompt used to (re)generate the portrait via fal.ai Flux Dev. */
  prompt: string;
};

const COMMON_SCENE =
  "standing confidently in a bright modern gym studio with large windows, soft natural daylight from the side, full body shot from head to toe, sharp focus, editorial fitness photography, vertical 9:16 composition, ultra realistic, 4k";

export const STANDARD_COACHES: StandardCoach[] = [
  {
    slug: "std-fun-female-lea",
    displayName: "Léa",
    persona: "FUN",
    gender: "female",
    ageYears: 28,
    ethnicity: "european",
    specialty: "Remise en forme & bien-être",
    style: "FRIENDLY",
    bio: "Coach bienveillante qui célèbre chaque petit progrès. Adore les séances courtes et joyeuses.",
    tagline: "On y va ensemble, à ton rythme !",
    prompt: `Professional female fitness coach, late 20s, warm friendly genuine smile, athletic toned slim build, long brown hair in a high ponytail, light caucasian skin, wearing a fitted teal tank top and black leggings, ${COMMON_SCENE}`,
  },
  {
    slug: "std-fun-male-tom",
    displayName: "Tom",
    persona: "FUN",
    gender: "male",
    ageYears: 30,
    ethnicity: "european",
    specialty: "Cardio & circuits ludiques",
    style: "FRIENDLY",
    bio: "L'énergie positive incarnée. Transforme chaque séance en moment fun.",
    tagline: "Allez, on lâche rien et on s'amuse !",
    prompt: `Professional male fitness coach, early 30s, big approachable smile, athletic muscular build, short messy brown hair, light caucasian skin, wearing a fitted orange t-shirt and grey shorts, ${COMMON_SCENE}`,
  },
  {
    slug: "std-strict-female-anya",
    displayName: "Anya",
    persona: "STRICT",
    gender: "female",
    ageYears: 32,
    ethnicity: "european",
    specialty: "Force & discipline",
    style: "EXPERT",
    bio: "Exigeante, précise, sans concession. Elle te pousse à donner le meilleur.",
    tagline: "Pas d'excuses. Pas de compromis.",
    prompt: `Professional female fitness coach, early 30s, intense focused serious gaze, very athletic muscular build, blonde hair pulled back tight, light skin, wearing a fitted black sports bra and high-waist black leggings, ${COMMON_SCENE}`,
  },
  {
    slug: "std-strict-male-marcus",
    displayName: "Marcus",
    persona: "STRICT",
    gender: "male",
    ageYears: 34,
    ethnicity: "african",
    specialty: "Musculation & performance",
    style: "EXPERT",
    bio: "Coach de haut niveau, direct et sans détour. Résultats avant tout.",
    tagline: "On bosse. On progresse. Sans bavardage.",
    prompt: `Professional male fitness coach, mid 30s, intense serious focused expression, very muscular athletic build, shaved head, dark brown skin, wearing a fitted black tank top and black joggers, ${COMMON_SCENE}`,
  },
  {
    slug: "std-zen-female-maya",
    displayName: "Maya",
    persona: "ZEN",
    gender: "female",
    ageYears: 36,
    ethnicity: "asian",
    specialty: "Yoga & mobilité",
    style: "FRIENDLY",
    bio: "Coach calme et posée. Spécialiste du corps en équilibre et de la respiration.",
    tagline: "Respire. Bouge en pleine conscience.",
    prompt: `Professional female fitness coach, mid 30s, calm serene peaceful expression, slim lean toned build, long straight black hair, east asian features, wearing a fitted lavender tank top and matching leggings, ${COMMON_SCENE}`,
  },
  {
    slug: "std-zen-male-ravi",
    displayName: "Ravi",
    persona: "ZEN",
    gender: "male",
    ageYears: 38,
    ethnicity: "south-asian",
    specialty: "Stretching & récupération",
    style: "FRIENDLY",
    bio: "Coach apaisant qui mise sur la régularité et la qualité du mouvement.",
    tagline: "Chaque mouvement compte. Chaque souffle aussi.",
    prompt: `Professional male fitness coach, late 30s, calm peaceful expression, lean toned athletic build, short black hair, south asian skin tone, wearing a fitted white t-shirt and grey jogger pants, ${COMMON_SCENE}`,
  },
  {
    slug: "std-military-female-sasha",
    displayName: "Sasha",
    persona: "MILITARY",
    gender: "female",
    ageYears: 31,
    ethnicity: "european",
    specialty: "HIIT & bootcamp",
    style: "MILITARY",
    bio: "Ancienne militaire. Discipline de fer, séances intenses, résultats garantis.",
    tagline: "Debout, soldat. On donne tout !",
    prompt: `Professional female fitness coach, early 30s, disciplined determined no-nonsense expression, very athletic muscular build, short cropped dark brown hair, light olive skin, wearing a fitted khaki green tank top and black tactical shorts, ${COMMON_SCENE}`,
  },
  {
    slug: "std-military-male-victor",
    displayName: "Victor",
    persona: "MILITARY",
    gender: "male",
    ageYears: 40,
    ethnicity: "european",
    specialty: "Crossfit & conditionnement militaire",
    style: "MILITARY",
    bio: "Ex-instructeur militaire. Mental d'acier, programme exigeant, transformations radicales.",
    tagline: "Le confort ne change rien. L'inconfort transforme.",
    prompt: `Professional male fitness coach, around 40, disciplined intense determined expression, very muscular powerful athletic build, short military buzz cut grey hair, weathered tanned skin, wearing a fitted black compression shirt and khaki tactical shorts, ${COMMON_SCENE}`,
  },
  {
    slug: "std-elite-female-clara",
    displayName: "Clara",
    persona: "ELITE",
    gender: "female",
    ageYears: 35,
    ethnicity: "latino",
    specialty: "Préparation physique haut niveau",
    style: "EXPERT",
    bio: "Coach de sportifs professionnels. Approche scientifique, méthodes éprouvées.",
    tagline: "L'excellence se construit. Jour après jour.",
    prompt: `Professional female fitness coach, mid 30s, confident accomplished refined expression, very athletic toned build, long wavy dark brown hair, warm tan skin, wearing a premium fitted black long-sleeve compression top and matching leggings, ${COMMON_SCENE}`,
  },
  {
    slug: "std-elite-male-julian",
    displayName: "Julian",
    persona: "ELITE",
    gender: "male",
    ageYears: 42,
    ethnicity: "european",
    specialty: "Mentorat & performance globale",
    style: "EXPERT",
    bio: "Mentor expérimenté. Combine performance, longévité, et qualité de vie.",
    tagline: "Le vrai luxe : un corps qui répond, à tout âge.",
    prompt: `Professional male fitness coach, early 40s, confident refined accomplished mentor expression, lean athletic toned build, short groomed salt-and-pepper grey hair, light caucasian skin, wearing a premium fitted navy blue zip-up training jacket and black joggers, ${COMMON_SCENE}`,
  },
];

export function getStandardCoachBySlug(slug: string): StandardCoach | null {
  return STANDARD_COACHES.find((c) => c.slug === slug) ?? null;
}
