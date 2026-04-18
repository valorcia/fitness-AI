import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata = { title: "Créer un compte" };

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user?.id) redirect("/onboarding");

  const providers = [
    process.env.AUTH_GOOGLE_ID && { id: "google", label: "Continuer avec Google" },
    process.env.AUTH_APPLE_ID && { id: "apple", label: "Continuer avec Apple" },
    process.env.AUTH_FACEBOOK_ID && { id: "facebook", label: "Continuer avec Facebook" },
  ].filter(Boolean) as { id: string; label: string }[];

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Rejoignez PulseCoach.</CardTitle>
        <CardDescription>Essai gratuit, sans carte bancaire.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {providers.length === 0 && (
          <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
            Configurez un provider OAuth dans <code>.env.local</code> pour activer la création de compte.
          </p>
        )}
        {providers.map((p) => (
          <form
            key={p.id}
            action={async () => {
              "use server";
              await signIn(p.id, { redirectTo: "/onboarding" });
            }}
          >
            <Button type="submit" variant="outline" className="w-full">
              {p.label}
            </Button>
          </form>
        ))}
        <Separator className="my-4" />
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
