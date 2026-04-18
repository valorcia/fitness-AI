import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  completed: z.boolean().optional(),
  actualReps: z.number().int().min(0).optional(),
  actualWeight: z.number().min(0).optional(),
  rpe: z.number().int().min(1).max(10).optional(),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string; setId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, setId } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const set = await prisma.workoutSet.findFirst({
    where: { id: setId, workoutId: id, workout: { userId: session.user.id } },
  });
  if (!set) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.workoutSet.update({ where: { id: setId }, data: parsed.data });
  await prisma.workout.update({
    where: { id },
    data: { status: "IN_PROGRESS", startedAt: set.completed ? undefined : new Date() },
  });
  return NextResponse.json({ ok: true });
}
