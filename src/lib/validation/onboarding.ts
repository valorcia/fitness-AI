import { z } from "zod";

export const onboardingSchema = z.object({
  firstName: z.string().min(1).max(60),
  birthDate: z.coerce.date().refine((d) => d < new Date() && d > new Date("1900-01-01")),
  sex: z.enum(["MALE", "FEMALE", "OTHER"]),
  heightCm: z.number().int().min(100).max(230),
  weightKg: z.number().min(30).max(300),
  fitnessLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ELITE"]),
  goal: z.enum(["WEIGHT_LOSS", "MUSCLE_GAIN", "ENDURANCE", "FITNESS", "HEALTH"]),
  environment: z.enum(["HOME", "GYM", "OUTDOOR"]),
  injuries: z.array(z.string()).default([]),
  cardiacIssues: z.boolean().default(false),
  jointPain: z.boolean().default(false),
  sessionsPerWeek: z.number().int().min(1).max(7),
  equipment: z.array(z.string()).default([]),
  outdoorAllowed: z.boolean().default(true),
  consentHealthData: z
    .boolean()
    .refine((v) => v === true, { message: "Consentement données santé requis." }),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
