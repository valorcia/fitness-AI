import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CredentialsForm } from "@/features/auth/credentials-form";
import { OAuthButtons } from "@/features/auth/oauth-buttons";

export const metadata = { title: "Créer un compte" };

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user?.id) redirect("/onboarding");

  const hasGoogle = !!process.env.AUTH_GOOGLE_ID;
  const hasApple = !!process.env.AUTH_APPLE_ID;
  const hasFacebook = !!process.env.AUTH_FACEBOOK_ID;
  const hasOAuth = hasGoogle || hasApple || hasFacebook;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Rejoignez CoachMe.</CardTitle>
        <CardDescription>Essai gratuit, sans carte bancaire.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <CredentialsForm mode="register" />
        {hasOAuth && (
          <>
            <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
              <Separator className="flex-1" />
              ou
              <Separator className="flex-1" />
            </div>
            <OAuthButtons
              providers={{ google: hasGoogle, apple: hasApple, facebook: hasFacebook }}
              callbackUrl="/onboarding"
            />
          </>
        )}
        <Separator />
        <p className="text-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-semibold text-primary">
            Se connecter
          </Link>
        </p>
        <p className="text-center text-xs text-muted-foreground">
          En vous inscrivant vous acceptez nos{" "}
          <Link href="/legal/terms" className="underline">
            CGU
          </Link>{" "}
          et notre{" "}
          <Link href="/legal/privacy" className="underline">
            politique de confidentialité
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}
