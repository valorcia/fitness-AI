import { z } from "zod";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  coachProfileSlug: z.string().min(1).max(50),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const coach = await prisma.coachProfile.findUnique({
    where: { slug: parsed.data.coachProfileSlug },
  });
  if (!coach) return NextResponse.json({ error: "Coach introuvable" }, { status: 404 });

  await prisma.preference.upsert({
    where: { userId: session.user.id },
    update: {
      coachProfileSlug: coach.slug,
      coachName: coach.displayName.split(" ")[0],
      coachPersona:
        coach.style === "MILITARY" ? "MILITARY" : coach.style === "EXPERT" ? "ELITE" : "FUN",
    },
    create: {
      userId: session.user.id,
      coachProfileSlug: coach.slug,
      coachName: coach.displayName.split(" ")[0],
      coachPersona:
        coach.style === "MILITARY" ? "MILITARY" : coach.style === "EXPERT" ? "ELITE" : "FUN",
    },
  });

  return NextResponse.json({ ok: true, coach });
}
