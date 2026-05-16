import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { onboardingSchema } from "@/lib/validation/onboarding";
import { generatePlan } from "@/services/plan-generator";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = onboardingSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;
  const userId = session.user.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const profile = await tx.profile.upsert({
        where: { userId },
        update: {
          firstName: data.firstName,
          birthDate: data.birthDate,
          sex: data.sex,
          heightCm: data.heightCm,
          weightKg: data.weightKg,
          fitnessLevel: data.fitnessLevel,
          goal: data.goals[0]!,
          goals: data.goals,
          environment: data.environments[0] ?? data.environment,
          environments: data.environments,
          customLocations: data.customLocations,
        },
        create: {
          userId,
          firstName: data.firstName,
          birthDate: data.birthDate,
          sex: data.sex,
          heightCm: data.heightCm,
          weightKg: data.weightKg,
          fitnessLevel: data.fitnessLevel,
          goal: data.goals[0]!,
          goals: data.goals,
          environment: data.environments[0] ?? data.environment,
          environments: data.environments,
          customLocations: data.customLocations,
        },
      });

      const healthData = {
        injuries: data.injuries,
        conditions: data.conditions,
        medications: data.medications,
        cardiacIssues: data.cardiacIssues,
        hypertension: data.hypertension,
        diabetes: data.diabetes,
        asthma: data.asthma,
        jointPain: data.jointPain,
        backPain: data.backPain,
        pregnancy: data.pregnancy,
        surgeryRecent: data.surgeryRecent,
        smokes: data.smokes,
        alcoholUnitsPerWeek: data.alcoholUnitsPerWeek,
        hoursOfSleep: data.hoursOfSleep,
        stressLevel: data.stressLevel,
        nightShiftWork: data.nightShiftWork,
        wakesUpOften: data.wakesUpOften,
        insomnia: data.insomnia,
        sleepAids: data.sleepAids,
        workActivity: data.workActivity,
        canMoveAtWork: data.canMoveAtWork,
        waterLitersPerDay: data.waterLitersPerDay,
        otherDrinks: data.otherDrinks,
        mealsPerDay: data.mealsPerDay,
        mealTypes: data.mealTypes,
        skipMealsFrequency: data.skipMealsFrequency,
        eatingOutPerWeek: data.eatingOutPerWeek,
        mealQuality: data.mealQuality,
        snackingFrequency: data.snackingFrequency,
        dietType: data.dietType,
        pastDiets: data.pastDiets,
        pastDietsSatisfied: data.pastDietsSatisfied,
        currentDiet: data.currentDiet,
        sportsHistory: data.sportsHistory,
        sportsInterests: data.sportsInterests,
        sportLevel: data.sportLevel,
        sportYears: data.sportYears,
        sessionsPerWeek: data.sessionsPerWeek,
        sessionDurationMin: data.sessionDurationMin,
        equipment: data.equipment,
        outdoorAllowed: data.outdoorAllowed,
        consentHealthData: data.consentHealthData,
        consentMedicalDisclaimer: data.consentMedicalDisclaimer,
        consentDoctorCleared: data.consentDoctorCleared,
      };

      const health = await tx.healthProfile.upsert({
        where: { userId },
        update: healthData,
        create: { userId, ...healthData },
      });

      const notifications = {
        enabled: data.notificationsEnabled,
        water: data.notifWater,
        inactivity: data.notifInactivity,
        sleep: data.notifSleep,
        sessionFeedback: data.notifSessionFeedback,
        upcomingSession: data.notifUpcomingSession,
        energyCheckin: data.notifEnergyCheckin,
        streak: data.notifStreak,
        weeklyRecap: data.notifWeeklyRecap,
      };

      const coachPrefs = {
        coachPersona: data.coachPersona,
        coachName: data.coachName,
        coachAvatar: data.coachAvatar,
        coachPreferredGender: data.coachPreferredGender,
        coachPreferredEthnicity: data.coachPreferredEthnicity,
        coachPreferredHairColor: data.coachPreferredHairColor,
        coachPreferredHairStyle: data.coachPreferredHairStyle,
        coachPreferredFaceShape: data.coachPreferredFaceShape,
        coachPreferredEyeColor: data.coachPreferredEyeColor,
        coachPreferredEyeShape: data.coachPreferredEyeShape,
        coachPreferredSkinTone: data.coachPreferredSkinTone,
        coachPreferredMouth: data.coachPreferredMouth,
        coachPreferredNose: data.coachPreferredNose,
        coachPreferredBodyHeight: data.coachPreferredBodyHeight,
        coachPreferredBodyShape: data.coachPreferredBodyShape,
        coachOutfitTop: data.coachOutfitTop,
        coachOutfitBottom: data.coachOutfitBottom,
        coachOutfitColor: data.coachOutfitColor,
        coachOutfitStyle: data.coachOutfitStyle,
        notifications,
      };
      await tx.preference.upsert({
        where: { userId },
        update: coachPrefs,
        create: { userId, ...coachPrefs },
      });

      await tx.consent.createMany({
        data: [
          { userId, kind: "medical_disclaimer", granted: data.consentMedicalDisclaimer, version: "1.0" },
          { userId, kind: "physical_data", granted: data.consentPhysicalData, version: "1.0" },
          { userId, kind: "health_data", granted: data.consentHealthData, version: "1.0" },
          { userId, kind: "training_data", granted: data.consentTrainingData, version: "1.0" },
          { userId, kind: "coach_ai", granted: data.consentCoachAI, version: "1.0" },
          { userId, kind: "analytics", granted: data.consentAnalytics, version: "1.0" },
          { userId, kind: "doctor_cleared", granted: data.consentDoctorCleared, version: "1.0" },
        ],
      });

      await tx.streak.upsert({ where: { userId }, update: {}, create: { userId } });
      await tx.weightLog.create({ data: { userId, weightKg: data.weightKg } });

      return { profile, health };
    });

    const plan = await generatePlan({ profile: result.profile, health: result.health });

    const slugs = Array.from(new Set(plan.sessions.flatMap((s) => s.blocks.map((b) => b.exercise))));
    const exercises = await prisma.exercise.findMany({ where: { slug: { in: slugs } } });
    const slugToId = new Map(exercises.map((e) => [e.slug, e.id]));

    await prisma.trainingPlan.create({
      data: {
        userId,
        name: plan.name,
        summary: plan.summary,
        weeks: plan.weeks,
        sessionsPerWeek: plan.sessionsPerWeek,
        goal: plan.goal,
        payload: plan as unknown as object,
        workouts: {
          create: plan.sessions.map((s) => ({
            userId,
            type: s.type,
            scheduledFor: new Date(Date.now() + s.dayOffset * 24 * 3600 * 1000),
            status: "PLANNED",
            sets: {
              create: s.blocks
                .filter((b) => slugToId.has(b.exercise))
                .map((b, i) => ({
                  exerciseId: slugToId.get(b.exercise)!,
                  orderIndex: i,
                  targetReps: b.reps,
                  targetSets: b.sets,
                  restSec: b.restSec,
                  targetTempo: b.tempo,
                })),
            },
          })),
        },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    logger.error("onboarding_failed", { error: e instanceof Error ? e.message : String(e) });
    return NextResponse.json({ error: "Onboarding failed" }, { status: 500 });
  }
}
