import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { CoachChat } from "@/features/coach/coach-chat";
import { CoachAvatar } from "@/features/coach/coach-avatar";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Coach" };

export default async function CoachPage() {
  const session = await auth();
  const userId = session!.user.id;
  const [prefs, profile, nextWorkout] = await Promise.all([
    prisma.preference.findUnique({ where: { userId } }),
    prisma.profile.findUnique({ where: { userId } }),
    prisma.workout.findFirst({
      where: { userId, status: "PLANNED" },
      orderBy: { scheduledFor: "asc" },
    }),
  ]);

  const coachName = prefs?.coachName ?? "Pulse";
  const coachAvatar = prefs?.coachAvatar ?? "default";

  return (
    <div className="mx-auto grid max-w-2xl gap-4">
      <Card>
        <CardContent className="flex items-center justify-between p-5">
          <CoachAvatar avatarKey={coachAvatar} name={coachName} size="md" />
          <Badge variant="outline">{prefs?.coachPersona ?? "FUN"}</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <p className="text-sm text-secondary">
            Bonjour {profile?.firstName ?? "l'athlète"} 👋, je suis {coachName}. Je suis là pour
            t'accompagner sur ton objectif{" "}
            <span className="font-semibold text-foreground">
              {profile?.goal?.toLowerCase().replace("_", " ") ?? "fitness"}
            </span>
            .
          </p>
          {nextWorkout && (
            <p className="text-sm text-muted-foreground">
              Prochaine séance prévue le{" "}
              <span className="font-semibold text-foreground">
                {new Date(nextWorkout.scheduledFor).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
              </span>
              . Je te motive, j'adapte les charges, et je suis disponible 24/7.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <CoachChat coachName={coachName} coachAvatar={coachAvatar} />
        </CardContent>
      </Card>
    </div>
  );
}
