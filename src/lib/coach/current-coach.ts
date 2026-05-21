import { prisma } from "@/lib/prisma";

export type CurrentCoach = {
  slug: string | null;
  displayName: string;
  persona: "STRICT" | "FUN" | "ZEN" | "MILITARY" | "ELITE";
  portraitUrl: string | null;
  tagline: string | null;
  /** Legacy emoji avatar key used as fallback when portraitUrl is null. */
  avatarKey: string;
};

/**
 * Resolves the current user's coach in one round-trip, joining the user's
 * Preference with the optional CoachProfile they selected.
 *
 * The portrait URL is resolved with this priority:
 *   1. Preference.coachAvatarUrl  (custom generation — PREMIUM)
 *   2. CoachProfile.portraitUrl   (standard coach selected)
 *   3. null                       (silhouette fallback)
 */
export async function getCurrentCoach(userId: string): Promise<CurrentCoach> {
  const pref = await prisma.preference.findUnique({
    where: { userId },
    select: {
      coachPersona: true,
      coachName: true,
      coachAvatar: true,
      coachAvatarUrl: true,
      coachProfileSlug: true,
    },
  });

  if (!pref) {
    return {
      slug: null,
      displayName: "Pulse",
      persona: "FUN",
      portraitUrl: null,
      tagline: null,
      avatarKey: "default",
    };
  }

  const profile = pref.coachProfileSlug
    ? await prisma.coachProfile.findUnique({
        where: { slug: pref.coachProfileSlug },
        select: { displayName: true, portraitUrl: true, tagline: true },
      })
    : null;

  return {
    slug: pref.coachProfileSlug,
    displayName: pref.coachName?.trim() || profile?.displayName || "Pulse",
    persona: pref.coachPersona,
    portraitUrl: pref.coachAvatarUrl ?? profile?.portraitUrl ?? null,
    tagline: profile?.tagline ?? null,
    avatarKey: pref.coachAvatar || "default",
  };
}

/**
 * Returns a time-based greeting + mood line for the current hour.
 * Localized in French.
 */
export function timeBasedGreeting(now: Date = new Date()): {
  greet: string;
  mood: string;
} {
  const h = now.getHours();
  if (h < 6) return { greet: "Toujours debout", mood: "Profite du calme nocturne." };
  if (h < 12) return { greet: "Bonjour", mood: "Prêt à attaquer la journée ?" };
  if (h < 14) return { greet: "Bon appétit", mood: "Une pause méritée." };
  if (h < 18) return { greet: "Bel après-midi", mood: "L'énergie est encore là ?" };
  if (h < 22) return { greet: "Bonsoir", mood: "On se motive pour clôturer la journée ?" };
  return { greet: "Bonne soirée", mood: "Le moment idéal pour récupérer." };
}
