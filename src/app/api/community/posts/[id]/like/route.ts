import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId: id, userId: session.user.id } },
  });
  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } });
    return NextResponse.json({ liked: false });
  }
  await prisma.postLike.create({ data: { postId: id, userId: session.user.id } });
  return NextResponse.json({ liked: true });
}
