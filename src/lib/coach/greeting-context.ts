type Persona = "STRICT" | "FUN" | "ZEN" | "MILITARY" | "ELITE";

export type GreetingContext = {
  /** First name to address. */
  firstName: string;
  /** Coach persona — drives the tone of the message. */
  persona: Persona;
  /** Total workouts ever completed. 0 = brand new user. */
  totalWorkouts: number;
  /** Days since the last completed workout. null when no workout ever. */
  daysSinceLastWorkout: number | null;
  /** Current consecutive-day streak. */
  currentStreak: number;
  /** Workouts completed in the last 7 days. */
  completedThisWeek: number;
  /** Date used to compute hour-of-day. Defaults to now(). */
  now?: Date;
};

type Pool = Record<Persona, string[]>;

/** Pick a deterministic-but-varied line so repeated dashboard renders rotate. */
function pick(pool: string[], salt: number): string {
  return pool[salt % pool.length]!;
}

const TIME_SALT = () => Math.floor(Date.now() / 1000 / 60 / 60); // changes hourly

const POOL_FIRST_TIME: Pool = {
  FUN: [
    "Première session, super content de t'accueillir !",
    "On démarre ensemble — t'inquiète, je guide pas à pas.",
    "Bienvenue ! On va faire de la place pour la bonne énergie.",
  ],
  STRICT: [
    "Premier jour. Pas d'excuses : on prend la mesure.",
    "Tu es là pour des résultats. On va les chercher.",
    "Bienvenue. Maintenant, montre-moi ce que tu as.",
  ],
  ZEN: [
    "Premier pas vers une pratique régulière. Respire, on y va doucement.",
    "Bienvenue. Chaque mouvement compte, sans précipitation.",
    "Ravi de t'accompagner. On avance ensemble, à ton souffle.",
  ],
  MILITARY: [
    "Recrue, bienvenue. À partir de maintenant, on s'entraîne sérieusement.",
    "Premier jour de service. Discipline et constance avant tout.",
    "Tu es dans l'équipe. Pas de demi-mesure ici.",
  ],
  ELITE: [
    "Bienvenue. Préparons une vraie progression sur la durée.",
    "Premier rendez-vous : on pose les bases pour aller loin.",
    "Heureux de t'avoir. On construit une transformation durable.",
  ],
};

const POOL_LONG_PAUSE: Pool = {
  FUN: [
    "Ça fait un moment ! Reprise tout en douceur, ok ?",
    "Content de te revoir — on remet le pied à l'étrier.",
    "Plusieurs jours sans toi, mais bon retour parmi nous !",
  ],
  STRICT: [
    "Trop de jours sans séance. Aujourd'hui, on reprend.",
    "L'absence ne change rien à tes objectifs. On y va.",
    "Retour aux affaires. On ne perd plus de temps.",
  ],
  ZEN: [
    "De retour ? Inspire profondément, on reprend tranquillement.",
    "Pas de jugement. Le bon moment pour reprendre, c'est maintenant.",
    "Reprise en douceur. Écoute ton corps avant tout.",
  ],
  MILITARY: [
    "Retour de permission. Reprise immédiate, sans flancher.",
    "Plusieurs jours d'inactivité. On reprend la discipline.",
    "Tu es de retour : exécution, maintenant.",
  ],
  ELITE: [
    "Pause faite. On structure une reprise progressive et solide.",
    "L'important, c'est de revenir intelligemment. On adapte la séance.",
    "Bon retour. On reprend avec méthode, sans brûler les étapes.",
  ],
};

const POOL_HOT_STREAK: Pool = {
  FUN: [
    "Tu enchaînes 🔥 on continue sur cette lancée !",
    "Quelle régularité ! Je suis fier de toi.",
    "Plein gaz cette semaine, bravo !",
  ],
  STRICT: [
    "Bonne série. Maintenant, ne ralentis pas.",
    "Tu fais le travail. Continue exactement comme ça.",
    "Régularité confirmée. On augmente l'exigence ?",
  ],
  ZEN: [
    "Une belle constance s'installe. Respire et savoure.",
    "Cette régularité te construit, jour après jour.",
    "Continue à écouter ton corps, sur cette belle dynamique.",
  ],
  MILITARY: [
    "Discipline impeccable. C'est comme ça qu'on devient solide.",
    "Tu tiens les rangs. Continue à exécuter.",
    "Régularité de soldat. Belle tenue.",
  ],
  ELITE: [
    "La constance paie. Tu construis une vraie progression.",
    "C'est exactement comme ça que se forge une transformation.",
    "Belle dynamique. On capitalise.",
  ],
};

const POOL_DEFAULT_DAY: Pool = {
  FUN: [
    "Prêt à passer une bonne journée ensemble ?",
    "On va faire bouger les choses aujourd'hui !",
    "Toujours là pour toi, on s'amuse en s'entraînant.",
  ],
  STRICT: [
    "Quel est l'objectif du jour ?",
    "Pas de bavardage. Qu'est-ce qu'on attaque ?",
    "On va chercher les résultats aujourd'hui.",
  ],
  ZEN: [
    "Comment tu te sens aujourd'hui ?",
    "Une journée comme une autre, à savourer en pleine présence.",
    "Prends un instant pour respirer, puis on commence.",
  ],
  MILITARY: [
    "En position. Quel est l'ordre du jour ?",
    "Routine matinale puis exécution. À toi.",
    "Mission du jour ?",
  ],
  ELITE: [
    "Que veux-tu construire aujourd'hui ?",
    "Travaillons sur ce qui compte vraiment.",
    "Une bonne séance, c'est une étape de plus.",
  ],
};

/**
 * Returns a single coach line tailored to the user's recent activity.
 * The line rotates hourly so the dashboard feels alive without spamming.
 */
export function buildContextualGreeting(ctx: GreetingContext): string {
  const salt = TIME_SALT();

  if (ctx.totalWorkouts === 0) {
    return pick(POOL_FIRST_TIME[ctx.persona], salt);
  }

  if (ctx.daysSinceLastWorkout !== null && ctx.daysSinceLastWorkout >= 3) {
    return pick(POOL_LONG_PAUSE[ctx.persona], salt);
  }

  if (ctx.currentStreak >= 3 || ctx.completedThisWeek >= 3) {
    return pick(POOL_HOT_STREAK[ctx.persona], salt);
  }

  return pick(POOL_DEFAULT_DAY[ctx.persona], salt);
}
