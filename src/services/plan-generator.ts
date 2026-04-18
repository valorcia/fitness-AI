import { openai, models } from "@/lib/ai/openai";
import type { Profile, HealthProfile, Goal } from "@prisma/client";

type PlanInput = {
  profile: Profile;
  health: HealthProfile;
};

export type GeneratedPlan = {
  name: string;
  summary: string;
  weeks: number;
  sessionsPerWeek: number;
  goal: Goal;
  sessions: Array<{
    dayOffset: number; // 0..n
    title: string;
    type: "STRENGTH" | "HIIT" | "CARDIO_RUN" | "CARDIO_BIKE" | "WALK" | "MOBILITY" | "RECOVERY";
    durationMin: number;
    blocks: Array<{
      exercise: string; // slug
      sets: number;
      reps?: number;
      durationSec?: number;
      restSec?: number;
      tempo?: string;
    }>;
  }>;
};

const PLAN_JSON_SCHEMA = {
  name: "training_plan",
  schema: {
    type: "object",
    required: ["name", "summary", "weeks", "sessionsPerWeek", "goal", "sessions"],
    properties: {
      name: { type: "string" },
      summary: { type: "string" },
      weeks: { type: "integer", minimum: 2, maximum: 12 },
      sessionsPerWeek: { type: "integer", minimum: 1, maximum: 7 },
      goal: {
        type: "string",
        enum: ["WEIGHT_LOSS", "MUSCLE_GAIN", "ENDURANCE", "FITNESS", "HEALTH"],
      },
      sessions: {
        type: "array",
        items: {
          type: "object",
          required: ["dayOffset", "title", "type", "durationMin", "blocks"],
          properties: {
            dayOffset: { type: "integer", minimum: 0 },
            title: { type: "string" },
            type: {
              type: "string",
              enum: [
                "STRENGTH",
                "HIIT",
                "CARDIO_RUN",
                "CARDIO_BIKE",
                "WALK",
                "MOBILITY",
                "RECOVERY",
              ],
            },
            durationMin: { type: "integer", minimum: 10, maximum: 180 },
            blocks: {
              type: "array",
              items: {
                type: "object",
                required: ["exercise", "sets"],
                properties: {
                  exercise: { type: "string" },
                  sets: { type: "integer", minimum: 1 },
                  reps: { type: "integer" },
                  durationSec: { type: "integer" },
                  restSec: { type: "integer" },
                  tempo: { type: "string" },
                },
                additionalProperties: false,
              },
            },
          },
          additionalProperties: false,
        },
      },
    },
    additionalProperties: false,
  },
};

export async function generatePlan(input: PlanInput): Promise<GeneratedPlan> {
  const { profile, health } = input;
  if (!openai) return fallbackPlan(input);

  const prompt = `
Generate a safe, progressive 4-week training plan for:
- Age: ${new Date().getFullYear() - profile.birthDate.getFullYear()}
- Sex: ${profile.sex}
- Height/Weight: ${profile.heightCm}cm / ${profile.weightKg}kg
- Level: ${profile.fitnessLevel}
- Goal: ${profile.goal}
- Environment: ${profile.environment}
- Sessions/week: ${health.sessionsPerWeek}
- Equipment: ${health.equipment.join(", ") || "none"}
- Outdoor allowed: ${health.outdoorAllowed}
- Cardiac issues: ${health.cardiacIssues}
- Joint pain: ${health.jointPain}
- Injuries: ${health.injuries.join(", ") || "none"}
Respect contraindications. Progressive overload. Include recovery days.
Use exercise slugs from this catalog: barbell-back-squat, bench-press, pull-up, deadlift, plank, burpee, running-interval.
`.trim();

  try {
    const res = await openai.chat.completions.create({
      model: models.coach,
      messages: [
        { role: "system", content: "You are a certified strength & conditioning coach. Output strict JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_schema", json_schema: PLAN_JSON_SCHEMA as never },
      temperature: 0.4,
    });
    const raw = res.choices[0]?.message?.content;
    if (!raw) return fallbackPlan(input);
    return JSON.parse(raw) as GeneratedPlan;
  } catch {
    return fallbackPlan(input);
  }
}

function fallbackPlan({ profile, health }: PlanInput): GeneratedPlan {
  const sessionsPerWeek = Math.max(1, Math.min(health.sessionsPerWeek, 5));
  return {
    name: `${profile.firstName}'s ${profile.goal.toLowerCase()} plan`,
    summary:
      "Plan générique conçu côté serveur (fallback). Progression modérée, focus forme + endurance.",
    weeks: 4,
    sessionsPerWeek,
    goal: profile.goal,
    sessions: Array.from({ length: sessionsPerWeek * 4 }).map((_, i) => {
      const mod = i % 3;
      return {
        dayOffset: i * Math.floor(7 / sessionsPerWeek),
        title:
          mod === 0 ? "Force full body" : mod === 1 ? "Cardio intervalles" : "Mobilité & gainage",
        type: mod === 0 ? "STRENGTH" : mod === 1 ? "HIIT" : "MOBILITY",
        durationMin: 45,
        blocks:
          mod === 0
            ? [
                { exercise: "barbell-back-squat", sets: 4, reps: 6, restSec: 120 },
                { exercise: "bench-press", sets: 4, reps: 8, restSec: 90 },
                { exercise: "pull-up", sets: 3, reps: 6, restSec: 120 },
              ]
            : mod === 1
              ? [
                  { exercise: "burpee", sets: 6, durationSec: 30, restSec: 30 },
                  { exercise: "running-interval", sets: 6, durationSec: 60, restSec: 60 },
                ]
              : [
                  { exercise: "plank", sets: 3, durationSec: 45, restSec: 30 },
                ],
      };
    }),
  };
}
