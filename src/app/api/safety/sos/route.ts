import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimits } from "@/lib/redis";
import { logger } from "@/lib/logger";

const schema = z.object({
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  note: z.string().max(300).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rl = await rateLimits.sos.limit(session.user.id);
  if (!rl.success) {
    return NextResponse.json(
      { error: "SOS cooldown actif. Contactez directement les secours si c'est une urgence vitale." },
      { status: 429 },
    );
  }
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const contact = await prisma.safetyContact.findFirst({
    where: { userId: session.user.id, isPrimary: true },
  });

  await prisma.safetyEvent.create({
    data: {
      userId: session.user.id,
      contactId: contact?.id ?? null,
      kind: "SOS",
      lat: parsed.data.lat ?? null,
      lng: parsed.data.lng ?? null,
      note: parsed.data.note,
    },
  });

  // TODO: dispatch SMS/email via provider (Twilio/Resend). Wired in Sprint 4.
  logger.warn("sos_triggered", { userId: session.user.id, hasContact: !!contact });

  return NextResponse.json({ ok: true });
}
