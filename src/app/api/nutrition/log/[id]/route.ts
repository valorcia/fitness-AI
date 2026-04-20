import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  mealType: z
    .enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK", "PRE_WORKOUT", "POST_WORKOUT"])
    .optional(),
  title: z.string().min(1).max(120).optional(),
  note: z.string().max(500).optional(),
  kcal: z.number().int().min(0).max(10000).optional(),
  protein: z.number().min(0).max(500).optional(),
  carbs: z.number().min(0).max(1000).optional(),
  fat: z.number().min(0).max(500).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const existing = await prisma.nutritionLog.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated = await prisma.nutritionLog.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true, log: updated });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const existing = await prisma.nutritionLog.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.nutritionLog.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
