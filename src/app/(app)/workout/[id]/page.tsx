import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkoutPlayer } from "@/features/workout/workout-player";

export default async function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const workout = await prisma.workout.findFirst({
    where: { id, userId: session!.user.id },
    include: {
      sets: { orderBy: { orderIndex: "asc" }, include: { exercise: true } },
      feedback: true,
    },
  });
  if (!workout) notFound();

  return <WorkoutPlayer workout={workout} />;
}
