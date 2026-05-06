import { openai, models } from "@/lib/ai/openai";
import type { Profile, HealthProfile, Goal } from "@prisma/client";

export type PlanConstraints = {
  weeks?: number;                     // default 4
  sessionsPerWeek?: number;           // override
  sessionDurationMin?: number;        // override
  focus?: string;                     // "haut du corps", "force+cardio", ...
  avoid?: string[];                   // zones à éviter (blessures, etc.)
  daysOff?: string[];                 // ISO dates où on ne peut pas s'entraîner
  intensityBias?: "light" | "balanced" | "intense";
  goalOverride?: Goal;                // override of profile.goal for this plan
  extraContext?: string;              // free text from user conversation
  startDate?: string;                 // ISO date, default today
};

export type GeneratedPlan = {
  name: string;
  summary: string;
  weeks: number;
  sessionsPerWeek: number;
  goal: Goal;
  sessions: Array<{
    dayOffset: number;
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
      weeks: { type: "integer", minimum: 1, maximum: 16 },
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

export async function generateConstrainedPlan(input: {
  profile: Profile;
  health: HealthProfile;
  exerciseCatalog: Array<{ slug: string; name: string; category: string; equipment: string[] }>;
  constraints: PlanConstraints;
}): Promise<GeneratedPlan> {
  const { profile, health, exerciseCatalog, constraints } = input;
  if (!openai) return fallbackPlan({ profile, health, constraints });
  const client = openai;

  const age = new Date().getFullYear() - profile.birthDate.getFullYear();
  const goal = constraints.goalOverride ?? profile.goal;
  const allGoals = profile.goals?.length ? profile.goals : [profile.goal];
  const allEnvs = profile.environments?.length ? profile.environments : [profile.environment];

  const catalogHint = exerciseCatalog.slice(0, 120).map((e) => e.slug).join(", ");

  const userBlock = `
Profil utilisateur :
- Âge ${age}, Sexe ${profile.sex}, ${profile.heightCm} cm / ${profile.weightKg} kg
- Niveau ${profile.fitnessLevel}, Objectif principal ${goal}, autres objectifs : ${allGoals.filter((g) => g !== goal).join(", ") || "—"}
- Lieux d'entraînement : ${allEnvs.join(" + ")}
- Séances habituelles : ${health.sessionsPerWeek}/sem (${health.sessionDurationMin} min)
- Matériel : ${health.equipment.join(", ") || "aucun"}
- Outdoor autorisé : ${health.outdoorAllowed}
- Antécédents santé : cardiaque=${health.cardiacIssues} hypertension=${health.hypertension} diabète=${health.diabetes} asthme=${health.asthma} articulations=${health.jointPain} dos=${health.backPain} grossesse=${health.pregnancy} chir. récente=${health.surgeryRecent}
- Blessures : ${health.injuries.join(", ") || "aucune"}
- Pathologies : ${health.conditions.join(", ") || "aucune"}
- Médicaments : ${health.medications.join(", ") || "aucun"}
`.trim();

  const constraintsBlock = `
Contraintes utilisateur pour CE plan :
- Durée du plan : ${constraints.weeks ?? 4} semaines
- Séances / semaine : ${constraints.sessionsPerWeek ?? health.sessionsPerWeek}
- Durée par séance : ${constraints.sessionDurationMin ?? health.sessionDurationMin} min
- Intensité : ${constraints.intensityBias ?? "balanced"}
- Focus : ${constraints.focus ?? "objectif global"}
- Zones à éviter : ${(constraints.avoid ?? []).join(", ") || "aucune"}
- Jours off imposés : ${(constraints.daysOff ?? []).join(", ") || "aucun"}
- Date de démarrage : ${constraints.startDate ?? new Date().toISOString().slice(0, 10)}
- Contexte libre : ${constraints.extraContext ?? "—"}
`.trim();

  const prompt = `Tu es un préparateur physique certifié S&C. Crée un plan sûr, progressif et personnalisé.
${userBlock}

${constraintsBlock}

Règles :
- dayOffset=0 est la date de démarrage, +1 est le jour suivant, etc.
- Distribue les séances sur la semaine selon sessionsPerWeek, évite 2 séances intenses consécutives.
- Ajuste la difficulté si contraintes santé majeures (cardiaque, hypertension, grossesse, chir. récente).
- Utilise uniquement les slugs fournis dans le catalogue suivant :
${catalogHint}
- Inclut au moins 1 séance de mobilité/récupération par semaine.
- Retourne STRICTEMENT du JSON conforme au schéma.`;

  try {
    const res = await client.chat.completions.create({
      model: models.coach,
      messages: [
        { role: "system", content: "Tu es un coach expert. Output strict JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_schema", json_schema: PLAN_JSON_SCHEMA as never },
      temperature: 0.4,
    });
    const raw = res.choices[0]?.message?.content;
    if (!raw) return fallbackPlan({ profile, health, constraints });
    return JSON.parse(raw) as GeneratedPlan;
  } catch {
    return fallbackPlan({ profile, health, constraints });
  }
}

function fallbackPlan({
  profile,
  health,
  constraints,
}: {
  profile: Profile;
  health: HealthProfile;
  constraints: PlanConstraints;
}): GeneratedPlan {
  const sessionsPerWeek = Math.max(
    1,
    Math.min(7, constraints.sessionsPerWeek ?? health.sessionsPerWeek),
  );
  const weeks = constraints.weeks ?? 4;
  const goal = constraints.goalOverride ?? profile.goal;
  return {
    name: `${profile.firstName} · ${goal.toLowerCase().replace("_", " ")} · ${weeks} sem`,
    summary:
      "Plan généré localement (mode hors-ligne). Progression modérée, focus forme + endurance.",
    weeks,
    sessionsPerWeek,
    goal,
    sessions: Array.from({ length: sessionsPerWeek * weeks }).map((_, i) => {
      const mod = i % 3;
      return {
        dayOffset: i * Math.floor(7 / sessionsPerWeek),
        title:
          mod === 0
            ? "Force full body"
            : mod === 1
              ? "Cardio intervalles"
              : "Mobilité & gainage",
        type: mod === 0 ? "STRENGTH" : mod === 1 ? "HIIT" : "MOBILITY",
        durationMin: constraints.sessionDurationMin ?? 45,
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
              : [{ exercise: "plank", sets: 3, durationSec: 45, restSec: 30 }],
      };
    }),
  };
}
