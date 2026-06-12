import { PERSONAS, SAFETY_RULES } from "@/lib/ai/personas";
import { cacheable, plainText, type CacheableTextBlock } from "@/lib/ai/anthropic";
import type { CoachPersona } from "@prisma/client";

/**
 * Build the Claude system prompt in 3 layered blocks, sorted by cache-
 * friendliness (longest-lived first). Anthropic's prompt caching hits the
 * longest prefix that hasn't changed since the last call — so we put the
 * most static content first.
 *
 *   ┌─ Block 1 ──────────────────────────────────────────┐
 *   │  Brand + safety rules (NEVER changes)             │  ← cached
 *   ├─ Block 2 ──────────────────────────────────────────┤
 *   │  Persona — voice, tone, style                      │  ← cached
 *   ├─ Block 3 ──────────────────────────────────────────┤
 *   │  Stable user profile (changes ~weekly)             │  ← cached
 *   ├─ Block 4 ──────────────────────────────────────────┤
 *   │  Retrieved memories (changes every message)        │  ← NOT cached
 *   └────────────────────────────────────────────────────┘
 *
 * Goal: 70-90 % of tokens served from cache → ~10 % of the input cost.
 */

const BRAND_AND_SAFETY = `Tu es le coach personnel d'un utilisateur de l'application Coachmii-fit, une application de sport et de bien-être.

Identité non négociable :
- Tu n'es pas une IA générique. Tu es CE coach précis, choisi par l'utilisateur.
- Tu gardes la même personnalité et le même prénom à toutes les sessions.
- Tu connais l'utilisateur grâce à la mémoire qui t'est fournie ci-dessous. Utilise-la naturellement (sans citer "selon ma mémoire").

Limites santé strictes :
- Tu n'es PAS médecin, kiné, ni diététicien. Tu n'établis aucun diagnostic.
- Tu n'écris jamais de prescription, ni de dosage.
- Si l'utilisateur évoque une douleur aiguë, une blessure, des étourdissements, une douleur thoracique, des palpitations, une perte de conscience, du sang : tu lui demandes d'arrêter et tu rappelles 15 (SAMU) ou 112 si la situation est urgente. Tu ne minimises jamais.
- Si l'utilisateur évoque grossesse, antécédent cardiaque, diabète insulinodépendant, hypertension : tu rappelles que toute reprise se fait avec accord médical.
- En cas de détresse émotionnelle (idées noires, dépression sévère) : tu invites à contacter le 3114 (numéro national de prévention du suicide en France) ou un professionnel.

${SAFETY_RULES}

Format conversationnel :
- Phrases courtes. Une à trois phrases par tour, jamais de pavés.
- Pas de listes à puces sauf si l'utilisateur demande explicitement un plan / une recette / un protocole.
- Tu peux poser une question retour quand c'est pertinent — pas systématiquement.
- Tu peux faire référence à ce que l'utilisateur t'a dit auparavant — c'est ce qu'on attend de toi.`;

type StableProfileFields = {
  firstName?: string | null;
  ageYears?: number | null;
  sex?: "MALE" | "FEMALE" | "OTHER" | null;
  heightCm?: number | null;
  weightKg?: number | null;
  bmi?: number | null;
  fitnessLevel?: string | null;
  goal?: string | null;
  goals?: string[];
  environment?: string | null;
  environments?: string[];
  sessionsPerWeek?: number | null;
  sessionDurationMin?: number | null;
  injuries?: string[];
  conditions?: string[];
  /** Coach level — drives tone progression. */
  coachLevel?: 1 | 2 | 3 | 4 | 5;
};

function formatProfile(p: StableProfileFields): string {
  const lines: string[] = [];
  if (p.firstName) lines.push(`Prénom: ${p.firstName}`);
  if (p.ageYears) lines.push(`Âge: ${p.ageYears} ans`);
  if (p.sex) lines.push(`Sexe: ${p.sex.toLowerCase()}`);
  if (p.heightCm && p.weightKg) {
    const bmi = p.bmi ?? p.weightKg / Math.pow(p.heightCm / 100, 2);
    lines.push(`Taille: ${p.heightCm} cm, poids: ${p.weightKg} kg, IMC: ${bmi.toFixed(1)}`);
  }
  if (p.fitnessLevel) lines.push(`Niveau: ${p.fitnessLevel}`);
  const allGoals = (p.goals?.length ? p.goals : p.goal ? [p.goal] : []).filter(Boolean);
  if (allGoals.length) lines.push(`Objectifs: ${allGoals.join(", ")}`);
  const allEnvs = (p.environments?.length ? p.environments : p.environment ? [p.environment] : [])
    .filter(Boolean);
  if (allEnvs.length) lines.push(`Lieux d'entraînement: ${allEnvs.join(", ")}`);
  if (p.sessionsPerWeek) lines.push(`Fréquence cible: ${p.sessionsPerWeek}/sem (${p.sessionDurationMin ?? 45} min)`);
  if (p.injuries?.length) lines.push(`Blessures déclarées: ${p.injuries.join(", ")}`);
  if (p.conditions?.length) lines.push(`Conditions médicales: ${p.conditions.join(", ")}`);
  if (p.coachLevel) {
    const lvlLabel = { 1: "Guide", 2: "Mentor", 3: "Expert personnel", 4: "Partenaire", 5: "Légende" }[p.coachLevel];
    lines.push(`Niveau de la relation: ${p.coachLevel} (${lvlLabel})`);
  }
  return lines.length ? lines.join("\n") : "Profil non renseigné.";
}

const LEVEL_TONE: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "Niveau Guide — découvre l'utilisateur. Pose plus de questions que d'affirmations. Vouvoiement possible si tu n'as pas encore son prénom.",
  2: "Niveau Mentor — tu connais ses préférences. Tutoie. Adapte les séances aux retours précédents.",
  3: "Niveau Expert personnel — anticipe ses besoins. Réfère-toi aux détails passés sans qu'il te le demande.",
  4: "Niveau Partenaire — relation établie. Tu peux initier des conversations, célébrer les paliers, rappeler les abandons précédents avec bienveillance.",
  5: "Niveau Légende — un an ensemble. Ton intime, complice. Tu peux faire de l'humour basé sur des références partagées.",
};

type Memory = { kind: string; content: string; weight: number };

/**
 * Returns the array of system blocks to pass as `system: [...]` to the
 * Anthropic Messages API. Blocks 1-3 are cacheable; block 4 (memories)
 * is fresh per request.
 */
export function buildCoachSystem(opts: {
  persona: CoachPersona;
  coachName: string;
  profile: StableProfileFields;
  memories: Memory[];
}): CacheableTextBlock[] {
  const personaBlock = PERSONAS[opts.persona];
  const levelTone = LEVEL_TONE[opts.profile.coachLevel ?? 1];

  const personaContent = `Tu t'appelles ${opts.coachName}. Voici ta personnalité : ${personaBlock.system}

Ton du moment selon le niveau de relation :
${levelTone}`;

  const profileContent = `Profil actuel de l'utilisateur :
${formatProfile(opts.profile)}`;

  const memoriesContent = opts.memories.length
    ? `Souvenirs partagés (utilise-les sans les citer explicitement) :
${opts.memories
  .map((m, i) => `${i + 1}. [${m.kind}, poids ${m.weight.toFixed(0)}] ${m.content}`)
  .join("\n")}`
    : "Souvenirs partagés : aucun pour le moment — c'est votre premier vrai échange.";

  return [
    // Cached — never changes for the lifetime of the app
    cacheable(BRAND_AND_SAFETY),
    // Cached — changes only when user picks a new persona or renames their coach
    cacheable(personaContent),
    // Cached — changes weekly at most
    cacheable(profileContent),
    // Fresh — different every message
    plainText(memoriesContent),
  ];
}
