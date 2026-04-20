import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MEAL_TYPES = ["BREAKFAST", "LUNCH", "DINNER", "SNACK", "PRE_WORKOUT", "POST_WORKOUT"] as const;

const schema = z.object({
  consumedAt: z.string().datetime().optional(),
  mealType: z.enum(MEAL_TYPES).optional(),
  title: z.string().min(1).max(120).optional(),
  note: z.string().max(500).optional(),
  kcal: z.number().int().min(0).max(10000),
  protein: z.number().min(0).max(500).default(0),
  carbs: z.number().min(0).max(1000).default(0),
  fat: z.number().min(0).max(500).default(0),
  fiber: z.number().min(0).max(200).default(0),
  sugar: z.number().min(0).max(500).default(0),
  items: z.array(z.record(z.string(), z.unknown())).optional(),
  imageUrl: z.string().url().optional(),
  source: z.enum(["manual", "ai", "barcode", "quick"]).default("manual"),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const log = await prisma.nutritionLog.create({
    data: {
      userId: session.user.id,
      consumedAt: parsed.data.consumedAt ? new Date(parsed.data.consumedAt) : new Date(),
      mealType: parsed.data.mealType,
      title: parsed.data.title,
      note: parsed.data.note,
      kcal: parsed.data.kcal,
      protein: parsed.data.protein,
      carbs: parsed.data.carbs,
      fat: parsed.data.fat,
      fiber: parsed.data.fiber,
      sugar: parsed.data.sugar,
      items: (parsed.data.items ?? []) as unknown as object,
      imageUrl: parsed.data.imageUrl,
      source: parsed.data.source,
    },
  });
  return NextResponse.json({ ok: true, log });
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const date = url.searchParams.get("date"); // YYYY-MM-DD
  const days = Number(url.searchParams.get("days") ?? 0);

  if (date) {
    const start = new Date(`${date}T00:00:00`);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const logs = await prisma.nutritionLog.findMany({
      where: { userId: session.user.id, consumedAt: { gte: start, lt: end } },
      orderBy: { consumedAt: "asc" },
    });
    return NextResponse.json({ logs });
  }
  if (days > 0) {
    const start = new Date();
    start.setDate(start.getDate() - days);
    const logs = await prisma.nutritionLog.findMany({
      where: { userId: session.user.id, consumedAt: { gte: start } },
      orderBy: { consumedAt: "desc" },
    });
    return NextResponse.json({ logs });
  }

  const logs = await prisma.nutritionLog.findMany({
    where: { userId: session.user.id },
    orderBy: { consumedAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ logs });
}
