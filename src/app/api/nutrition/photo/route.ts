import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/ai/openai";
import { rateLimits } from "@/lib/redis";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 60;

const requestSchema = z.object({
  imageBase64: z.string().min(100).max(8_000_000), // ≤ ~6 MB image
  note: z.string().max(300).optional(),
  mealType: z
    .enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK", "PRE_WORKOUT", "POST_WORKOUT"])
    .optional(),
  save: z.boolean().default(true),
});

const visionResponseSchema = z.object({
  detected_items: z.array(
    z.object({
      name: z.string(),
      portion: z.string().optional(),
      estimated_grams: z.number().nonnegative().optional(),
      kcal: z.number().nonnegative(),
      protein_g: z.number().nonnegative().default(0),
      carbs_g: z.number().nonnegative().default(0),
      fat_g: z.number().nonnegative().default(0),
    }),
  ),
  confidence: z.number().min(0).max(1).default(0.6),
  summary: z.string().max(300),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!openai) {
    return NextResponse.json(
      { error: "Analyse photo indisponible (OPENAI_API_KEY manquant)." },
      { status: 503 },
    );
  }
  const client = openai;

  const rl = await rateLimits.coachChat.limit(`photo:${session.user.id}`);
  if (!rl.success) {
    return NextResponse.json({ error: "Trop d'analyses. Réessayez plus tard." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const dataUrl = parsed.data.imageBase64.startsWith("data:")
    ? parsed.data.imageBase64
    : `data:image/jpeg;base64,${parsed.data.imageBase64}`;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Tu es un nutritionniste. On te donne une photo de repas. Identifie les aliments visibles et estime portions et macros. Réponds STRICTEMENT en JSON suivant ce schéma : {detected_items: [{name, portion, estimated_grams, kcal, protein_g, carbs_g, fat_g}], confidence: 0..1, summary: string FR}. Fais des estimations raisonnables basées sur l'apparence visuelle.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: parsed.data.note ?? "Analyse ce plat et estime calories + macros." },
            { type: "image_url", image_url: { url: dataUrl, detail: "low" } },
          ],
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const json = JSON.parse(raw);
    const data = visionResponseSchema.parse(json);

    const totals = data.detected_items.reduce(
      (acc, it) => ({
        kcal: acc.kcal + it.kcal,
        protein: acc.protein + it.protein_g,
        carbs: acc.carbs + it.carbs_g,
        fat: acc.fat + it.fat_g,
      }),
      { kcal: 0, protein: 0, carbs: 0, fat: 0 },
    );

    if (parsed.data.save) {
      const title = data.detected_items
        .slice(0, 3)
        .map((i) => i.name)
        .join(" · ");
      await prisma.nutritionLog.create({
        data: {
          userId: session.user.id,
          mealType: parsed.data.mealType,
          title: title || undefined,
          kcal: Math.round(totals.kcal),
          protein: Math.round(totals.protein * 10) / 10,
          carbs: Math.round(totals.carbs * 10) / 10,
          fat: Math.round(totals.fat * 10) / 10,
          items: data.detected_items as unknown as object,
          source: "ai",
        },
      });
    }

    return NextResponse.json({ ok: true, result: data, totals });
  } catch (e) {
    logger.error("nutrition_photo_failed", {
      err: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json(
      { error: "Analyse impossible. Prenez une photo nette de face." },
      { status: 502 },
    );
  }
}
