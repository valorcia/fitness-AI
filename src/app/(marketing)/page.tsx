import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/billing/entitlements";
import {
  Activity,
  Apple,
  Bike,
  Brain,
  Check,
  Dumbbell,
  Footprints,
  HeartPulse,
  MapPinned,
  Mic,
  Shield,
  Sparkles,
  Trophy,
} from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "Coach IA adaptatif",
    desc: "Plans personnalisés, adaptation après chaque séance, progression millimétrée.",
  },
  {
    icon: Mic,
    title: "Voix motivante temps réel",
    desc: "5 personnalités : strict, fun, zen, militaire, elite. Encouragements live.",
  },
  {
    icon: Dumbbell,
    title: "Salle de sport",
    desc: "Catalogue d'exercices, vidéos, tempo, repos intelligent, détection de stagnation.",
  },
  {
    icon: MapPinned,
    title: "Outdoor GPS",
    desc: "Course, vélo, marche, HIIT extérieur. Zones cardio, fractionné, dénivelé.",
  },
  {
    icon: HeartPulse,
    title: "Santé & récupération",
    desc: "Hydratation météo-consciente, sommeil, fatigue score, synchro Apple Health / Google Fit.",
  },
  {
    icon: Shield,
    title: "Sécurité premium",
    desc: "SOS, partage live, alerte chute, check-in retour, mode nuit outdoor.",
  },
  {
    icon: Trophy,
    title: "Gamification",
    desc: "XP, niveaux, badges, streaks, challenges mensuels, classements amis et équipes.",
  },
  {
    icon: Apple,
    title: "Nutrition intelligente",
    desc: "Macros, hydratation, recommandations personnalisées basées sur l'effort.",
  },
];

export default function MarketingHome() {
  return (
    <>
      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="outline" className="mx-auto mb-6 border-primary/40 bg-primary/10 text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Nouveau · Coach vocal IA
          </Badge>
          <h1 className="text-balance text-5xl font-bold tracking-tight md:text-7xl">
            Votre <span className="gradient-text">coach sportif IA</span>
            <br /> de niveau professionnel.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
            Programmes personnalisés, coaching vocal en temps réel, outdoor GPS, nutrition et
            récupération. Une expérience premium, disponible partout.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="xl" variant="glow" asChild>
              <Link href="/register">Essayer gratuitement</Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link href="/#features">Voir les fonctionnalités</Link>
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Sans carte bancaire · Annulable à tout moment
          </p>
        </div>

        {/* preview blocks */}
        <div className="relative mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { icon: Activity, label: "Séance adaptée" },
            { icon: Footprints, label: "Run tracker" },
            { icon: Bike, label: "Vélo live" },
            { icon: HeartPulse, label: "Récupération" },
          ].map(({ icon: Icon, label }) => (
            <Card key={label} className="glass hover:border-primary/50 transition-colors">
              <CardContent className="flex flex-col items-center gap-3 p-6">
                <Icon className="h-6 w-6 text-primary" />
                <span className="text-sm font-semibold">{label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mt-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight">Tout ce qu'il faut pour progresser.</h2>
          <p className="mt-3 text-muted-foreground">
            Conçu comme une suite complète de coaching : salle, outdoor, santé, sécurité, social.
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="group relative overflow-hidden">
              <div className="absolute inset-x-0 -top-10 h-24 bg-primary/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
              <CardHeader>
                <Icon className="mb-3 h-6 w-6 text-primary" />
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>{desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mt-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight">Choisissez votre niveau.</h2>
          <p className="mt-3 text-muted-foreground">Commencez gratuit, passez premium quand vous êtes prêt.</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <Card
              key={plan.tier}
              className={
                plan.highlighted
                  ? "relative border-primary/60 ring-2 ring-primary/40"
                  : "relative"
              }
            >
              {plan.highlighted && (
                <Badge className="absolute -top-3 right-6">Le plus choisi</Badge>
              )}
              <CardHeader>
                <CardTitle className="flex items-baseline justify-between">
                  {plan.name}
                  <span className="text-2xl font-bold">
                    {plan.priceEur === 0 ? "0€" : `${plan.priceEur.toFixed(2)}€`}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">/mois</span>
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
                <Button className="mt-4" asChild variant={plan.highlighted ? "default" : "outline"}>
                  <Link href="/register">
                    {plan.priceEur === 0 ? "Commencer" : "Choisir"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Social proof / CTA */}
      <section className="mt-32">
        <Card className="glass overflow-hidden">
          <CardContent className="flex flex-col items-center gap-6 p-10 text-center md:p-16">
            <h2 className="text-3xl font-bold md:text-4xl">Prêt à démarrer votre transformation ?</h2>
            <p className="max-w-xl text-muted-foreground">
              Rejoignez la prochaine génération d'athlètes guidés par l'IA. Essai gratuit 7 jours sur
              Premium.
            </p>
            <Button size="xl" variant="glow" asChild>
              <Link href="/register">Créer mon compte</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
