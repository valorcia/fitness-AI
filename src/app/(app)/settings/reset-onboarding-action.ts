"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Wipes onboarding state for the current user so the questionnaire can be
 * retaken from scratch — useful for demo + QA.
 *  - Deletes Profile + HealthProfile + Preference (so it gets reseeded).
 *  - Deletes the active TrainingPlan and any planned (not completed) Workouts.
 *  - Keeps history (completed workouts, weight logs, posts, etc.).
 */
export async function resetOnboarding() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;

  await prisma.$transaction(async (tx) => {
    await tx.workout.deleteMany({ where: { userId, status: "PLANNED" } });
    await tx.trainingPlan.deleteMany({ where: { userId } });
    await tx.profile.deleteMany({ where: { userId } });
    await tx.healthProfile.deleteMany({ where: { userId } });
    await tx.planProposal.deleteMany({ where: { userId, status: "PENDING_USER" } });
  });

  redirect("/onboarding");
}
