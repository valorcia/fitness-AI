import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  proposalId: z.string().cuid(),
  reason: z.string().max(300).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const proposal = await prisma.planProposal.findFirst({
    where: { id: parsed.data.proposalId, userId: session.user.id },
  });
  if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.planProposal.update({
    where: { id: proposal.id },
    data: { status: "REJECTED", rejectedReason: parsed.data.reason ?? null },
  });
  return NextResponse.json({ ok: true });
}
