import { z } from "zod";

export const onboardingSchema = z
  .object({
  // Identity
  firstName: z.string().min(1).max(60),
  birthDate: z.coerce.date().refine((d) => d < new Date() && d > new Date("1900-01-01")),
  sex: z.enum(["MALE", "FEMALE", "OTHER"]),

  // Body
  heightCm: z.number().int().min(100).max(230),
  weightKg: z.number().min(30).max(300),
  fitnessLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ELITE"]),

  // Goal & context
  goals: z
    .array(z.enum(["WEIGHT_LOSS", "MUSCLE_GAIN", "ENDURANCE", "FITNESS", "HEALTH"]))
    .min(1, "Sélectionnez au moins un objectif.")
    .max(5, "Au-delà de 5 objectifs, le plan perd en focalisation."),
  environment: z.enum(["HOME", "GYM", "OUTDOOR"]),
  environments: z
    .array(z.enum(["HOME", "GYM", "OUTDOOR"]))
    .min(0)
    .max(3),
  customLocations: z.array(z.string().min(1).max(60)).max(5).default([]),
  sessionsPerWeek: z.number().int().min(1).max(7),
  sessionDurationMin: z.number().int().min(15).max(180).default(45),
  equipment: z.array(z.string()).default([]),
  outdoorAllowed: z.boolean().default(true),

  // Medical
  injuries: z.array(z.string()).default([]),
  conditions: z.array(z.string()).default([]),
  medications: z.array(z.string()).default([]),
  cardiacIssues: z.boolean().default(false),
  hypertension: z.boolean().default(false),
  diabetes: z.boolean().default(false),
  asthma: z.boolean().default(false),
  jointPain: z.boolean().default(false),
  backPain: z.boolean().default(false),
  pregnancy: z.boolean().default(false),
  surgeryRecent: z.boolean().default(false),

  // Lifestyle
  smokes: z.boolean().default(false),
  alcoholUnitsPerWeek: z.number().int().min(0).max(60).default(0),
  hoursOfSleep: z.number().int().min(3).max(14).default(7),
  stressLevel: z.number().int().min(1).max(10).default(5),

  // Sleep details
  nightShiftWork: z.boolean().default(false),
  wakesUpOften: z.boolean().default(false),
  insomnia: z.boolean().default(false),
  sleepAids: z.boolean().default(false),

  // Daily activity / work
  workActivity: z
    .enum(["sedentary", "moderate", "active", "very_active"])
    .default("moderate"),
  canMoveAtWork: z.boolean().default(true),

  // Hydration
  waterLitersPerDay: z.number().min(0).max(8).default(2),
  otherDrinks: z.array(z.string().min(1).max(40)).max(8).default([]),

  // Meals
  mealsPerDay: z.number().int().min(1).max(6).default(3),
  mealTypes: z
    .array(z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]))
    .max(4)
    .default([]),
  skipMealsFrequency: z.enum(["never", "sometimes", "often"]).default("never"),
  eatingOutPerWeek: z.number().int().min(0).max(21).default(0),
  mealQuality: z.number().int().min(1).max(10).default(6),
  snackingFrequency: z.enum(["never", "sometimes", "often"]).default("sometimes"),

  // Diet
  dietType: z
    .enum([
      "omnivore",
      "vegetarian",
      "vegan",
      "pescatarian",
      "gluten_free",
      "halal",
      "kosher",
      "other",
    ])
    .default("omnivore"),
  pastDiets: z.array(z.string().min(1).max(40)).max(10).default([]),
  pastDietsSatisfied: z.enum(["yes", "partial", "no"]).optional(),
  currentDiet: z.string().max(120).optional(),

  // Sports history
  sportsHistory: z.array(z.string().min(1).max(40)).max(15).default([]),
  sportsInterests: z.array(z.string().min(1).max(40)).max(15).default([]),
  sportLevel: z
    .enum(["recreational", "club", "competitive", "elite"])
    .default("recreational"),
  sportYears: z.number().int().min(0).max(60).default(0),

  // Coach preferences
  coachPersona: z.enum(["STRICT", "FUN", "ZEN", "MILITARY", "ELITE"]).default("FUN"),
  coachName: z.string().min(1).max(30).default("Pulse"),
  coachAvatar: z.string().min(1).max(30).default("default"),
  coachProfileSlug: z.string().min(1).max(60),

  // Coach appearance (sent as plain strings — catalog enforced client-side)
  coachPreferredGender: z.string().max(30).optional(),
  coachPreferredEthnicity: z.string().max(30).optional(),
  coachPreferredHairColor: z.string().max(30).optional(),
  coachPreferredHairStyle: z.string().max(30).optional(),
  coachPreferredFaceShape: z.string().max(30).optional(),
  coachPreferredEyeColor: z.string().max(30).optional(),
  coachPreferredEyeShape: z.string().max(30).optional(),
  coachPreferredSkinTone: z.string().max(30).optional(),
  coachPreferredMouth: z.string().max(30).optional(),
  coachPreferredNose: z.string().max(30).optional(),
  coachPreferredBodyHeight: z.string().max(30).optional(),
  coachPreferredBodyShape: z.string().max(30).optional(),
  coachOutfitTop: z.string().max(30).optional(),
  coachOutfitBottom: z.string().max(30).optional(),
  coachOutfitColor: z.string().max(30).optional(),
  coachOutfitStyle: z.string().max(30).optional(),

  // Notification preferences
  notificationsEnabled: z.boolean().default(true),
  notifWater: z.boolean().default(true),
  notifInactivity: z.boolean().default(true),
  notifSleep: z.boolean().default(true),
  notifSessionFeedback: z.boolean().default(true),
  notifUpcomingSession: z.boolean().default(true),
  notifEnergyCheckin: z.boolean().default(true),
  notifStreak: z.boolean().default(true),
  notifWeeklyRecap: z.boolean().default(false),

  // Consents
  consentMedicalDisclaimer: z
    .boolean()
    .refine((v) => v === true, { message: "Acceptation de l'avertissement médical requise." }),
  consentPhysicalData: z
    .boolean()
    .refine((v) => v === true, { message: "Consentement données physiques requis." }),
  consentHealthData: z
    .boolean()
    .refine((v) => v === true, { message: "Consentement données santé requis." }),
  consentCoachAI: z
    .boolean()
    .refine((v) => v === true, { message: "Consentement génération coach IA requis." }),
  consentDoctorCleared: z.boolean().default(false),
  consentTrainingData: z.boolean().default(false),
  consentAnalytics: z.boolean().default(false),
  })
  .refine((v) => v.environments.length + v.customLocations.length > 0, {
    message: "Sélectionnez au moins un lieu (ou ajoutez-en un en \"Autre\").",
    path: ["environments"],
  });

export type OnboardingInput = z.infer<typeof onboardingSchema>;
