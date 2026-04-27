import { z } from "zod";

export const onboardingSchema = z.object({
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
    .max(3, "Maximum 3 objectifs simultanés."),
  environment: z.enum(["HOME", "GYM", "OUTDOOR"]),
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

  // Coach preferences
  coachPersona: z.enum(["STRICT", "FUN", "ZEN", "MILITARY", "ELITE"]).default("FUN"),
  coachName: z.string().min(1).max(30).default("Pulse"),
  coachAvatar: z.string().min(1).max(30).default("default"),

  // Consents
  consentHealthData: z
    .boolean()
    .refine((v) => v === true, { message: "Consentement données santé requis." }),
  consentMedicalDisclaimer: z
    .boolean()
    .refine((v) => v === true, { message: "Acceptation de l'avertissement médical requise." }),
  consentDoctorCleared: z.boolean().default(false),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
