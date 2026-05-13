import Link from "next/link";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

const POSTS = [
  {
    slug: "programme-running-ia",
    title: "Comment un programme running IA bat les plans statiques",
    excerpt:
      "L'IA apprend de votre RPE, de votre sommeil et de votre météo pour adapter chaque séance.",
  },
  {
    slug: "coach-ia-salle-intelligent",
    title: "Coach IA en salle : progression automatique, sans coach privé",
    excerpt:
      "Tempo, RPE, stagnation : l'IA ajuste la charge à chaque série, comme un vrai préparateur.",
  },
  {
    slug: "hydratation-sport-meteo",
    title: "Hydratation et sport : la règle des 35 ml/kg revisitée",
    excerpt: "Un protocole simple qui intègre la chaleur, la charge et la durée.",
  },
];

export const metadata = { title: "Blog" };

export default function BlogIndex() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-4xl font-bold tracking-tight">Blog Coachmii-fit</h1>
      <p className="mt-3 text-muted-foreground">
        Science, IA, coaching, programmes : nos équipes partagent leurs apprentissages.
      </p>
      <div className="mt-10 grid gap-4">
        {POSTS.map((p) => (
          <Link href={`/blog/${p.slug}`} key={p.slug}>
            <Card className="transition hover:border-primary/50">
              <CardContent className="p-6">
                <CardTitle className="text-xl">{p.title}</CardTitle>
                <CardDescription className="mt-2">{p.excerpt}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
