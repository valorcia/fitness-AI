import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PROVIDERS = [
  "GARMIN",
  "FITBIT",
  "OURA",
  "WITHINGS",
  "POLAR",
  "STRAVA",
  "APPLE_HEALTH",
  "GOOGLE_FIT",
  "TERRA",
  "MANUAL",
] as const;
const schema = z.object({ provider: z.enum(PROVIDERS) });

/**
 * MVP skeleton — returns the OAuth URL to redirect to when the provider env
 * vars are configured. Until then, creates a MANUAL-style placeholder
 * connection so the UI can still display "synced" and accept manual readings.
 */
export async function POST(_req: Request, ctx: { params: Promise<{ provider: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const raw = await ctx.params;
  const parsed = schema.safeParse({ provider: raw.provider.toUpperCase() });
  if (!parsed.success) return NextResponse.json({ error: "Provider inconnu" }, { status: 400 });
  const provider = parsed.data.provider;

  const envVar = `${provider}_CLIENT_ID`;
  const clientId = process.env[envVar];
  if (provider !== "MANUAL" && provider !== "TERRA" && !clientId) {
    return NextResponse.json(
      {
        error: `Intégration ${provider} non configurée (env ${envVar} manquant). Utilisez la saisie manuelle en attendant.`,
        manualFallback: true,
      },
      { status: 501 },
    );
  }

  if (provider === "TERRA") {
    const terraKey = process.env.TERRA_API_KEY;
    if (!terraKey) {
      return NextResponse.json(
        { error: "Terra non configuré (TERRA_API_KEY manquant)", manualFallback: true },
        { status: 501 },
      );
    }
    // Terra: return widget URL. The real implementation calls POST
    // https://api.tryterra.co/v2/auth/generateWidgetSession
    return NextResponse.json({
      widgetUrl: `https://widget.tryterra.co/?reference_id=${session.user.id}`,
      note: "Stub Terra — remplacer par un appel generateWidgetSession côté serveur.",
    });
  }

  if (provider === "MANUAL") {
    const conn = await prisma.deviceConnection.upsert({
      where: { userId_provider: { userId: session.user.id, provider } },
      update: { status: "ACTIVE" },
      create: { userId: session.user.id, provider, status: "ACTIVE" },
    });
    return NextResponse.json({ ok: true, connection: conn });
  }

  // OAuth flow stub — build the provider authorize URL.
  // Actual secret exchange handled in /api/devices/callback/[provider].
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/devices/callback/${provider.toLowerCase()}`;
  const state = `${session.user.id}.${Math.random().toString(36).slice(2)}`;
  const base =
    {
      GARMIN: "https://connect.garmin.com/oauthConfirm",
      FITBIT: "https://www.fitbit.com/oauth2/authorize",
      OURA: "https://cloud.ouraring.com/oauth/authorize",
      WITHINGS: "https://account.withings.com/oauth2_user/authorize2",
      POLAR: "https://flow.polar.com/oauth2/authorization",
      STRAVA: "https://www.strava.com/oauth/authorize",
    }[provider] ?? null;

  if (!base) {
    return NextResponse.json({ error: "Provider non supporté." }, { status: 400 });
  }

  const url = new URL(base);
  url.searchParams.set("client_id", clientId!);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);

  return NextResponse.json({ authorizeUrl: url.toString(), state });
}
