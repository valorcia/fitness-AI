import Image from "next/image";
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

const HERO_LEFT =
  "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=900&q=70";
const HERO_RIGHT =
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=70";
const HERO_BOTTOM =
  "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=900&q=70";

export default function MarketingHome() {
  return (
    <>
      {/* Hero cinématique */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-border/60 bg-secondary text-secondary-foreground">
        <div className="absolute inset-0 opacity-70">
          <Image src={HERO_LEFT} alt="" fill priority className="object-cover object-center" sizes="100vw" unoptimized />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/80 to-secondary/20" />
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/40 blur-3xl" />
        <div className="relative grid gap-8 p-8 md:grid-cols-[1.1fr_1fr] md:p-14 lg:p-20">
          <div>
            <Badge variant="outline" className="mb-6 border-white/30 bg-white/10 text-white">
              <Sparkles className="h-3.5 w-3.5" /> Nouveau · Coach vocal IA photoréaliste
            </Badge>
            <h1 className="text-balance font-display text-display-lg text-white">
              Votre coach sportif personnel, <span className="gradient-text">24 h / 24</span>.
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-lg text-white/80">
              Programmes adaptatifs, voix humaine ultra-réaliste, démonstrations vidéo de chaque
              exercice, traçabilité calorique par photo IA. Tout ce qu'un coach privé vous donne —
              dans votre poche.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="xl" variant="glow" asChild>
                <Link href="/register">Commencer gratuitement</Link>
              </Button>
              <Button size="xl" variant="outline" asChild className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                <Link href="/#features">Voir les fonctionnalités</Link>
              </Button>
            </div>
            <p className="mt-3 text-xs text-white/60">Sans carte bancaire · Annulable à tout moment</p>

            <div className="mt-8 grid grid-cols-2 gap-3 text-white">
              {[
                { icon: Activity, label: "Séance adaptée" },
                { icon: Footprints, label: "Run tracker" },
                { icon: Bike, label: "Vélo live" },
                { icon: HeartPulse, label: "Récupération" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 backdrop-blur"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-semibold">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="absolute -right-4 top-0 h-72 w-48 overflow-hidden rounded-[2rem] border-4 border-white/10 shadow-2xl rotate-3">
              <Image src={HERO_RIGHT} alt="" fill sizes="400px" className="object-cover" unoptimized />
            </div>
            <div className="absolute bottom-0 right-32 h-60 w-40 overflow-hidden rounded-[2rem] border-4 border-white/10 shadow-2xl -rotate-6">
              <Image src={HERO_BOTTOM} alt="" fill sizes="400px" className="object-cover" unoptimized />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mt-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-display-sm">Tout ce qu'il faut pour progresser.</h2>
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
          <h2 className="font-display text-display-sm">Choisissez votre niveau.</h2>
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
