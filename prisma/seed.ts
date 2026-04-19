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
  thumbnailUrl?: string;
  videoUrl?: string;
};

// Curated Unsplash IDs so thumbnails load from images.unsplash.com (allowed in next.config).
const U = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=70`;

const EXERCISES: SeedExercise[] = [
  // ─── Lower body ─────────────────────────────────────────
  { slug: "barbell-back-squat", name: "Squat barre dos", category: ExerciseCategory.LOWER, primaryMuscles: ["quads", "glutes"], secondaryMuscles: ["hamstrings", "core"], equipment: ["barbell", "rack"], difficulty: DifficultyLevel.HARD, cues: ["Torse droit", "Genoux alignés orteils", "Poussez dans les talons"], thumbnailUrl: U("photo-1534438327276-14e5300c3a48") },
  { slug: "front-squat", name: "Front squat", category: ExerciseCategory.LOWER, primaryMuscles: ["quads"], secondaryMuscles: ["core"], equipment: ["barbell", "rack"], difficulty: DifficultyLevel.HARD, cues: ["Coudes hauts", "Tronc gainé", "Descente contrôlée"], thumbnailUrl: U("photo-1581009146145-b5ef050c2e1e") },
  { slug: "goblet-squat", name: "Goblet squat", category: ExerciseCategory.LOWER, primaryMuscles: ["quads", "glutes"], equipment: ["dumbbell"], difficulty: DifficultyLevel.EASY, cues: ["Coudes dans les genoux", "Dos neutre"], thumbnailUrl: U("photo-1584464491033-06628f3a6b7b") },
  { slug: "hack-squat", name: "Hack squat machine", category: ExerciseCategory.LOWER, primaryMuscles: ["quads"], equipment: ["machine"], difficulty: DifficultyLevel.MODERATE, cues: ["Dos plaqué au dossier", "Descente contrôlée"], thumbnailUrl: U("photo-1579758629938-03607ccdbaba") },
  { slug: "smith-machine-squat", name: "Squat Smith machine", category: ExerciseCategory.LOWER, primaryMuscles: ["quads", "glutes"], equipment: ["smith machine"], difficulty: DifficultyLevel.MODERATE, cues: ["Pieds légèrement avancés", "Genoux stables"], thumbnailUrl: U("photo-1574680096145-d05b474e2155") },
  { slug: "bulgarian-split-squat", name: "Split squat bulgare", category: ExerciseCategory.LOWER, primaryMuscles: ["quads", "glutes"], equipment: ["dumbbell", "bench"], difficulty: DifficultyLevel.MODERATE, cues: ["Pied avant plat", "Tronc vertical"] },
  { slug: "walking-lunge", name: "Fentes marchées", category: ExerciseCategory.LOWER, primaryMuscles: ["quads", "glutes"], equipment: ["dumbbell"], difficulty: DifficultyLevel.MODERATE, cues: ["Grandes foulées", "Genou arrière vers le sol"] },
  { slug: "romanian-deadlift", name: "Soulevé de terre roumain", category: ExerciseCategory.LOWER, primaryMuscles: ["hamstrings", "glutes"], equipment: ["barbell"], difficulty: DifficultyLevel.MODERATE, cues: ["Hanches en arrière", "Barre proche", "Dos neutre"], thumbnailUrl: U("photo-1517963879433-6ad2b056d712") },
  { slug: "hip-thrust", name: "Hip thrust", category: ExerciseCategory.LOWER, primaryMuscles: ["glutes"], equipment: ["barbell", "bench"], difficulty: DifficultyLevel.MODERATE, cues: ["Serrez les fesses en haut", "Menton vers la poitrine"] },
  { slug: "glute-kickback-machine", name: "Glute kickback machine", category: ExerciseCategory.LOWER, primaryMuscles: ["glutes"], equipment: ["machine"], difficulty: DifficultyLevel.EASY, cues: ["Poussée par le talon", "Bassin neutre"] },
  { slug: "leg-press", name: "Presse à cuisses", category: ExerciseCategory.LOWER, primaryMuscles: ["quads", "glutes"], equipment: ["machine"], difficulty: DifficultyLevel.MODERATE, cues: ["Pieds largeur hanches", "Ne verrouillez pas les genoux"], thumbnailUrl: U("photo-1623874514711-0f321325f318") },
  { slug: "leg-extension", name: "Leg extension", category: ExerciseCategory.LOWER, primaryMuscles: ["quads"], equipment: ["machine"], difficulty: DifficultyLevel.EASY, cues: ["Contraction max en haut", "Descente lente"] },
  { slug: "leg-curl", name: "Leg curl allongé", category: ExerciseCategory.LOWER, primaryMuscles: ["hamstrings"], equipment: ["machine"], difficulty: DifficultyLevel.EASY, cues: ["Amplitude complète", "Tempo 2-0-2"] },
  { slug: "seated-leg-curl", name: "Leg curl assis", category: ExerciseCategory.LOWER, primaryMuscles: ["hamstrings"], equipment: ["machine"], difficulty: DifficultyLevel.EASY, cues: ["Bassin stable", "Poussez avec les ischios"] },
  { slug: "hip-abductor-machine", name: "Abducteurs machine", category: ExerciseCategory.LOWER, primaryMuscles: ["glutes medius"], equipment: ["machine"], difficulty: DifficultyLevel.EASY, cues: ["Mouvement contrôlé", "Torse droit"] },
  { slug: "hip-adductor-machine", name: "Adducteurs machine", category: ExerciseCategory.LOWER, primaryMuscles: ["adductors"], equipment: ["machine"], difficulty: DifficultyLevel.EASY, cues: ["Dos plaqué", "Amplitude contrôlée"] },
  { slug: "calf-raise", name: "Mollets debout", category: ExerciseCategory.LOWER, primaryMuscles: ["calves"], equipment: ["machine"], difficulty: DifficultyLevel.EASY, cues: ["Amplitude max", "Pause en haut"] },
  { slug: "seated-calf-raise", name: "Mollets assis", category: ExerciseCategory.LOWER, primaryMuscles: ["soleus"], equipment: ["machine"], difficulty: DifficultyLevel.EASY, cues: ["Rythme régulier", "Amplitude complète"] },
  { slug: "box-jump", name: "Box jump", category: ExerciseCategory.LOWER, primaryMuscles: ["quads", "glutes"], equipment: ["box"], difficulty: DifficultyLevel.HARD, cues: ["Réception souple", "Boîte sûre"] },

  // ─── Upper push ─────────────────────────────────────────
  { slug: "bench-press", name: "Développé couché", category: ExerciseCategory.UPPER_PUSH, primaryMuscles: ["chest"], secondaryMuscles: ["triceps", "front delts"], equipment: ["barbell", "bench"], difficulty: DifficultyLevel.MODERATE, cues: ["Omoplates serrées", "Barre mi-poitrine"], thumbnailUrl: U("photo-1571019613454-1cb2f99b2d8b") },
  { slug: "incline-bench-press", name: "Développé incliné", category: ExerciseCategory.UPPER_PUSH, primaryMuscles: ["upper chest"], equipment: ["barbell", "bench"], difficulty: DifficultyLevel.MODERATE, cues: ["Inclinaison 30°", "Coudes sous la barre"], thumbnailUrl: U("photo-1594737625785-a6cbdabd333c") },
  { slug: "dumbbell-bench-press", name: "Développé haltères", category: ExerciseCategory.UPPER_PUSH, primaryMuscles: ["chest"], equipment: ["dumbbell", "bench"], difficulty: DifficultyLevel.MODERATE, cues: ["Poignets neutres", "Amplitude max"], thumbnailUrl: U("photo-1583454110551-21f2fa2afe61") },
  { slug: "chest-press-machine", name: "Chest press machine", category: ExerciseCategory.UPPER_PUSH, primaryMuscles: ["chest"], equipment: ["machine"], difficulty: DifficultyLevel.EASY, cues: ["Poignées à hauteur mi-poitrine", "Contraction en fin"], thumbnailUrl: U("photo-1534438327276-14e5300c3a48") },
  { slug: "pec-deck", name: "Pec deck", category: ExerciseCategory.UPPER_PUSH, primaryMuscles: ["chest"], equipment: ["machine"], difficulty: DifficultyLevel.EASY, cues: ["Coudes fixes", "Contraction centrale"] },
  { slug: "cable-chest-fly", name: "Écarté poulie", category: ExerciseCategory.UPPER_PUSH, primaryMuscles: ["chest"], equipment: ["cable machine"], difficulty: DifficultyLevel.EASY, cues: ["Arc de cercle", "Contraction en fin"] },
  { slug: "push-up", name: "Pompes", category: ExerciseCategory.UPPER_PUSH, primaryMuscles: ["chest", "triceps"], equipment: [], difficulty: DifficultyLevel.EASY, cues: ["Gainage complet", "Poitrine au sol"], thumbnailUrl: U("photo-1571019613454-1cb2f99b2d8b") },
  { slug: "dips", name: "Dips", category: ExerciseCategory.UPPER_PUSH, primaryMuscles: ["triceps", "chest"], equipment: ["dip bars"], difficulty: DifficultyLevel.HARD, cues: ["Coudes proches du corps", "Descente contrôlée"] },
  { slug: "overhead-press", name: "Développé militaire", category: ExerciseCategory.UPPER_PUSH, primaryMuscles: ["shoulders"], secondaryMuscles: ["triceps"], equipment: ["barbell"], difficulty: DifficultyLevel.HARD, cues: ["Gainage abdo", "Barre verticale"] },
  { slug: "shoulder-press-machine", name: "Shoulder press machine", category: ExerciseCategory.UPPER_PUSH, primaryMuscles: ["shoulders"], equipment: ["machine"], difficulty: DifficultyLevel.MODERATE, cues: ["Dos plaqué", "Coudes légèrement devant"] },
  { slug: "dumbbell-shoulder-press", name: "Développé épaules haltères", category: ExerciseCategory.UPPER_PUSH, primaryMuscles: ["shoulders"], equipment: ["dumbbell", "bench"], difficulty: DifficultyLevel.MODERATE, cues: ["Coudes 45°", "Descente sous épaules"] },
  { slug: "lateral-raise", name: "Élévations latérales", category: ExerciseCategory.UPPER_PUSH, primaryMuscles: ["side delts"], equipment: ["dumbbell"], difficulty: DifficultyLevel.EASY, cues: ["Coudes légèrement pliés", "Montée jusqu'aux épaules"] },
  { slug: "lateral-raise-machine", name: "Élévations latérales machine", category: ExerciseCategory.UPPER_PUSH, primaryMuscles: ["side delts"], equipment: ["machine"], difficulty: DifficultyLevel.EASY, cues: ["Pousser vers l'extérieur", "Pas de haussement d'épaules"] },
  { slug: "triceps-rope-pushdown", name: "Triceps corde poulie", category: ExerciseCategory.UPPER_PUSH, primaryMuscles: ["triceps"], equipment: ["cable machine"], difficulty: DifficultyLevel.EASY, cues: ["Coudes fixes", "Écartez les extrémités en bas"] },
  { slug: "triceps-machine", name: "Triceps extension machine", category: ExerciseCategory.UPPER_PUSH, primaryMuscles: ["triceps"], equipment: ["machine"], difficulty: DifficultyLevel.EASY, cues: ["Coudes contre les coussins", "Amplitude contrôlée"] },

  // ─── Upper pull ─────────────────────────────────────────
  { slug: "pull-up", name: "Tractions", category: ExerciseCategory.UPPER_PULL, primaryMuscles: ["lats", "biceps"], equipment: ["pull-up bar"], difficulty: DifficultyLevel.HARD, cues: ["Suspension complète", "Menton au-dessus de la barre"], thumbnailUrl: U("photo-1598971639058-a852862a1633") },
  { slug: "chin-up", name: "Tractions supination", category: ExerciseCategory.UPPER_PULL, primaryMuscles: ["biceps", "lats"], equipment: ["pull-up bar"], difficulty: DifficultyLevel.HARD, cues: ["Paumes vers soi", "Serrez les omoplates"] },
  { slug: "assisted-pull-up-machine", name: "Tractions assistées machine", category: ExerciseCategory.UPPER_PULL, primaryMuscles: ["lats", "biceps"], equipment: ["machine"], difficulty: DifficultyLevel.EASY, cues: ["Mouvement complet", "Contrôlez la descente"] },
  { slug: "lat-pulldown", name: "Tirage vertical", category: ExerciseCategory.UPPER_PULL, primaryMuscles: ["lats"], equipment: ["cable machine"], difficulty: DifficultyLevel.MODERATE, cues: ["Buste légèrement en arrière", "Coudes vers hanches"], thumbnailUrl: U("photo-1571902943202-507ec2618e8f") },
  { slug: "close-grip-pulldown", name: "Tirage serré poulie", category: ExerciseCategory.UPPER_PULL, primaryMuscles: ["lats", "biceps"], equipment: ["cable machine"], difficulty: DifficultyLevel.EASY, cues: ["Poignée V", "Tirez vers le ventre"] },
  { slug: "barbell-row", name: "Rowing barre", category: ExerciseCategory.UPPER_PULL, primaryMuscles: ["mid back", "lats"], equipment: ["barbell"], difficulty: DifficultyLevel.MODERATE, cues: ["Dos neutre", "Tirez au bas-ventre"] },
  { slug: "pendlay-row", name: "Pendlay row", category: ExerciseCategory.UPPER_PULL, primaryMuscles: ["mid back"], equipment: ["barbell"], difficulty: DifficultyLevel.HARD, cues: ["Barre au sol chaque rep", "Dos horizontal"] },
  { slug: "t-bar-row", name: "T-bar row", category: ExerciseCategory.UPPER_PULL, primaryMuscles: ["mid back", "lats"], equipment: ["t-bar"], difficulty: DifficultyLevel.MODERATE, cues: ["Buste incliné", "Coudes proches"] },
  { slug: "dumbbell-row", name: "Rowing haltère", category: ExerciseCategory.UPPER_PULL, primaryMuscles: ["lats", "mid back"], equipment: ["dumbbell", "bench"], difficulty: DifficultyLevel.EASY, cues: ["Main appuyée sur banc", "Tirez vers la hanche"] },
  { slug: "seated-cable-row", name: "Rowing poulie assis", category: ExerciseCategory.UPPER_PULL, primaryMuscles: ["mid back"], equipment: ["cable machine"], difficulty: DifficultyLevel.EASY, cues: ["Torse droit", "Serrez les omoplates"] },
  { slug: "machine-row", name: "Rowing machine", category: ExerciseCategory.UPPER_PULL, primaryMuscles: ["mid back", "lats"], equipment: ["machine"], difficulty: DifficultyLevel.EASY, cues: ["Torse contre le coussin", "Coudes vers l'arrière"] },
  { slug: "face-pull", name: "Face pull", category: ExerciseCategory.UPPER_PULL, primaryMuscles: ["rear delts", "upper back"], equipment: ["cable machine"], difficulty: DifficultyLevel.EASY, cues: ["Coudes hauts", "Tirez vers le visage"] },
  { slug: "barbell-curl", name: "Curl barre", category: ExerciseCategory.UPPER_PULL, primaryMuscles: ["biceps"], equipment: ["barbell"], difficulty: DifficultyLevel.EASY, cues: ["Coudes fixes", "Pas de balancement"] },
  { slug: "preacher-curl-machine", name: "Preacher curl machine", category: ExerciseCategory.UPPER_PULL, primaryMuscles: ["biceps"], equipment: ["machine"], difficulty: DifficultyLevel.EASY, cues: ["Bras bien calés", "Amplitude contrôlée"] },
  { slug: "hammer-curl", name: "Curl marteau", category: ExerciseCategory.UPPER_PULL, primaryMuscles: ["biceps", "brachialis"], equipment: ["dumbbell"], difficulty: DifficultyLevel.EASY, cues: ["Paumes face à face", "Tempo contrôlé"] },
  { slug: "cable-curl", name: "Curl poulie basse", category: ExerciseCategory.UPPER_PULL, primaryMuscles: ["biceps"], equipment: ["cable machine"], difficulty: DifficultyLevel.EASY, cues: ["Coudes fixes", "Contrôlez la descente"] },

  // ─── Full body ──────────────────────────────────────────
  { slug: "deadlift", name: "Soulevé de terre", category: ExerciseCategory.FULL_BODY, primaryMuscles: ["posterior chain"], equipment: ["barbell"], difficulty: DifficultyLevel.BRUTAL, cues: ["Dos neutre", "Poussez le sol", "Verrouillez les hanches en haut"], thumbnailUrl: U("photo-1517963879433-6ad2b056d712") },
  { slug: "sumo-deadlift", name: "Soulevé sumo", category: ExerciseCategory.FULL_BODY, primaryMuscles: ["glutes", "quads"], equipment: ["barbell"], difficulty: DifficultyLevel.HARD, cues: ["Pieds larges", "Barre proche"] },
  { slug: "trap-bar-deadlift", name: "Trap bar deadlift", category: ExerciseCategory.FULL_BODY, primaryMuscles: ["posterior chain"], equipment: ["trap bar"], difficulty: DifficultyLevel.MODERATE, cues: ["Dos neutre", "Poussez le sol"] },
  { slug: "clean-and-press", name: "Épaulé jeté", category: ExerciseCategory.FULL_BODY, primaryMuscles: ["full body"], equipment: ["barbell"], difficulty: DifficultyLevel.BRUTAL, cues: ["Mouvement explosif", "Réception gainée"] },
  { slug: "kettlebell-swing", name: "Kettlebell swing", category: ExerciseCategory.FULL_BODY, primaryMuscles: ["glutes", "hamstrings", "back"], equipment: ["kettlebell"], difficulty: DifficultyLevel.MODERATE, cues: ["Hanches en arrière", "Explosivité des hanches"], thumbnailUrl: U("photo-1604480132715-59c471af6d25") },
  { slug: "thruster", name: "Thruster", category: ExerciseCategory.FULL_BODY, primaryMuscles: ["full body"], equipment: ["barbell"], difficulty: DifficultyLevel.HARD, cues: ["Squat complet", "Poussée continue au-dessus"] },
  { slug: "burpee", name: "Burpee", category: ExerciseCategory.FULL_BODY, primaryMuscles: ["full body"], equipment: [], difficulty: DifficultyLevel.HARD, isOutdoor: true, cues: ["Saut explosif", "Réception souple"] },
  { slug: "wall-ball", name: "Wall ball", category: ExerciseCategory.FULL_BODY, primaryMuscles: ["full body"], equipment: ["medicine ball"], difficulty: DifficultyLevel.MODERATE, cues: ["Squat complet", "Lancer vertical"] },
  { slug: "farmer-carry", name: "Farmer carry", category: ExerciseCategory.FULL_BODY, primaryMuscles: ["grip", "core", "traps"], equipment: ["dumbbell"], difficulty: DifficultyLevel.MODERATE, cues: ["Épaules en arrière", "Pas rapides"] },

  // ─── Core ───────────────────────────────────────────────
  { slug: "plank", name: "Planche", category: ExerciseCategory.CORE, primaryMuscles: ["core"], equipment: [], difficulty: DifficultyLevel.EASY, cues: ["Alignement tête-talons", "Fessiers serrés"] },
  { slug: "side-plank", name: "Planche latérale", category: ExerciseCategory.CORE, primaryMuscles: ["obliques", "core"], equipment: [], difficulty: DifficultyLevel.MODERATE, cues: ["Hanches hautes", "Corps aligné"] },
  { slug: "hanging-leg-raise", name: "Relevé de jambes suspendu", category: ExerciseCategory.CORE, primaryMuscles: ["lower abs"], equipment: ["pull-up bar"], difficulty: DifficultyLevel.HARD, cues: ["Contrôle total", "Pas de balance"] },
  { slug: "ab-wheel-rollout", name: "Roue abdominale", category: ExerciseCategory.CORE, primaryMuscles: ["core"], equipment: ["ab wheel"], difficulty: DifficultyLevel.HARD, cues: ["Dos neutre", "Tronc gainé"] },
  { slug: "russian-twist", name: "Russian twist", category: ExerciseCategory.CORE, primaryMuscles: ["obliques"], equipment: ["medicine ball"], difficulty: DifficultyLevel.MODERATE, cues: ["Dos droit", "Tournez le tronc, pas les bras"] },
  { slug: "dead-bug", name: "Dead bug", category: ExerciseCategory.CORE, primaryMuscles: ["core"], equipment: [], difficulty: DifficultyLevel.EASY, cues: ["Lombaires plaquées", "Mouvements opposés"] },
  { slug: "cable-woodchop", name: "Cable woodchop", category: ExerciseCategory.CORE, primaryMuscles: ["obliques", "core"], equipment: ["cable machine"], difficulty: DifficultyLevel.MODERATE, cues: ["Pivotez des hanches", "Bras quasi tendus"] },
  { slug: "ab-crunch-machine", name: "Crunch machine", category: ExerciseCategory.CORE, primaryMuscles: ["abs"], equipment: ["machine"], difficulty: DifficultyLevel.EASY, cues: ["Crunch complet", "Contraction en fin"] },

  // ─── Cardio / outdoor ───────────────────────────────────
  { slug: "running-interval", name: "Course fractionnée", category: ExerciseCategory.CARDIO, primaryMuscles: ["legs", "cardio"], equipment: [], difficulty: DifficultyLevel.MODERATE, isOutdoor: true, cues: ["Foulée courte", "Respiration régulière"], thumbnailUrl: U("photo-1461896836934-ffe607ba8211") },
  { slug: "running-tempo", name: "Course tempo", category: ExerciseCategory.CARDIO, primaryMuscles: ["cardio"], equipment: [], difficulty: DifficultyLevel.MODERATE, isOutdoor: true, cues: ["Allure confortable difficile", "Rythme constant"] },
  { slug: "running-easy", name: "Course endurance", category: ExerciseCategory.CARDIO, primaryMuscles: ["cardio"], equipment: [], difficulty: DifficultyLevel.EASY, isOutdoor: true, cues: ["Respiration nasale", "Conversation possible"] },
  { slug: "treadmill-run", name: "Tapis de course", category: ExerciseCategory.CARDIO, primaryMuscles: ["cardio", "legs"], equipment: ["treadmill"], difficulty: DifficultyLevel.EASY, cues: ["Posture droite", "Regard horizon"], thumbnailUrl: U("photo-1534258936925-c58bed479fcb") },
  { slug: "cycling-steady", name: "Vélo endurance", category: ExerciseCategory.CARDIO, primaryMuscles: ["legs", "cardio"], equipment: ["bike"], difficulty: DifficultyLevel.EASY, isOutdoor: true, cues: ["Cadence 80-90 rpm", "Position relaxée"] },
  { slug: "spin-bike", name: "Vélo spinning", category: ExerciseCategory.CARDIO, primaryMuscles: ["legs", "cardio"], equipment: ["bike"], difficulty: DifficultyLevel.HARD, cues: ["Selle bien réglée", "Cadence variable"], thumbnailUrl: U("photo-1534258936925-c58bed479fcb") },
  { slug: "rowing-machine", name: "Rameur", category: ExerciseCategory.CARDIO, primaryMuscles: ["full body"], equipment: ["rower"], difficulty: DifficultyLevel.MODERATE, cues: ["Jambes d'abord", "Corps puis bras"], thumbnailUrl: U("photo-1434596922112-19c563067271") },
  { slug: "assault-bike", name: "Assault bike", category: ExerciseCategory.CARDIO, primaryMuscles: ["full body"], equipment: ["assault bike"], difficulty: DifficultyLevel.HARD, cues: ["Poussez et tirez", "Respiration forte"] },
  { slug: "stair-climber", name: "Stair climber", category: ExerciseCategory.CARDIO, primaryMuscles: ["legs", "glutes", "cardio"], equipment: ["machine"], difficulty: DifficultyLevel.MODERATE, cues: ["Posture verticale", "Ne pas s'appuyer"] },
  { slug: "elliptical", name: "Elliptique", category: ExerciseCategory.CARDIO, primaryMuscles: ["cardio"], equipment: ["machine"], difficulty: DifficultyLevel.EASY, cues: ["Mouvement fluide", "Bras actifs"] },
  { slug: "jump-rope", name: "Corde à sauter", category: ExerciseCategory.CARDIO, primaryMuscles: ["calves", "cardio"], equipment: ["jump rope"], difficulty: DifficultyLevel.EASY, cues: ["Sauts bas", "Poignets actifs"] },
  { slug: "walking", name: "Marche", category: ExerciseCategory.CARDIO, primaryMuscles: ["cardio"], equipment: [], difficulty: DifficultyLevel.EASY, isOutdoor: true, cues: ["Rythme soutenu", "Respiration ample"] },

  // ─── Mobility / recovery ────────────────────────────────
  { slug: "world-greatest-stretch", name: "World's greatest stretch", category: ExerciseCategory.MOBILITY, primaryMuscles: ["full body"], equipment: [], difficulty: DifficultyLevel.EASY, cues: ["Respiration lente", "Amplitude progressive"] },
  { slug: "hip-flexor-stretch", name: "Étirement psoas", category: ExerciseCategory.MOBILITY, primaryMuscles: ["hip flexors"], equipment: [], difficulty: DifficultyLevel.EASY, cues: ["Bassin neutre", "30s par côté"] },
  { slug: "thoracic-rotation", name: "Mobilité thoracique", category: ExerciseCategory.MOBILITY, primaryMuscles: ["upper back"], equipment: [], difficulty: DifficultyLevel.EASY, cues: ["Regard suit la main", "Respirez profondément"] },
  { slug: "foam-roll-quads", name: "Foam roll quadriceps", category: ExerciseCategory.MOBILITY, primaryMuscles: ["quads"], equipment: ["foam roller"], difficulty: DifficultyLevel.EASY, cues: ["Pression tolérable", "Passages lents"] },
  { slug: "yoga-flow", name: "Yoga flow", category: ExerciseCategory.MOBILITY, primaryMuscles: ["full body"], equipment: [], difficulty: DifficultyLevel.EASY, cues: ["Respiration continue", "Transitions fluides"], thumbnailUrl: U("photo-1544367567-0f2fcb009e0b") },
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
