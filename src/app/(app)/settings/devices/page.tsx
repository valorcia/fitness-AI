import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DEVICE_CATALOG } from "@/lib/devices/catalog";
import { DevicesManager } from "@/features/devices/devices-manager";

export const metadata = { title: "Appareils connectés" };

export default async function DevicesPage() {
  const session = await auth();
  const userId = session!.user.id;
  const connections = await prisma.deviceConnection.findMany({
    where: { userId },
    select: { id: true, provider: true, status: true, lastSyncAt: true },
    orderBy: { createdAt: "desc" },
  });

  const byProvider = new Map(connections.map((c) => [c.provider, c]));

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="font-display text-display-sm">Appareils connectés</h1>
        <p className="text-muted-foreground">
          Connectez votre montre, votre balance ou vos apps santé pour que le coach adapte votre
          plan en temps réel.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Santé & performance</CardTitle>
          <CardDescription>
            Les données synchronisées nourrissent le score de récupération, le calcul des
            calories et l'adaptation des séances.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DevicesManager
            catalog={DEVICE_CATALOG}
            connections={connections.map((c) => ({
              id: c.id,
              provider: c.provider,
              status: c.status,
              lastSyncAt: c.lastSyncAt?.toISOString() ?? null,
            }))}
            existingProviders={Array.from(byProvider.keys())}
          />
        </CardContent>
      </Card>
    </div>
  );
}
