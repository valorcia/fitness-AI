import { PrismaClient, ExerciseCategory, DifficultyLevel } from "@prisma/client";

const prisma = new PrismaClient();

const EXERCISES = [
  {
    slug: "barbell-back-squat",
    name: "Barbell Back Squat",
    category: ExerciseCategory.LOWER,
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: ["hamstrings", "core"],
    equipment: ["barbell", "rack"],
    difficulty: DifficultyLevel.HARD,
    cues: ["Chest proud", "Knees tracking toes", "Drive through heels"],
  },
  {
    slug: "bench-press",
    name: "Barbell Bench Press",
    category: ExerciseCategory.UPPER_PUSH,
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front delts"],
    equipment: ["barbell", "bench"],
    difficulty: DifficultyLevel.MODERATE,
    cues: ["Scapula retracted", "Bar to mid-chest", "Controlled eccentric"],
  },
  {
    slug: "pull-up",
    name: "Pull-up",
    category: ExerciseCategory.UPPER_PULL,
    primaryMuscles: ["lats", "biceps"],
    equipment: ["pull-up bar"],
    difficulty: DifficultyLevel.HARD,
    cues: ["Full hang", "Drive elbows down", "Chin over bar"],
  },
  {
    slug: "deadlift",
    name: "Conventional Deadlift",
    category: ExerciseCategory.FULL_BODY,
    primaryMuscles: ["posterior chain"],
    equipment: ["barbell"],
    difficulty: DifficultyLevel.BRUTAL,
    cues: ["Neutral spine", "Push floor away", "Lock hips at top"],
  },
  {
    slug: "plank",
    name: "Plank",
    category: ExerciseCategory.CORE,
    primaryMuscles: ["core"],
    equipment: [],
    difficulty: DifficultyLevel.EASY,
    cues: ["Line from head to heels", "Squeeze glutes", "Breathe"],
  },
  {
    slug: "burpee",
    name: "Burpee",
    category: ExerciseCategory.FULL_BODY,
    primaryMuscles: ["full body"],
    equipment: [],
    difficulty: DifficultyLevel.HARD,
    isOutdoor: true,
    cues: ["Explosive jump", "Soft landing", "Full plank"],
  },
  {
    slug: "running-interval",
    name: "Running Interval",
    category: ExerciseCategory.CARDIO,
    primaryMuscles: ["legs", "cardio"],
    equipment: [],
    difficulty: DifficultyLevel.MODERATE,
    isOutdoor: true,
    cues: ["Short steps", "Breathe steady", "Relax shoulders"],
  },
];

const BADGES = [
  { slug: "first-workout", name: "First Rep", description: "Complete your first workout.", tier: "bronze", xpReward: 50 },
  { slug: "week-streak", name: "On Fire", description: "7-day streak.", tier: "silver", xpReward: 150 },
  { slug: "month-streak", name: "Unstoppable", description: "30-day streak.", tier: "gold", xpReward: 500 },
  { slug: "first-5k", name: "5K Finisher", description: "Run 5km in one session.", tier: "silver", xpReward: 200 },
  { slug: "elite-member", name: "Elite", description: "Subscribed to Elite tier.", tier: "platinum", xpReward: 1000 },
];

async function main() {
  for (const ex of EXERCISES) {
    await prisma.exercise.upsert({
      where: { slug: ex.slug },
      update: ex,
      create: ex,
    });
  }
  for (const b of BADGES) {
    await prisma.badge.upsert({
      where: { slug: b.slug },
      update: b,
      create: b,
    });
  }
  await prisma.featureFlag.upsert({
    where: { key: "voice_coach" },
    update: {},
    create: { key: "voice_coach", enabled: true, rollout: 100 },
  });
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
