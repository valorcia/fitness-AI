import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CoachSettings } from "@/features/coach/coach-settings";
import { ThemeToggle } from "@/components/app/theme-toggle";

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
          <div className="flex justify-between">
            <span>Objectif</span>
            <Badge variant="outline">{profile?.goal}</Badge>
          </div>
          <div className="flex justify-between">
            <span>Niveau</span>
            <Badge variant="outline">{profile?.fitnessLevel}</Badge>
          </div>
          <div className="flex justify-between">
            <span>Environnement</span>
            <Badge variant="outline">{profile?.environment}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
