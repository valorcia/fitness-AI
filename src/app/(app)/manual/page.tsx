import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Apple, Dumbbell, MapPin, Shield, Sparkles } from "lucide-react";

export const metadata = { title: "Manuel" };

const GUIDES = [
  {
    icon: Sparkles,
    title: "Démarrer avec CoachMe",
    desc: "Comprendre votre plan personnalisé, votre coach IA et les premières étapes.",
    href: "/exercises",
  },
  {
    icon: Dumbbell,
    title: "Bien utiliser les machines",
    desc: "Nos fiches d'exercices avec photos et consignes techniques.",
    href: "/exercises",
  },
  {
    icon: Apple,
    title: "Traçabilité des calories",
    desc: "Photo AI, saisie manuelle, équilibrage des macros.",
    href: "/nutrition",
  },
  {
    icon: MapPin,
    title: "Entraînement outdoor",
    desc: "GPS, zones cardio, sécurité, fractionné audio.",
    href: "/outdoor",
  },
  {
    icon: Shield,
    title: "Sécurité & urgence",
    desc: "Bouton SOS, contacts de confiance, protocole en cas d'incident.",
    href: "/safety/sos",
  },
];

export default function ManualPage() {
  return (
    <div className="mx-auto grid max-w-2xl gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <BookOpen className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Manuel CoachMe</h1>
          <p className="text-sm text-muted-foreground">Guides, astuces, protocole santé.</p>
        </div>
      </div>

      <div className="grid gap-3">
        {GUIDES.map(({ icon: Icon, title, desc, href }) => (
          <Link key={title} href={href}>
            <Card className="transition hover:border-primary/50">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-secondary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="truncate text-base">{title}</CardTitle>
                  <CardDescription>{desc}</CardDescription>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
