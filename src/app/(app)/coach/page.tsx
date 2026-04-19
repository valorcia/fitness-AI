import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CoachChat } from "@/features/coach/coach-chat";
import { CoachGallery } from "@/features/coach/coach-gallery";

export const metadata = { title: "Coach" };

export default async function CoachPage() {
  const session = await auth();
  const userId = session!.user.id;
  const [prefs, profile, nextWorkout, coaches, currentCoach] = await Promise.all([
    prisma.preference.findUnique({ where: { userId } }),
    prisma.profile.findUnique({ where: { userId } }),
    prisma.workout.findFirst({
      where: { userId, status: "PLANNED" },
      orderBy: { scheduledFor: "asc" },
    }),
    prisma.coachProfile.findMany({ where: { active: true }, orderBy: { displayName: "asc" } }),
    prisma.preference.findUnique({ where: { userId } }).then((p) =>
      p?.coachProfileSlug
        ? prisma.coachProfile.findUnique({ where: { slug: p.coachProfileSlug } })
        : null,
    ),
  ]);

  const coachName = currentCoach?.displayName.split(" ")[0] ?? prefs?.coachName ?? "Pulse";

  return (
    <div className="mx-auto grid max-w-2xl gap-5">
      {currentCoach ? (
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/30">
              <Image
                src={currentCoach.portraitUrl}
                alt={currentCoach.displayName}
                fill
                sizes="64px"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-lg font-bold">{currentCoach.displayName}</div>
              <div className="text-xs text-muted-foreground">
                {currentCoach.specialty} · {currentCoach.style.toLowerCase()}
              </div>
              <p className="mt-1 line-clamp-1 text-xs italic text-muted-foreground">
                « {currentCoach.tagline} »
              </p>
            </div>
            <Badge variant="outline">{currentCoach.style}</Badge>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Choisissez votre coach</CardTitle>
            <CardDescription>
              Un coach unique vous accompagne avec sa voix, sa personnalité et son expertise.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-3 p-5">
          <p className="text-sm">
            Bonjour {profile?.firstName ?? "l'athlète"} 👋, je suis {coachName}. Je t'accompagne sur
            ton objectif{" "}
            <span className="font-semibold">
              {profile?.goal?.toLowerCase().replace("_", " ") ?? "fitness"}
            </span>
            .
          </p>
          {nextWorkout && (
            <p className="text-sm text-muted-foreground">
              Prochaine séance prévue le{" "}
              <span className="font-semibold text-foreground">
                {new Date(nextWorkout.scheduledFor).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
              .
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <CoachChat
            coachName={coachName}
            coachAvatar={prefs?.coachAvatar ?? "default"}
            voiceEnabled={prefs?.voiceEnabled ?? true}
            openaiVoice={currentCoach?.openaiVoice ?? "nova"}
            elevenLabsVoiceId={currentCoach?.elevenLabsVoiceId ?? undefined}
            portraitUrl={currentCoach?.portraitUrl}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Galerie des coachs</CardTitle>
          <CardDescription>
            Écoutez un échantillon puis sélectionnez celui qui vous correspond.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CoachGallery
            coaches={coaches.map((c) => ({
              id: c.id,
              slug: c.slug,
              displayName: c.displayName,
              gender: c.gender,
              ageYears: c.ageYears,
              specialty: c.specialty,
              style: c.style,
              tagline: c.tagline,
              bio: c.bio,
              portraitUrl: c.portraitUrl,
              elevenLabsVoiceId: c.elevenLabsVoiceId,
              openaiVoice: c.openaiVoice,
              isPremium: c.isPremium,
            }))}
            currentSlug={prefs?.coachProfileSlug ?? null}
          />
        </CardContent>
      </Card>
    </div>
  );
}
