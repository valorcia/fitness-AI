import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkoutPlayer } from "@/features/workout/workout-player";
import { getCurrentCoach } from "@/lib/coach/current-coach";

export default async function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;
  const [workout, coach] = await Promise.all([
    prisma.workout.findFirst({
      where: { id, userId },
      include: {
        sets: { orderBy: { orderIndex: "asc" }, include: { exercise: true } },
        feedback: true,
      },
    }),
    getCurrentCoach(userId),
  ]);
  if (!workout) notFound();

  return (
    <WorkoutPlayer
      workout={workout}
      coach={{
        displayName: coach.displayName,
        portraitUrl: coach.portraitUrl,
        avatarKey: coach.avatarKey,
      }}
    />
  );
}
