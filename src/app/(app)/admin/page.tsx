import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CoachSeedButton } from "./coach-seed-button";
import { CoachUploadPanel } from "./coach-upload-panel";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  const [totalUsers, activeSubs, workoutsLast24h, flags] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.subscription.count({ where: { status: "ACTIVE", tier: { not: "FREE" } } }),
    prisma.workout.count({
      where: { completedAt: { gte: new Date(Date.now() - 24 * 3600 * 1000) } },
    }),
    prisma.featureFlag.findMany(),
  ]);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
        <p className="text-muted-foreground">Vue d'ensemble plateforme.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs</CardTitle>
            <CardDescription>Comptes actifs</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{totalUsers}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Abonnements payants</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{activeSubs}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Séances (24h)</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{workoutsLast24h}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portraits des coachs — Upload manuel</CardTitle>
          <CardDescription>
            Génère chaque image sur leonardo.ai avec le prompt fourni, puis uploade-la ici (max 5 Mo).
            Nécessite <code className="font-mono text-xs">BLOB_READ_WRITE_TOKEN</code> dans Vercel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CoachUploadPanel />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Portraits des coachs — Génération automatique (fal.ai)</CardTitle>
          <CardDescription>Génère les 10 portraits automatiquement via fal.ai (~0,25 $). Nécessite <code className="font-mono text-xs">FAL_KEY</code> et <code className="font-mono text-xs">BLOB_READ_WRITE_TOKEN</code>.</CardDescription>
        </CardHeader>
        <CardContent>
          <CoachSeedButton />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature flags</CardTitle>
          <CardDescription>Rollout contrôlé.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {flags.map((f) => (
            <div key={f.id} className="flex items-center justify-between border-b border-border/40 py-2 text-sm">
              <span className="font-mono">{f.key}</span>
              <div className="flex items-center gap-2">
                <Badge variant={f.enabled ? "success" : "outline"}>
                  {f.enabled ? "on" : "off"}
                </Badge>
                <span className="text-muted-foreground">{f.rollout}%</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
