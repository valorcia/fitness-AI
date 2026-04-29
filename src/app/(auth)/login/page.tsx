import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CredentialsForm } from "@/features/auth/credentials-form";
import { OAuthButtons } from "@/features/auth/oauth-buttons";
import { Sparkles } from "lucide-react";
import { demoLogin } from "./demo-action";

export const metadata = { title: "Se connecter" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.id) {
    redirect(session.user.hasOnboarded ? "/dashboard" : "/onboarding");
  }
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Bon retour.</CardTitle>
        <CardDescription>Connectez-vous pour retrouver votre coach.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {demoMode && (
          <form action={demoLogin}>
            <Button type="submit" variant="glow" className="w-full">
              <Sparkles className="h-4 w-4" />
              Connexion démo (sans compte)
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Compte de test partagé · session 90 jours
            </p>
          </form>
        )}
        <CredentialsForm mode="login" />
        <OAuthSection />
        <Separator />
        <p className="text-center text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link href="/register" className="font-semibold text-primary">
            Créer un compte
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

function OAuthSection() {
  const hasGoogle = !!process.env.AUTH_GOOGLE_ID;
  const hasApple = !!process.env.AUTH_APPLE_ID;
  const hasFacebook = !!process.env.AUTH_FACEBOOK_ID;
  if (!hasGoogle && !hasApple && !hasFacebook) return null;
  return (
    <>
      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
        <Separator className="flex-1" />
        ou
        <Separator className="flex-1" />
      </div>
      <OAuthButtons
        providers={{
          google: hasGoogle,
          apple: hasApple,
          facebook: hasFacebook,
        }}
        callbackUrl="/dashboard"
      />
    </>
  );
}
