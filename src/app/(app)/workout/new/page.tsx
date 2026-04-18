import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function NewWorkoutPage() {
  const session = await auth();
  const workout = await prisma.workout.create({
    data: {
      userId: session!.user.id,
      type: "CUSTOM",
      scheduledFor: new Date(),
      status: "PLANNED",
    },
  });
  redirect(`/workout/${workout.id}`);
}
