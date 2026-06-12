import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { embed } from "@/lib/ai/voyage";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const patchSchema = z.object({
  content: z.string().trim().min(5).max(200).optional(),
  weight: z.number().min(0).max(10).optional(),
});

/**
 * PATCH /api/coach/memories/[id] — edit one memory.
 * If content changes, re-embed asynchronously so future retrievals match.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { id } = await params;

  const memory = await prisma.coachMemory.findFirst({
    where: { id, userId },
    select: { id: true, content: true },
  });
  if (!memory) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await prisma.coachMemory.update({
    where: { id },
    data: {
      ...(parsed.data.content !== undefined ? { content: parsed.data.content } : {}),
      ...(parsed.data.weight !== undefined ? { weight: parsed.data.weight } : {}),
    },
  });

  // Re-embed if content changed (fire-and-forget — fresh content can match
  // before the embedding refresh thanks to recency fallback).
  if (parsed.data.content && parsed.data.content !== memory.content) {
    Promise.resolve()
      .then(async () => {
        const vec = await embed(parsed.data.content!, "document");
        if (!vec) return;
        const vecStr = `[${vec.join(",")}]`;
        await prisma.$executeRawUnsafe(
          `UPDATE "CoachMemory" SET "embedding" = $1::vector WHERE "id" = $2`,
          vecStr,
          id,
        );
      })
      .catch((e) =>
        logger.warn("memory_reembed_failed", {
          error: e instanceof Error ? e.message : String(e),
        }),
      );
  }

  return NextResponse.json({ ok: true });
}

/**
 * DELETE /api/coach/memories/[id] — user removes a memory.
 * Required by RGPD Art. 17 (right to erasure).
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const memory = await prisma.coachMemory.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!memory) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.coachMemory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
