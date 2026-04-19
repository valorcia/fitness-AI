import { PrismaClient, ExerciseCategory, DifficultyLevel } from "@prisma/client";

const prisma = new PrismaClient();

type SeedExercise = {
  slug: string;
  name: string;
  category: ExerciseCategory;
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  equipment: string[];
  difficulty: DifficultyLevel;
  cues: string[];
  description?: string;
  isOutdoor?: boolean;
};

const EXERCISES: SeedExercise[] = [
  // ─── Lower body ─────────────────────────────────────────
  { slug: "barbell-back-squat", name: "Squat barre dos", category: ExerciseCategory.LOWER, primaryMuscles: ["quads", "glutes"], secondaryMuscles: ["hamstrings", "core"], equipment: ["barbell", "rack"], difficulty: DifficultyLevel.HARD, cues: ["Torse droit", "Genoux alignés orteils", "Poussez dans les talons"] },
  { slug: "front-squat", name: "Front squat", category: ExerciseCategory.LOWER, primaryMuscles: ["quads"], secondaryMuscles: ["core"], equipment: ["barbell", "rack"], difficulty: DifficultyLevel.HARD, cues: ["Coudes hauts", "Tronc gainé", "Descente contrôlée"] },
  { slug: "goblet-squat", name: "Goblet squat", category: ExerciseCategory.LOWER, primaryMuscles: ["quads", "glutes"], equipment: ["dumbbell"], difficulty: DifficultyLevel.EASY, cues: ["Coudes dans les genoux", "Dos neutre"] },
  { slug: "bulgarian-split-squat", name: "Split squat bulgare", category: ExerciseCategory.LOWER, primaryMuscles: ["quads", "glutes"], equipment: ["dumbbell", "bench"], difficulty: DifficultyLevel.MODERATE, cues: ["Pied avant plat", "Tronc vertical"] },
  { slug: "walking-lunge", name: "Fentes marchées", category: ExerciseCategory.LOWER, primaryMuscles: ["quads", "glutes"], equipment: ["dumbbell"], difficulty: DifficultyLevel.MODERATE, cues: ["Grandes foulées", "Genou arrière vers le sol"] },
  { slug: "romanian-deadlift", name: "Soulevé de terre roumain", category: ExerciseCategory.LOWER, primaryMuscles: ["hamstrings", "glutes"], equipment: ["barbell"], difficulty: DifficultyLevel.MODERATE, cues: ["Hanches en arrière", "Barre proche", "Dos neutre"] },
  { slug: "hip-thrust", name: "Hip thrust", category: ExerciseCategory.LOWER, primaryMuscles: ["glutes"], equipment: ["barbell", "bench"], difficulty: DifficultyLevel.MODERATE, cues: ["Serrez les fesses en haut", "Menton vers la poitrine"] },
  { slug: "leg-press", name: "Presse à cuisses", category: ExerciseCategory.LOWER, primaryMuscles: ["quads", "glutes"], equipment: ["machine"], difficulty: DifficultyLevel.MODERATE, cues: ["Pieds largeur hanches", "Ne verrouillez pas les genoux"] },
  { slug: "leg-extension", name: "Leg extension", category: ExerciseCategory.LOWER, primaryMuscles: ["quads"], equipment: ["machine"], difficulty: DifficultyLevel.EASY, cues: ["Contraction max en haut", "Descente lente"] },
  { slug: "leg-curl", name: "Leg curl", category: ExerciseCategory.LOWER, primaryMuscles: ["hamstrings"], equipment: ["machine"], difficulty: DifficultyLevel.EASY, cues: ["Amplitude complète", "Tempo 2-0-2"] },
  { slug: "calf-raise", name: "Mollets debout", category: ExerciseCategory.LOWER, primaryMuscles: ["calves"], equipment: ["machine"], difficulty: DifficultyLevel.EASY, cues: ["Amplitude max", "Pause en haut"] },
  { slug: "box-jump", name: "Box jump", category: ExerciseCategory.LOWER, primaryMuscles: ["quads", "glutes"], equipment: ["box"], difficulty: DifficultyLevel.HARD, cues: ["Réception souple", "Boîte sûre"] },

  // ─── Upper push ─────────────────────────────────────────
  { slug: "bench-press", name: "Développé couché", category: ExerciseCategory.UPPER_PUSH, primaryMuscles: ["chest"], secondaryMuscles: ["triceps", "front delts"], equipment: ["barbell", "bench"], difficulty: DifficultyLevel.MODERATE, cues: ["Omoplates serrées", "Barre mi-poitrine", "Contrôle en descente"] },
  { slug: "incline-bench-press", name: "Développé incliné", category: ExerciseCategory.UPPER_PUSH, primaryMuscles: ["upper chest"], equipment: ["barbell", "bench"], difficulty: DifficultyLevel.MODERATE, cues: ["Inclinaison 30°", "Coudes sous la barre"] },
  { slug: "dumbbell-bench-press", name: "Développé haltères", category: ExerciseCategory.UPPER_PUSH, primaryMuscles: ["chest"], equipment: ["dumbbell", "bench"], difficulty: DifficultyLevel.MODERATE, cues: ["Poignets neutres", "Amplitude max"] },
  { slug: "push-up", name: "Pompes", category: ExerciseCategory.UPPER_PUSH, primaryMuscles: ["chest", "triceps"], equipment: [], difficulty: DifficultyLevel.EASY, cues: ["Gainage complet", "Poitrine au sol"] },
  { slug: "dips", name: "Dips", category: ExerciseCategory.UPPER_PUSH, primaryMuscles: ["triceps", "chest"], equipment: ["dip bars"], difficulty: DifficultyLevel.HARD, cues: ["Coudes proches du corps", "Descente contrôlée"] },
  { slug: "overhead-press", name: "Développé militaire", category: ExerciseCategory.UPPER_PUSH, primaryMuscles: ["shoulders"], secondaryMuscles: ["triceps"], equipment: ["barbell"], difficulty: DifficultyLevel.HARD, cues: ["Gainage abdo", "Barre verticale"] },
  { slug: "dumbbell-shoulder-press", name: "Développé épaules haltères", category: ExerciseCategory.UPPER_PUSH, primaryMuscles: ["shoulders"], equipment: ["dumbbell", "bench"], difficulty: DifficultyLevel.MODERATE, cues: ["Coudes 45°", "Descente sous épaules"] },
  { slug: "lateral-raise", name: "Élévations latérales", category: ExerciseCategory.UPPER_PUSH, primaryMuscles: ["side delts"], equipment: ["dumbbell"], difficulty: DifficultyLevel.EASY, cues: ["Coudes légèrement pliés", "Montée jusqu'aux épaules"] },
  { slug: "cable-chest-fly", name: "Écarté poulie", category: ExerciseCategory.UPPER_PUSH, primaryMuscles: ["chest"], equipment: ["cable machine"], difficulty: DifficultyLevel.EASY, cues: ["Arc de cercle", "Contraction en fin"] },
  { slug: "triceps-rope-pushdown", name: "Extensions triceps corde", category: ExerciseCategory.UPPER_PUSH, primaryMuscles: ["triceps"], equipment: ["cable machine"], difficulty: DifficultyLevel.EASY, cues: ["Coudes fixes", "Écartez les extrémités en bas"] },

  // ─── Upper pull ─────────────────────────────────────────
  { slug: "pull-up", name: "Tractions", category: ExerciseCategory.UPPER_PULL, primaryMuscles: ["lats", "biceps"], equipment: ["pull-up bar"], difficulty: DifficultyLevel.HARD, cues: ["Suspension complète", "Menton au-dessus de la barre"] },
  { slug: "chin-up", name: "Tractions supination", category: ExerciseCategory.UPPER_PULL, primaryMuscles: ["biceps", "lats"], equipment: ["pull-up bar"], difficulty: DifficultyLevel.HARD, cues: ["Paumes vers soi", "Serrez les omoplates"] },
  { slug: "lat-pulldown", name: "Tirage vertical", category: ExerciseCategory.UPPER_PULL, primaryMuscles: ["lats"], equipment: ["cable machine"], difficulty: DifficultyLevel.MODERATE, cues: ["Buste légèrement en arrière", "Coudes vers hanches"] },
  { slug: "barbell-row", name: "Rowing barre", category: ExerciseCategory.UPPER_PULL, primaryMuscles: ["mid back", "lats"], equipment: ["barbell"], difficulty: DifficultyLevel.MODERATE, cues: ["Dos neutre", "Tirez au bas-ventre"] },
  { slug: "dumbbell-row", name: "Rowing haltère", category: ExerciseCategory.UPPER_PULL, primaryMuscles: ["lats", "mid back"], equipment: ["dumbbell", "bench"], difficulty: DifficultyLevel.EASY, cues: ["Main appuyée sur banc", "Tirez vers la hanche"] },
  { slug: "seated-cable-row", name: "Rowing poulie assis", category: ExerciseCategory.UPPER_PULL, primaryMuscles: ["mid back"], equipment: ["cable machine"], difficulty: DifficultyLevel.EASY, cues: ["Torse droit", "Serrez les omoplates"] },
  { slug: "face-pull", name: "Face pull", category: ExerciseCategory.UPPER_PULL, primaryMuscles: ["rear delts", "upper back"], equipment: ["cable machine"], difficulty: DifficultyLevel.EASY, cues: ["Coudes hauts", "Tirez vers le visage"] },
  { slug: "barbell-curl", name: "Curl barre", category: ExerciseCategory.UPPER_PULL, primaryMuscles: ["biceps"], equipment: ["barbell"], difficulty: DifficultyLevel.EASY, cues: ["Coudes fixes", "Pas de balancement"] },
  { slug: "hammer-curl", name: "Curl marteau", category: ExerciseCategory.UPPER_PULL, primaryMuscles: ["biceps", "brachialis"], equipment: ["dumbbell"], difficulty: DifficultyLevel.EASY, cues: ["Paumes face à face", "Tempo contrôlé"] },

  // ─── Full body ──────────────────────────────────────────
  { slug: "deadlift", name: "Soulevé de terre", category: ExerciseCategory.FULL_BODY, primaryMuscles: ["posterior chain"], equipment: ["barbell"], difficulty: DifficultyLevel.BRUTAL, cues: ["Dos neutre", "Poussez le sol", "Verrouillez les hanches en haut"] },
  { slug: "sumo-deadlift", name: "Soulevé sumo", category: ExerciseCategory.FULL_BODY, primaryMuscles: ["glutes", "quads"], equipment: ["barbell"], difficulty: DifficultyLevel.HARD, cues: ["Pieds larges", "Barre proche"] },
  { slug: "trap-bar-deadlift", name: "Trap bar deadlift", category: ExerciseCategory.FULL_BODY, primaryMuscles: ["posterior chain"], equipment: ["trap bar"], difficulty: DifficultyLevel.MODERATE, cues: ["Dos neutre", "Poussez le sol"] },
  { slug: "clean-and-press", name: "Épaulé jeté", category: ExerciseCategory.FULL_BODY, primaryMuscles: ["full body"], equipment: ["barbell"], difficulty: DifficultyLevel.BRUTAL, cues: ["Mouvement explosif", "Réception gainée"] },
  { slug: "kettlebell-swing", name: "Kettlebell swing", category: ExerciseCategory.FULL_BODY, primaryMuscles: ["glutes", "hamstrings", "back"], equipment: ["kettlebell"], difficulty: DifficultyLevel.MODERATE, cues: ["Hanches en arrière", "Explosivité des hanches"] },
  { slug: "thruster", name: "Thruster", category: ExerciseCategory.FULL_BODY, primaryMuscles: ["full body"], equipment: ["barbell"], difficulty: DifficultyLevel.HARD, cues: ["Squat complet", "Poussée continue au-dessus"] },
  { slug: "burpee", name: "Burpee", category: ExerciseCategory.FULL_BODY, primaryMuscles: ["full body"], equipment: [], difficulty: DifficultyLevel.HARD, isOutdoor: true, cues: ["Saut explosif", "Réception souple"] },
  { slug: "wall-ball", name: "Wall ball", category: ExerciseCategory.FULL_BODY, primaryMuscles: ["full body"], equipment: ["medicine ball"], difficulty: DifficultyLevel.MODERATE, cues: ["Squat complet", "Lancer vertical"] },

  // ─── Core ───────────────────────────────────────────────
  { slug: "plank", name: "Planche", category: ExerciseCategory.CORE, primaryMuscles: ["core"], equipment: [], difficulty: DifficultyLevel.EASY, cues: ["Alignement tête-talons", "Fessiers serrés"] },
  { slug: "side-plank", name: "Planche latérale", category: ExerciseCategory.CORE, primaryMuscles: ["obliques", "core"], equipment: [], difficulty: DifficultyLevel.MODERATE, cues: ["Hanches hautes", "Corps aligné"] },
  { slug: "hanging-leg-raise", name: "Relevé de jambes suspendu", category: ExerciseCategory.CORE, primaryMuscles: ["lower abs"], equipment: ["pull-up bar"], difficulty: DifficultyLevel.HARD, cues: ["Contrôle total", "Pas de balance"] },
  { slug: "ab-wheel-rollout", name: "Roue abdominale", category: ExerciseCategory.CORE, primaryMuscles: ["core"], equipment: ["ab wheel"], difficulty: DifficultyLevel.HARD, cues: ["Dos neutre", "Tronc gainé"] },
  { slug: "russian-twist", name: "Russian twist", category: ExerciseCategory.CORE, primaryMuscles: ["obliques"], equipment: ["medicine ball"], difficulty: DifficultyLevel.MODERATE, cues: ["Dos droit", "Tournez le tronc, pas les bras"] },
  { slug: "dead-bug", name: "Dead bug", category: ExerciseCategory.CORE, primaryMuscles: ["core"], equipment: [], difficulty: DifficultyLevel.EASY, cues: ["Lombaires plaquées", "Mouvements opposés"] },

  // ─── Cardio / outdoor ───────────────────────────────────
  { slug: "running-interval", name: "Course fractionnée", category: ExerciseCategory.CARDIO, primaryMuscles: ["legs", "cardio"], equipment: [], difficulty: DifficultyLevel.MODERATE, isOutdoor: true, cues: ["Foulée courte", "Respiration régulière"] },
  { slug: "running-tempo", name: "Course tempo", category: ExerciseCategory.CARDIO, primaryMuscles: ["cardio"], equipment: [], difficulty: DifficultyLevel.MODERATE, isOutdoor: true, cues: ["Allure confortable difficile", "Rythme constant"] },
  { slug: "running-easy", name: "Course endurance", category: ExerciseCategory.CARDIO, primaryMuscles: ["cardio"], equipment: [], difficulty: DifficultyLevel.EASY, isOutdoor: true, cues: ["Respiration nasale", "Conversation possible"] },
  { slug: "cycling-steady", name: "Vélo endurance", category: ExerciseCategory.CARDIO, primaryMuscles: ["legs", "cardio"], equipment: ["bike"], difficulty: DifficultyLevel.EASY, isOutdoor: true, cues: ["Cadence 80-90 rpm", "Position relaxée"] },
  { slug: "cycling-intervals", name: "Vélo fractionné", category: ExerciseCategory.CARDIO, primaryMuscles: ["legs", "cardio"], equipment: ["bike"], difficulty: DifficultyLevel.HARD, isOutdoor: true, cues: ["Sprints courts", "Récupération active"] },
  { slug: "rowing-machine", name: "Rameur", category: ExerciseCategory.CARDIO, primaryMuscles: ["full body"], equipment: ["rower"], difficulty: DifficultyLevel.MODERATE, cues: ["Jambes d'abord", "Corps puis bras"] },
  { slug: "assault-bike", name: "Assault bike", category: ExerciseCategory.CARDIO, primaryMuscles: ["full body"], equipment: ["assault bike"], difficulty: DifficultyLevel.HARD, cues: ["Poussez et tirez", "Respiration forte"] },
  { slug: "jump-rope", name: "Corde à sauter", category: ExerciseCategory.CARDIO, primaryMuscles: ["calves", "cardio"], equipment: ["jump rope"], difficulty: DifficultyLevel.EASY, cues: ["Sauts bas", "Poignets actifs"] },
  { slug: "walking", name: "Marche", category: ExerciseCategory.CARDIO, primaryMuscles: ["cardio"], equipment: [], difficulty: DifficultyLevel.EASY, isOutdoor: true, cues: ["Rythme soutenu", "Respiration ample"] },

  // ─── Mobility / recovery ────────────────────────────────
  { slug: "world-greatest-stretch", name: "World's greatest stretch", category: ExerciseCategory.MOBILITY, primaryMuscles: ["full body"], equipment: [], difficulty: DifficultyLevel.EASY, cues: ["Respiration lente", "Amplitude progressive"] },
  { slug: "hip-flexor-stretch", name: "Étirement psoas", category: ExerciseCategory.MOBILITY, primaryMuscles: ["hip flexors"], equipment: [], difficulty: DifficultyLevel.EASY, cues: ["Bassin neutre", "30s par côté"] },
  { slug: "thoracic-rotation", name: "Mobilité thoracique", category: ExerciseCategory.MOBILITY, primaryMuscles: ["upper back"], equipment: [], difficulty: DifficultyLevel.EASY, cues: ["Regard suit la main", "Respirez profondément"] },
  { slug: "foam-roll-quads", name: "Foam roll quadriceps", category: ExerciseCategory.MOBILITY, primaryMuscles: ["quads"], equipment: ["foam roller"], difficulty: DifficultyLevel.EASY, cues: ["Pression tolérable", "Passages lents"] },
];

const BADGES = [
  { slug: "first-workout", name: "Première rep", description: "Votre toute première séance.", tier: "bronze", xpReward: 50 },
  { slug: "week-streak", name: "En feu", description: "7 jours d'affilée.", tier: "silver", xpReward: 150 },
  { slug: "month-streak", name: "Inarrêtable", description: "30 jours d'affilée.", tier: "gold", xpReward: 500 },
  { slug: "first-5k", name: "5K bouclé", description: "Une course de 5 km.", tier: "silver", xpReward: 200 },
  { slug: "first-10k", name: "10K runner", description: "Une course de 10 km.", tier: "gold", xpReward: 400 },
  { slug: "elite-member", name: "Elite", description: "Abonnement Elite actif.", tier: "platinum", xpReward: 1000 },
  { slug: "community-first-share", name: "Partageur", description: "Premier post communautaire.", tier: "bronze", xpReward: 30 },
  { slug: "pr-smasher", name: "PR smasher", description: "Nouveau record personnel.", tier: "gold", xpReward: 300 },
];

async function main() {
  for (const ex of EXERCISES) {
    await prisma.exercise.upsert({ where: { slug: ex.slug }, update: ex, create: ex });
  }
  for (const b of BADGES) {
    await prisma.badge.upsert({ where: { slug: b.slug }, update: b, create: b });
  }
  await prisma.featureFlag.upsert({
    where: { key: "voice_coach" },
    update: {},
    create: { key: "voice_coach", enabled: true, rollout: 100 },
  });
  console.log(`Seed complete — ${EXERCISES.length} exercises, ${BADGES.length} badges.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
