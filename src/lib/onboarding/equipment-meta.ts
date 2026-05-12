/**
 * Visual + French labels for the equipment catalog. Each entry maps the
 * canonical slug (kept in English / lowercase for storage) to an emoji icon,
 * a French translation, an optional realistic photo and a short usage hint.
 */

const U = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&q=70`;

export type EquipmentMeta = {
  /** Emoji shown when no photo is available. */
  emoji: string;
  /** French label, plain language. */
  fr: string;
  /** Short usage hint shown under the label. */
  hint?: string;
  /** Gradient (from → to) when no photo, accent colour for tile. */
  gradient?: [string, string];
  /** Realistic photo URL (Unsplash). */
  imageUrl?: string;
};

export const EQUIPMENT_META: Record<string, EquipmentMeta> = {
  barbell: {
    emoji: "🏋️",
    fr: "Barre olympique",
    hint: "Barre longue avec disques amovibles, idéale pour squat, bench, deadlift.",
    imageUrl: U("photo-1581009146145-b5ef050c2e1e"),
    gradient: ["#1B3954", "#0F766E"],
  },
  dumbbell: {
    emoji: "🏋️‍♂️",
    fr: "Haltères",
    hint: "Paires de poids tenus en main, un par bras.",
    imageUrl: U("photo-1583454110551-21f2fa2afe61"),
    gradient: ["#0F766E", "#14B8A6"],
  },
  bench: {
    emoji: "🛋️",
    fr: "Banc de musculation",
    hint: "Plat ou inclinable, pour développé couché et exercices assis.",
    imageUrl: U("photo-1571019613454-1cb2f99b2d8b"),
    gradient: ["#1B3954", "#2563EB"],
  },
  rack: {
    emoji: "⛩️",
    fr: "Cage à squat",
    hint: "Structure de sécurité pour soulever lourd seul (squat, overhead).",
    imageUrl: U("photo-1534438327276-14e5300c3a48"),
    gradient: ["#1F2937", "#1B3954"],
  },
  machine: {
    emoji: "⚙️",
    fr: "Machine guidée",
    hint: "Mouvement contraint par la machine — leg press, chest press, etc.",
    imageUrl: U("photo-1623874514711-0f321325f318"),
    gradient: ["#0EA5E9", "#14B8A6"],
  },
  "cable machine": {
    emoji: "🪢",
    fr: "Poulie à câbles",
    hint: "Résistance par poulie, pour tirages, écartés, triceps…",
    imageUrl: U("photo-1571902943202-507ec2618e8f"),
    gradient: ["#7C3AED", "#A855F7"],
  },
  "smith machine": {
    emoji: "🔩",
    fr: "Smith machine",
    hint: "Barre guidée verticalement, plus stable mais moins libre.",
    imageUrl: U("photo-1574680096145-d05b474e2155"),
    gradient: ["#1F2937", "#3B82F6"],
  },
  kettlebell: {
    emoji: "🔔",
    fr: "Kettlebell",
    hint: "Poids en cloche avec poignée — swings, snatch, gainage.",
    imageUrl: U("photo-1604480132715-59c471af6d25"),
    gradient: ["#F59E0B", "#EF4444"],
  },
  bands: {
    emoji: "➰",
    fr: "Élastiques",
    hint: "Bandes de résistance pour mobilité, assistance ou ajout de charge.",
    gradient: ["#EC4899", "#F472B6"],
  },
  rings: {
    emoji: "⭕",
    fr: "Anneaux de gymnastique",
    hint: "Pour tractions, dips et calisthenics avancé.",
    gradient: ["#A16207", "#F59E0B"],
  },
  parallettes: {
    emoji: "🅿️",
    fr: "Parallettes",
    hint: "Petites barres parallèles bas du sol — pompes, L-sit, planche.",
    gradient: ["#0F766E", "#22D3EE"],
  },
  "pull-up bar": {
    emoji: "🚪",
    fr: "Barre de tractions",
    hint: "Fixée en porte ou au mur, pour tractions et hanging.",
    imageUrl: U("photo-1598971639058-a852862a1633"),
    gradient: ["#1B3954", "#0EA5E9"],
  },
  "dip bars": {
    emoji: "⫼",
    fr: "Barres parallèles (dips)",
    hint: "Fixes ou portables, pour dips et L-sit.",
    gradient: ["#0F172A", "#1B3954"],
  },
  fingerboard: {
    emoji: "🧗",
    fr: "Fingerboard",
    hint: "Petite poutre d'entraînement de doigts pour grimpeurs.",
    gradient: ["#92400E", "#EAB308"],
  },
  "ab wheel": {
    emoji: "🛞",
    fr: "Roue abdominale",
    hint: "Petite roue avec poignées — gainage avancé du tronc.",
    gradient: ["#1F2937", "#475569"],
  },
  "foam roller": {
    emoji: "🧻",
    fr: "Rouleau de massage",
    hint: "Auto-massage pour récupération et mobilité.",
    gradient: ["#6366F1", "#A855F7"],
  },
  "yoga mat": {
    emoji: "🧘",
    fr: "Tapis de yoga",
    hint: "Tapis antidérapant pour yoga, gainage, étirements.",
    imageUrl: U("photo-1544367567-0f2fcb009e0b"),
    gradient: ["#6366F1", "#A855F7"],
  },
  "medicine ball": {
    emoji: "🏐",
    fr: "Ballon lesté",
    hint: "Ballon plein (3 à 10 kg) — lancers, wall balls, gainage.",
    gradient: ["#DC2626", "#F97316"],
  },
  box: {
    emoji: "📦",
    fr: "Box (caisse pliométrique)",
    hint: "Box jump, step-up, bulgarian split squat.",
    gradient: ["#92400E", "#F59E0B"],
  },
  "jump rope": {
    emoji: "🪢",
    fr: "Corde à sauter",
    hint: "Cardio explosif, échauffement, coordination.",
    gradient: ["#14B8A6", "#22D3EE"],
  },
  "punching bag": {
    emoji: "🥊",
    fr: "Sac de frappe",
    hint: "Boxe, kick-boxing, MMA.",
    gradient: ["#7F1D1D", "#DC2626"],
  },
  "boxing gloves": {
    emoji: "🥊",
    fr: "Gants de boxe",
    hint: "Protègent vos mains au sac ou en sparring.",
    gradient: ["#DC2626", "#F97316"],
  },
  treadmill: {
    emoji: "🏃‍♀️",
    fr: "Tapis de course",
    hint: "Course indoor avec contrôle d'allure et d'inclinaison.",
    imageUrl: U("photo-1534258936925-c58bed479fcb"),
    gradient: ["#10B981", "#22D3EE"],
  },
  bike: {
    emoji: "🚴",
    fr: "Vélo",
    hint: "Route, VTT, ou vélo d'appartement / spin.",
    imageUrl: U("photo-1517836357463-d25dfeac3438"),
    gradient: ["#0EA5E9", "#22D3EE"],
  },
  rower: {
    emoji: "🚣",
    fr: "Rameur",
    hint: "Cardio + renforcement dos / jambes, faible impact.",
    imageUrl: U("photo-1434596922112-19c563067271"),
    gradient: ["#0F766E", "#10B981"],
  },
  "assault bike": {
    emoji: "💨",
    fr: "Assault bike",
    hint: "Vélo à résistance d'air avec bras — HIIT intense.",
    gradient: ["#1F2937", "#0EA5E9"],
  },
  "trap bar": {
    emoji: "🔷",
    fr: "Barre hexagonale (trap)",
    hint: "Soulevés de terre plus sûrs pour le dos.",
    gradient: ["#1B3954", "#0F766E"],
  },
  "trail shoes": {
    emoji: "👟",
    fr: "Chaussures trail",
    hint: "Course nature / sentiers.",
    gradient: ["#10B981", "#F59E0B"],
  },
  racket: {
    emoji: "🎾",
    fr: "Raquette",
    hint: "Tennis, padel, badminton.",
    gradient: ["#84CC16", "#A3E635"],
  },
  football: {
    emoji: "⚽",
    fr: "Ballon",
    hint: "Foot, basket, hand…",
    gradient: ["#1F2937", "#10B981"],
  },
  "shin guards": {
    emoji: "🛡️",
    fr: "Protège-tibias",
    hint: "Sports de contact / arts martiaux.",
    gradient: ["#0EA5E9", "#1B3954"],
  },
};

export function metaFor(slug: string): EquipmentMeta {
  return (
    EQUIPMENT_META[slug] ?? {
      emoji: "🧰",
      fr: slug,
    }
  );
}
