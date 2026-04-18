import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/billing/entitlements";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const metadata = { title: "Abonnement" };

export default async function SubscriptionPage() {
  const session = await auth();
  const sub = await prisma.subscription.findUnique({ where: { userId: session!.user.id } });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Abonnement</h1>
        <p className="text-muted-foreground">
          Plan actuel : <Badge>{sub?.tier ?? "FREE"}</Badge> · {sub?.status ?? "ACTIVE"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const isCurrent = sub?.tier === plan.tier;
          return (
            <Card key={plan.tier} className={plan.highlighted ? "border-primary/60 ring-2 ring-primary/40" : ""}>
              <CardHeader>
                <CardTitle className="flex items-baseline justify-between">
                  {plan.name}
                  <span className="text-xl font-bold">
                    {plan.priceEur === 0 ? "0€" : `${plan.priceEur.toFixed(2)}€`}
                    <span className="ml-1 text-xs text-muted-foreground">/mois</span>
                  </span>
                </CardTitle>
                <CardDescription>{plan.tagline}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <ul className="space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {plan.tier === "FREE" ? (
                  <Button variant="outline" disabled={isCurrent}>
                    {isCurrent ? "Plan actuel" : "Gratuit"}
                  </Button>
                ) : (
                  <form action="/api/stripe/checkout" method="post">
                    <input type="hidden" name="tier" value={plan.tier} />
                    <Button type="submit" className="w-full" disabled={isCurrent}>
                      {isCurrent ? "Plan actuel" : "S'abonner"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {sub?.tier !== "FREE" && (
        <Card>
          <CardHeader>
            <CardTitle>Facturation</CardTitle>
            <CardDescription>Ouvrez le portail Stripe pour gérer votre moyen de paiement.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/api/stripe/portal" method="post">
              <Button type="submit" variant="outline">
                Ouvrir le portail de facturation
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
