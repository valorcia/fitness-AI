import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const conn = await prisma.deviceConnection.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!conn) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.deviceConnection.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
