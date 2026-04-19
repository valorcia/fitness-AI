import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  coachPersona: z.enum(["STRICT", "FUN", "ZEN", "MILITARY", "ELITE"]).optional(),
  coachName: z.string().min(1).max(30).optional(),
  coachAvatar: z.string().max(50).optional(),
  voiceEnabled: z.boolean().optional(),
  units: z.enum(["metric", "imperial"]).optional(),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  await prisma.preference.upsert({
    where: { userId: session.user.id },
    update: parsed.data,
    create: { userId: session.user.id, ...parsed.data },
  });
  return NextResponse.json({ ok: true });
}
