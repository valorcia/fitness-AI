export type SportEntry = {
  slug: string;
  label: string;
  emoji: string;
  /** Recommended equipment slugs for this sport (subset of EQUIPMENT_CATALOG). */
  equipment: string[];
};

export const SPORTS_CATALOG: SportEntry[] = [
  {
    slug: "musculation",
    label: "Musculation",
    emoji: "💪",
    equipment: ["barbell", "dumbbell", "bench", "rack", "cable machine", "machine"],
  },
  {
    slug: "running",
    label: "Course à pied",
    emoji: "🏃",
    equipment: ["treadmill"],
  },
  {
    slug: "cycling",
    label: "Vélo / route",
    emoji: "🚴",
    equipment: ["bike"],
  },
  {
    slug: "crossfit",
    label: "CrossFit / HIIT",
    emoji: "🔥",
    equipment: [
      "barbell",
      "kettlebell",
      "box",
      "jump rope",
      "medicine ball",
      "assault bike",
      "rower",
      "pull-up bar",
    ],
  },
  {
    slug: "swimming",
    label: "Natation",
    emoji: "🏊",
    equipment: [],
  },
  {
    slug: "yoga",
    label: "Yoga / Pilates",
    emoji: "🧘",
    equipment: ["yoga mat", "foam roller", "bands"],
  },
  {
    slug: "boxing",
    label: "Boxe / arts martiaux",
    emoji: "🥊",
    equipment: ["punching bag", "boxing gloves", "jump rope"],
  },
  {
    slug: "climbing",
    label: "Escalade",
    emoji: "🧗",
    equipment: ["pull-up bar", "fingerboard"],
  },
  {
    slug: "hiking",
    label: "Randonnée",
    emoji: "🥾",
    equipment: ["trail shoes"],
  },
  {
    slug: "rowing",
    label: "Aviron",
    emoji: "🚣",
    equipment: ["rower"],
  },
  {
    slug: "calisthenics",
    label: "Calisthenics",
    emoji: "🤸",
    equipment: ["pull-up bar", "parallettes", "rings", "bands"],
  },
  {
    slug: "team_sports",
    label: "Sports collectifs",
    emoji: "⚽",
    equipment: ["football", "shin guards"],
  },
  {
    slug: "racket",
    label: "Tennis / padel",
    emoji: "🎾",
    equipment: ["racket"],
  },
  {
    slug: "dance",
    label: "Danse",
    emoji: "💃",
    equipment: ["yoga mat"],
  },
  {
    slug: "triathlon",
    label: "Triathlon",
    emoji: "🏊‍♂️",
    equipment: ["bike", "treadmill", "rower"],
  },
  {
    slug: "ski",
    label: "Ski / snowboard",
    emoji: "🎿",
    equipment: [],
  },
  {
    slug: "athletics",
    label: "Athlétisme",
    emoji: "🏟️",
    equipment: ["treadmill", "trail shoes"],
  },
  {
    slug: "horse_riding",
    label: "Équitation",
    emoji: "🐎",
    equipment: [],
  },
  {
    slug: "golf",
    label: "Golf",
    emoji: "⛳",
    equipment: [],
  },
  {
    slug: "surfing",
    label: "Surf / paddle",
    emoji: "🏄",
    equipment: ["bands"],
  },
  {
    slug: "gymnastics",
    label: "Gymnastique",
    emoji: "🤸‍♀️",
    equipment: ["rings", "parallettes", "yoga mat"],
  },
  {
    slug: "other",
    label: "Autre",
    emoji: "🎯",
    equipment: [],
  },
];

/**
 * Master equipment list shown in the onboarding's equipment step. Slugs are
 * lowercased free strings — they get stored as-is on HealthProfile.equipment.
 */
export const EQUIPMENT_CATALOG: string[] = [
  "barbell",
  "dumbbell",
  "bench",
  "rack",
  "machine",
  "cable machine",
  "smith machine",
  "kettlebell",
  "bands",
  "rings",
  "parallettes",
  "pull-up bar",
  "dip bars",
  "fingerboard",
  "ab wheel",
  "foam roller",
  "yoga mat",
  "medicine ball",
  "box",
  "jump rope",
  "punching bag",
  "boxing gloves",
  "treadmill",
  "bike",
  "rower",
  "assault bike",
  "trap bar",
  "trail shoes",
  "racket",
  "football",
  "shin guards",
];

export function recommendedEquipmentFor(sportSlugs: string[]): string[] {
  const set = new Set<string>();
  for (const slug of sportSlugs) {
    const entry = SPORTS_CATALOG.find((s) => s.slug === slug);
    entry?.equipment.forEach((eq) => set.add(eq));
  }
  return Array.from(set);
}
