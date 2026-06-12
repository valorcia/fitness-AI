import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordMemories, type MemoryKind } from "@/lib/coach/memory";

export const runtime = "nodejs";

/**
 * GET /api/coach/memories
 *
 * Returns every memory the coach has about the current user. Required
 * by RGPD Art. 15 (right of access) — the user must be able to see what
 * data the system has stored about them.
 *
 * Ordered by weight desc + recency so the most impactful memories come first.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const rows = await prisma.coachMemory.findMany({
    where: { userId },
    orderBy: [{ weight: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      kind: true,
      content: true,
      weight: true,
      source: true,
      createdAt: true,
      lastUsed: true,
    },
  });

  return NextResponse.json({ memories: rows });
}

const KIND_VALUES = [
  "injury",
  "goal",
  "preference",
  "life_event",
  "perf_record",
  "conversation",
  "win",
  "loss",
] as const satisfies readonly MemoryKind[];

const createSchema = z.object({
  kind: z.enum(KIND_VALUES),
  content: z.string().trim().min(5).max(200),
  weight: z.number().min(0).max(10).default(8),
});

/**
 * POST /api/coach/memories — user manually adds a memory.
 * Saved with source="manual" and a default weight of 8 (user-asserted
 * facts are presumed important).
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await recordMemories(
    userId,
    [{ kind: parsed.data.kind, content: parsed.data.content, weight: parsed.data.weight }],
    "manual",
  );

  return NextResponse.json({ ok: true });
}
