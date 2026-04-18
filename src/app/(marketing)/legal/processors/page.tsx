export const metadata = { title: "Sous-traitants" };

const PROCESSORS = [
  { name: "Vercel", purpose: "Hébergement web", location: "UE / US" },
  { name: "Supabase / Neon", purpose: "Base de données Postgres", location: "UE" },
  { name: "Upstash", purpose: "Cache Redis, rate limiting", location: "UE" },
  { name: "Stripe", purpose: "Paiements et facturation", location: "UE / US" },
  { name: "OpenAI", purpose: "Coach IA (chat, TTS, STT)", location: "US" },
  { name: "Sentry", purpose: "Monitoring d'erreurs", location: "UE" },
  { name: "PostHog", purpose: "Analytics produit", location: "UE" },
  { name: "Resend", purpose: "Emails transactionnels", location: "UE" },
];

export default function ProcessorsPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <h1 className="text-4xl font-bold tracking-tight">Sous-traitants</h1>
      <p className="mt-3 text-muted-foreground">
        Liste des prestataires à qui nous transmettons une partie strictement nécessaire de vos
        données pour fournir le service.
      </p>
      <div className="mt-8 overflow-hidden rounded-2xl border border-border/60">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/60">
            <tr>
              <th className="p-3">Prestataire</th>
              <th className="p-3">Finalité</th>
              <th className="p-3">Localisation</th>
            </tr>
          </thead>
          <tbody>
            {PROCESSORS.map((p) => (
              <tr key={p.name} className="border-t border-border/40">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3 text-muted-foreground">{p.purpose}</td>
                <td className="p-3 text-muted-foreground">{p.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
