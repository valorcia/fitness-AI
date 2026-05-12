/**
 * Visual + French labels for the equipment catalog. Each entry maps the
 * canonical slug (kept in English / lowercase for storage) to an emoji icon
 * and a French translation so beginners instantly see what the gear is.
 */

export type EquipmentMeta = {
  /** Emoji shown as a visual cue. */
  emoji: string;
  /** French label, plain language. */
  fr: string;
  /** Short usage hint shown under the label. */
  hint?: string;
};

export const EQUIPMENT_META: Record<string, EquipmentMeta> = {
  barbell: {
    emoji: "🏋️",
    fr: "Barre olympique",
    hint: "Barre longue avec disques amovibles, idéale pour squat, bench, deadlift.",
  },
  dumbbell: {
    emoji: "🏋️‍♂️",
    fr: "Haltères",
    hint: "Paires de poids tenus en main, un par bras.",
  },
  bench: {
    emoji: "🛋️",
    fr: "Banc de musculation",
    hint: "Plat ou inclinable, pour développé couché et exercices assis.",
  },
  rack: {
    emoji: "⛩️",
    fr: "Cage à squat",
    hint: "Structure de sécurité pour soulever lourd seul (squat, overhead).",
  },
  machine: {
    emoji: "⚙️",
    fr: "Machine guidée",
    hint: "Mouvement contraint par la machine — leg press, chest press, etc.",
  },
  "cable machine": {
    emoji: "🪢",
    fr: "Poulie à câbles",
    hint: "Résistance par poulie, pour tirages, écartés, triceps…",
  },
  "smith machine": {
    emoji: "🔩",
    fr: "Smith machine",
    hint: "Barre guidée verticalement, plus stable mais moins libre.",
  },
  kettlebell: {
    emoji: "🔔",
    fr: "Kettlebell",
    hint: "Poids en cloche avec poignée — swings, snatch, gainage.",
  },
  bands: {
    emoji: "➰",
    fr: "Élastiques",
    hint: "Bandes de résistance pour mobilité, assistance ou ajout de charge.",
  },
  rings: {
    emoji: "⭕",
    fr: "Anneaux de gymnastique",
    hint: "Pour tractions, dips et calisthenics avancé.",
  },
  parallettes: {
    emoji: "🅿️",
    fr: "Parallettes",
    hint: "Petites barres parallèles bas du sol — pompes, L-sit, planche.",
  },
  "pull-up bar": {
    emoji: "🚪",
    fr: "Barre de tractions",
    hint: "Fixée en porte ou au mur, pour tractions et hanging.",
  },
  "dip bars": {
    emoji: "⫼",
    fr: "Barres parallèles (dips)",
    hint: "Fixes ou portables, pour dips et L-sit.",
  },
  fingerboard: {
    emoji: "🧗",
    fr: "Fingerboard",
    hint: "Petite poutre d'entraînement de doigts pour grimpeurs.",
  },
  "ab wheel": {
    emoji: "🛞",
    fr: "Roue abdominale",
    hint: "Petite roue avec poignées — gainage avancé du tronc.",
  },
  "foam roller": {
    emoji: "🧻",
    fr: "Rouleau de massage",
    hint: "Auto-massage pour récupération et mobilité.",
  },
  "yoga mat": {
    emoji: "🧘",
    fr: "Tapis de yoga",
    hint: "Tapis antidérapant pour yoga, gainage, étirements.",
  },
  "medicine ball": {
    emoji: "🏐",
    fr: "Ballon lesté",
    hint: "Ballon plein (3 à 10 kg) — lancers, wall balls, gainage.",
  },
  box: {
    emoji: "📦",
    fr: "Box (caisse pliométrique)",
    hint: "Box jump, step-up, bulgarian split squat.",
  },
  "jump rope": {
    emoji: "🪢",
    fr: "Corde à sauter",
    hint: "Cardio explosif, échauffement, coordination.",
  },
  "punching bag": {
    emoji: "🥊",
    fr: "Sac de frappe",
    hint: "Boxe, kick-boxing, MMA.",
  },
  "boxing gloves": {
    emoji: "🥊",
    fr: "Gants de boxe",
    hint: "Protègent vos mains au sac ou en sparring.",
  },
  treadmill: {
    emoji: "🏃‍♀️",
    fr: "Tapis de course",
    hint: "Course indoor avec contrôle d'allure et d'inclinaison.",
  },
  bike: {
    emoji: "🚴",
    fr: "Vélo",
    hint: "Route, VTT, ou vélo d'appartement / spin.",
  },
  rower: {
    emoji: "🚣",
    fr: "Rameur",
    hint: "Cardio + renforcement dos / jambes, faible impact.",
  },
  "assault bike": {
    emoji: "💨",
    fr: "Assault bike",
    hint: "Vélo à résistance d'air avec bras — HIIT intense.",
  },
  "trap bar": {
    emoji: "🔷",
    fr: "Barre hexagonale (trap)",
    hint: "Soulevés de terre plus sûrs pour le dos.",
  },
  "trail shoes": {
    emoji: "👟",
    fr: "Chaussures trail",
    hint: "Course nature / sentiers.",
  },
  racket: {
    emoji: "🎾",
    fr: "Raquette",
    hint: "Tennis, padel, badminton.",
  },
  football: {
    emoji: "⚽",
    fr: "Ballon",
    hint: "Foot, basket, hand…",
  },
  "shin guards": {
    emoji: "🛡️",
    fr: "Protège-tibias",
    hint: "Sports de contact / arts martiaux.",
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
