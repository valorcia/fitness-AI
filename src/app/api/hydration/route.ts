import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ct = req.headers.get("content-type") ?? "";
  let amountMl = 250;
  if (ct.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    if (typeof body.amountMl === "number") amountMl = Math.min(5000, Math.max(1, body.amountMl));
  }
  await prisma.hydrationLog.create({ data: { userId: session.user.id, amountMl } });
  if (ct.includes("application/x-www-form-urlencoded")) {
    return NextResponse.redirect(new URL("/nutrition", req.url), { status: 303 });
  }
  return NextResponse.json({ ok: true });
}
