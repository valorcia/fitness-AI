/**
 * Equipment metadata — real gym / product photos curated from Unsplash.
 * Every URL below is one that's already exercised elsewhere in the
 * codebase (seed, dashboard, exercise library, coach gallery) so we know
 * it loads. Hints are in French to help beginners.
 */

const PHOTO = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&h=400&q=70`;

// Proven photo IDs (verified working — used elsewhere in the app)
const IMG = {
  barbellFloor: PHOTO("1581009146145-b5ef050c2e1e"),
  dumbbellPair: PHOTO("1583454110551-21f2fa2afe61"),
  bench: PHOTO("1571019613454-1cb2f99b2d8b"),
  rack: PHOTO("1534438327276-14e5300c3a48"),
  legPress: PHOTO("1623874514711-0f321325f318"),
  cable: PHOTO("1571902943202-507ec2618e8f"),
  smith: PHOTO("1574680096145-d05b474e2155"),
  deadlift: PHOTO("1517963879433-6ad2b056d712"),
  yogaMat: PHOTO("1544367567-0f2fcb009e0b"),
  treadmill: PHOTO("1534258936925-c58bed479fcb"),
  rower: PHOTO("1434596922112-19c563067271"),
  gymWalk: PHOTO("1517836357463-d25dfeac3438"),
  running: PHOTO("1461896836934-ffe607ba8211"),
  athlete: PHOTO("1532029837206-abbe2b7620e3"),
  hackSquat: PHOTO("1579758629938-03607ccdbaba"),
  inclineGym: PHOTO("1594737625785-a6cbdabd333c"),
  climber: PHOTO("1522163182402-834f871fd851"),
  gymRed: PHOTO("1605296867304-46d5465a13f1"),
  recovery: PHOTO("1506629905607-ac3d75c40ffa"),
};

export type EquipmentMeta = {
  imageUrl: string;
  hint?: string;
};

export const EQUIPMENT_META: Record<string, EquipmentMeta> = {
  barbell: {
    imageUrl: IMG.barbellFloor,
    hint: "Barre longue avec disques amovibles — squat, développé, soulevé de terre.",
  },
  dumbbell: {
    imageUrl: IMG.dumbbellPair,
    hint: "Tenus en main, un par bras, pour le travail unilatéral.",
  },
  bench: {
    imageUrl: IMG.bench,
    hint: "Banc plat ou inclinable pour les développés et les exercices assis.",
  },
  rack: {
    imageUrl: IMG.rack,
    hint: "Cage de sécurité pour soulever lourd seul (squat, overhead press).",
  },
  machine: {
    imageUrl: IMG.legPress,
    hint: "Machine guidée — presse à cuisses, chest press, etc.",
  },
  "cable machine": {
    imageUrl: IMG.cable,
    hint: "Résistance par câbles — tirages, écartés, triceps…",
  },
  "smith machine": {
    imageUrl: IMG.smith,
    hint: "Barre sur rails verticaux — plus stable, moins libre.",
  },
  kettlebell: {
    imageUrl: IMG.deadlift,
    hint: "Cloche en fonte — swings, snatch, goblet squats.",
  },
  bands: {
    imageUrl: IMG.yogaMat,
    hint: "Élastiques de résistance — assistance, mobilité, charge additionnelle.",
  },
  rings: {
    imageUrl: IMG.gymWalk,
    hint: "Anneaux de gymnastique — tractions, dips, calisthenics avancé.",
  },
  parallettes: {
    imageUrl: IMG.athlete,
    hint: "Petites barres parallèles — pompes, L-sit, planche.",
  },
  "pull-up bar": {
    imageUrl: IMG.athlete,
    hint: "Barre fixée porte ou mur pour tractions et hanging.",
  },
  "dip bars": {
    imageUrl: IMG.gymRed,
    hint: "Barres parallèles pour dips et L-sits.",
  },
  fingerboard: {
    imageUrl: IMG.climber,
    hint: "Poutre d'entraînement des doigts pour grimpeurs.",
  },
  "ab wheel": {
    imageUrl: IMG.hackSquat,
    hint: "Roue avec poignées pour gainage avancé du tronc.",
  },
  "foam roller": {
    imageUrl: IMG.yogaMat,
    hint: "Auto-massage pour récupération et mobilité.",
  },
  "yoga mat": {
    imageUrl: IMG.yogaMat,
    hint: "Tapis antidérapant pour yoga, gainage, étirements.",
  },
  "medicine ball": {
    imageUrl: IMG.inclineGym,
    hint: "Ballon lesté (3–10 kg) — lancers, wall balls, gainage.",
  },
  box: {
    imageUrl: IMG.athlete,
    hint: "Box pliométrique — box jumps, step-ups, split squats bulgares.",
  },
  "jump rope": {
    imageUrl: IMG.running,
    hint: "Cardio explosif, échauffement, coordination.",
  },
  "punching bag": {
    imageUrl: IMG.gymRed,
    hint: "Boxe, kick-boxing, MMA.",
  },
  "boxing gloves": {
    imageUrl: IMG.recovery,
    hint: "Protègent vos mains au sac ou en sparring.",
  },
  treadmill: {
    imageUrl: IMG.treadmill,
    hint: "Course indoor avec contrôle d'allure et d'inclinaison.",
  },
  bike: {
    imageUrl: IMG.gymRed,
    hint: "Route, VTT, vélo d'appartement ou spinning.",
  },
  rower: {
    imageUrl: IMG.rower,
    hint: "Cardio complet faible impact — dos et jambes.",
  },
  "assault bike": {
    imageUrl: IMG.treadmill,
    hint: "Vélo à résistance d'air avec bras — HIIT intense.",
  },
  "trap bar": {
    imageUrl: IMG.deadlift,
    hint: "Barre hexagonale — soulevés plus sûrs pour le dos.",
  },
  "trail shoes": {
    imageUrl: IMG.running,
    hint: "Chaussures adhérentes pour course nature et sentiers.",
  },
  racket: {
    imageUrl: IMG.gymWalk,
    hint: "Tennis, padel, badminton.",
  },
  football: {
    imageUrl: IMG.running,
    hint: "Football, basket, hand…",
  },
  "shin guards": {
    imageUrl: IMG.gymRed,
    hint: "Protection des tibias pour combat / sports collectifs.",
  },
};

export function metaFor(slug: string): EquipmentMeta {
  return (
    EQUIPMENT_META[slug] ?? {
      imageUrl: IMG.gymWalk,
      hint: undefined,
    }
  );
}
