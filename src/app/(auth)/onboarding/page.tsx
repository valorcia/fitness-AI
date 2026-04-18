import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingWizard } from "@/features/onboarding/onboarding-wizard";

export const metadata = { title: "Onboarding" };

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const existing = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (existing) redirect("/dashboard");

  return (
    <div className="w-full max-w-3xl">
      <OnboardingWizard firstName={session.user.name?.split(" ")[0] ?? ""} />
    </div>
  );
}
