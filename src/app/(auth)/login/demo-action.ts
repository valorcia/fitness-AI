"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";

export async function demoLogin() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") {
    return { ok: false, error: "Mode démo désactivé." };
  }

  const email = "demo@coachme.local";
  const password = "demo-account-2026";

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const hashedPassword = await bcrypt.hash(password, 12);
    user = await prisma.user.create({
      data: {
        email,
        name: "Démo",
        hashedPassword,
      },
    });
    await prisma.preference.create({ data: { userId: user.id } });
    await prisma.subscription.create({
      data: { userId: user.id, tier: "FREE", status: "ACTIVE" },
    });
  }

  await signIn("credentials", {
    email,
    password,
    redirectTo: "/dashboard",
  });
  return { ok: true };
}
