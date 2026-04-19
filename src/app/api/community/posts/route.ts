import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  kind: z.enum(["WORKOUT", "RUN", "ACHIEVEMENT", "PHOTO", "NOTE"]),
  title: z.string().max(120).optional(),
  content: z.string().min(1).max(600),
  imageUrl: z.string().url().max(500).optional(),
  workoutId: z.string().cuid().optional(),
  activityId: z.string().cuid().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const post = await prisma.post.create({
    data: { userId: session.user.id, ...parsed.data },
  });

  await prisma.xPEntry.create({
    data: { userId: session.user.id, amount: 15, reason: "Post communautaire" },
  });

  return NextResponse.json({ ok: true, id: post.id });
}
