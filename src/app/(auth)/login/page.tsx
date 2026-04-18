import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata = { title: "Se connecter" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.id) {
    redirect(session.user.hasOnboarded ? "/dashboard" : "/onboarding");
  }

  const hasGoogle = !!process.env.AUTH_GOOGLE_ID;
  const hasApple = !!process.env.AUTH_APPLE_ID;
  const hasFacebook = !!process.env.AUTH_FACEBOOK_ID;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Bon retour.</CardTitle>
        <CardDescription>Connectez-vous pour retrouver votre coach.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {hasGoogle && (
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <Button type="submit" variant="outline" className="w-full">
              Continuer avec Google
            </Button>
          </form>
        )}
        {hasApple && (
          <form
            action={async () => {
              "use server";
              await signIn("apple", { redirectTo: "/dashboard" });
            }}
          >
            <Button type="submit" variant="outline" className="w-full">
              Continuer avec Apple
            </Button>
          </form>
        )}
        {hasFacebook && (
          <form
            action={async () => {
              "use server";
              await signIn("facebook", { redirectTo: "/dashboard" });
            }}
          >
            <Button type="submit" variant="outline" className="w-full">
              Continuer avec Facebook
            </Button>
          </form>
        )}
        {!hasGoogle && !hasApple && !hasFacebook && (
          <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
            Aucun provider OAuth n'est configuré. Ajoutez <code>AUTH_GOOGLE_ID</code>,{" "}
            <code>AUTH_APPLE_ID</code> ou <code>AUTH_FACEBOOK_ID</code> dans <code>.env.local</code>.
          </p>
        )}
        <Separator className="my-4" />
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
