export const metadata = { title: "Confidentialité" };

export default function PrivacyPage() {
  return (
    <article className="prose prose-invert mx-auto max-w-3xl">
      <h1>Politique de confidentialité</h1>
      <p>
        CoachMe traite vos données avec le plus grand soin. Cette page décrit les principes
        appliqués — le document légal complet est disponible sur demande.
      </p>
      <h2>Données collectées</h2>
      <ul>
        <li>Identité, email, préférences.</li>
        <li>Données fitness : profil, séances, performances, géolocalisation outdoor.</li>
        <li>Données santé optionnelles (blessures, pathologies) : stockées chiffrées.</li>
      </ul>
      <h2>Vos droits</h2>
      <p>Accès, rectification, portabilité, effacement, opposition. Contact : dpo@pulsecoach.ai.</p>
      <h2>Sous-traitants</h2>
      <p>Liste à jour sur <a href="/legal/processors">/legal/processors</a>.</p>
    </article>
  );
}
