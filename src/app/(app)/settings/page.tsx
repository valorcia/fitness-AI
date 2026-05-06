import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CoachSettings } from "@/features/coach/coach-settings";
import { ThemeToggle } from "@/components/app/theme-toggle";
import Link from "next/link";
import { PlugZap, Wand2 } from "lucide-react";

export const metadata = { title: "Paramètres" };

export default async function SettingsPage() {
  const session = await auth();
  const userId = session!.user.id;
  const [user, prefs, profile] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.preference.findUnique({ where: { userId } }),
    prisma.profile.findUnique({ where: { userId } }),
  ]);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">Profil, coach, confidentialité, données.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coach personnalisé</CardTitle>
          <CardDescription>Nom, avatar, voix et personnalité.</CardDescription>
        </CardHeader>
        <CardContent>
          <CoachSettings
            initial={{
              coachPersona: prefs?.coachPersona ?? "FUN",
              coachName: prefs?.coachName ?? "Pulse",
              coachAvatar: prefs?.coachAvatar ?? "default",
              voiceEnabled: prefs?.voiceEnabled ?? true,
            }}
          />
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        <Link href="/planning" className="block">
          <Card className="transition hover:border-primary/50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Wand2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold">Planification IA</div>
                <div className="text-xs text-muted-foreground">
                  Composez votre plan avec le coach.
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/settings/devices" className="block">
          <Card className="transition hover:border-primary/50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <PlugZap className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold">Appareils connectés</div>
                <div className="text-xs text-muted-foreground">
                  Garmin, Fitbit, Oura, Withings, Strava…
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Apparence</CardTitle>
          <CardDescription>Mode clair, sombre ou automatique selon votre système.</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compte</CardTitle>
          <CardDescription>{user?.email}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex justify-between text-sm">
            <span>Rôle</span>
            <Badge variant="outline">{user?.role}</Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span>Langue</span>
            <span>{user?.locale}</span>
          </div>
          <Separator />
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button variant="outline" type="submit">
              Se déconnecter
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Confidentialité & données</CardTitle>
          <CardDescription>Exportez ou supprimez vos données à tout moment.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 md:flex-row">
          <form action="/api/account/export" method="post">
            <Button variant="outline" type="submit">
              Télécharger mes données
            </Button>
          </form>
          <form action="/api/account/delete" method="post">
            <Button variant="destructive" type="submit">
              Supprimer mon compte
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profil fitness</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="flex items-start justify-between gap-3">
            <span>Objectifs</span>
            <div className="flex flex-wrap justify-end gap-1">
              {(profile?.goals?.length ? profile.goals : profile?.goal ? [profile.goal] : []).map(
                (g, i) => (
                  <Badge key={g} variant={i === 0 ? "default" : "outline"}>
                    {g}
                  </Badge>
                ),
              )}
            </div>
          </div>
          <div className="flex justify-between">
            <span>Niveau</span>
            <Badge variant="outline">{profile?.fitnessLevel}</Badge>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span>Lieux d'entraînement</span>
            <div className="flex flex-wrap justify-end gap-1">
              {(profile?.environments?.length
                ? profile.environments
                : profile?.environment
                  ? [profile.environment]
                  : []
              ).map((e, i) => (
                <Badge key={e} variant={i === 0 ? "default" : "outline"}>
                  {e}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
