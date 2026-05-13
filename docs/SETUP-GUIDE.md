# Coachmii-fit — Guide de démarrage (budget mini)

Trois intégrations suffisent pour que l'app respire en production : **base de
données** (Neon), **voix premium** (ElevenLabs), **vidéos d'exercice** (Pexels).
Total récurrent : ~22 $ / mois.

## 1. Base de données — Neon (gratuit)

1. <https://neon.tech> → Sign up (GitHub).
2. Create project « coachmii-fit » → region `Europe (Frankfurt)` ou `Paris`.
3. Connection Details → **Pooled connection** = `DATABASE_URL`.
4. **Direct connection** (sans `-pooler` dans l'URL) = `DIRECT_URL`.
   **Très important** : Prisma `db push` utilise `DIRECT_URL` ; sans cette
   variable, le build tentera de passer par le pooler qui ne gère pas les DDL.
5. Neon free tier s'endort après ~5 min d'inactivité. Le script `scripts/
   db-sync.mjs` retente 4 fois (2 s → 15 s backoff) pour le réveiller, et
   poursuit le build sans bloquer si la DB reste injoignable — les tables
   seront synchronisées au redeploy suivant.

## 2. Voix premium — ElevenLabs (22 $ / mois Creator, ou 5 $ Starter)

1. <https://elevenlabs.io/app/subscription> → Starter 5 $ pour tester, Creator
   22 $ recommandé pour production (cloning vocal inclus).
2. Après paiement, Profile → **API key** → `ELEVENLABS_API_KEY`.
3. Les voix utilisées sont déjà déclarées dans le seed (`prisma/seed.ts`,
   tableau `COACHES`). Elles correspondent aux voix publiques françaises /
   multilingues d'ElevenLabs et fonctionnent directement après import de la
   clé.
4. Pour remplacer par vos propres voix cloneées :
   - ElevenLabs → VoiceLab → Add Voice → Instant / Professional cloning.
   - Copiez le Voice ID généré.
   - Mettez-le à jour dans `prisma/seed.ts` pour le coach concerné et
     redéployez (seed rejoué à chaque build).

## 3. Vidéos d'exercice — Pexels (gratuit)

1. <https://www.pexels.com/api/> → Sign up → **Your API key**.
2. Ajoutez `PEXELS_API_KEY` dans Vercel → Settings → Environment Variables.
3. Premier chargement d'un exercice sans vidéo déclenche une recherche Pexels,
   le premier clip pertinent est mis en cache dans `Exercise.videoUrl`
   (persistant, pas de requête répétée).
4. Crédit obligatoire sur la landing / manuel → déjà prévu dans
   `/legal/processors`.

## 4. Vercel — variables à renseigner

Production + Preview + Development :

```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
AUTH_SECRET=<openssl rand -base64 32>
OPENAI_API_KEY=...
ELEVENLABS_API_KEY=...         # optionnel mais fortement recommandé
PEXELS_API_KEY=...             # optionnel
```

Redeploy sans cache → les tables sont créées (`prisma db push`), le catalogue
seedé (exercices, coachs, badges) et le build publié.

## 5. À activer plus tard (hors budget mini)

- `HEYGEN_API_KEY` — avatar vidéo photoréaliste en streaming (~99 $ / mois).
- `MUSCLE_MOTION_API_KEY` — anims 3D anatomiques (~600 $ / an) ; le scaffold
  `lib/media/muscle-motion.ts` est déjà en place, désactivé par défaut.
- `STRIPE_*` — activer les abonnements Premium/Pro/Elite.

## 6. Sanity checks après déploiement

- `/api/healthz` → `{ status: "ok" }`.
- `/exercises` charge la bibliothèque (vignettes photo ou demo animée).
- `/coach` joue un sample audio du coach sélectionné sur clic « Écouter ».
- `/dashboard` affiche le muscle map après au moins une séance complétée.
- `/workout/[id]` joue la démo animée de l'exercice même sans vidéo Pexels.
