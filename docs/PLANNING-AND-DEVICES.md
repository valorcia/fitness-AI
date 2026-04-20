# Planification conversationnelle & appareils connectés

## 1. Planification conversationnelle

### Flux utilisateur
1. `/planning` → l'utilisateur décrit son besoin (texte libre + presets rapides).
2. Paramètres clé : durée (semaines), séances/sem, durée de séance, intensité
   (léger / équilibré / intense), objectif override, focus libre.
3. Clic « Proposer un plan » → `POST /api/coach/plan/propose` (rate-limited).
4. Le service `generateConstrainedPlan` construit un prompt enrichi (profil,
   santé, catalogue exercices, contraintes) et appelle GPT-4o-mini avec un
   JSON-schema strict. Fallback local si OpenAI down.
5. Un `PlanProposal { status: PENDING_USER, expiresAt: +24h }` est stocké.
6. L'utilisateur visualise résumé + 10 premières séances + badges.
7. `POST /api/coach/plan/apply` remplace les séances planifiées par le plan
   accepté (transaction : suppression des `Workout status=PLANNED`, création
   du `TrainingPlan` + `Workout[]` + `WorkoutSet[]`). L'utilisateur est
   redirigé vers `/workout/plan`.
8. `POST /api/coach/plan/reject` rejette la proposition (+ raison optionnelle),
   une nouvelle proposition peut être lancée.

### Presets rapides
- 10 jours de vacances sans matériel (mobilité + cardio)
- Focus haut du corps 4 semaines
- Préparer un 10 km en 8 semaines
- Reprise post-blessure

### Extensions à prévoir (sprints suivants)
- Ajustement en cours de plan : « décale de 2 jours », « remplace la séance de
  mercredi par du yoga » (opérateur LLM → diff sur les Workouts existants).
- Plan récurrent (auto-régénération chaque semaine à l'issue du précédent).
- Intégration calendrier Google/Apple/Outlook (ICS push ou CalDAV).

## 2. Appareils connectés

### Modèles Prisma
- `DeviceConnection` — un par `(userId, provider)`, stocke tokens et date de
  sync.
- `DeviceReading` — une ligne par mesure ; kinds normalisés
  (WEIGHT/SLEEP/STEPS/HEART_RATE/HRV/VO2_MAX/READINESS/...).
- Un hook applicatif : toute lecture `WEIGHT` met à jour `Profile.weightKg` et
  crée un `WeightLog`.

### Providers supportés (catalogue)
Garmin · Fitbit · Oura · Withings · Polar · Strava · Apple Health · Google Fit
· Terra (unifié) · Saisie manuelle.

### Modes d'intégration
- **oauth** : flow standard OAuth 2.0 provider-par-provider. Activation par
  env : `GARMIN_CLIENT_ID`, `FITBIT_CLIENT_ID`, …
  L'endpoint `POST /api/devices/connect/[provider]` retourne une URL
  `authorizeUrl`, le front redirige l'utilisateur vers le provider ; au retour
  implémenter `POST /api/devices/callback/[provider]` (non inclus MVP — dépend
  de chaque provider).
- **terra** : un seul OAuth via le widget Terra
  (`POST /v2/auth/generateWidgetSession`). Nécessite `TERRA_API_KEY`.
  **Recommandé** pour le MVP — couvre la majorité des providers.
- **native** : Apple HealthKit / Google Health Connect, dispo uniquement dans
  l'app mobile (sprint 2 mobile).
- **manual** : disponible par défaut, UI de saisie rapide (poids, sommeil,
  pas) + API `POST /api/devices/readings`.

### Endpoints
- `GET  /api/devices` — liste des connexions actives.
- `POST /api/devices/connect/[provider]` — démarre le flow (OAuth / widget
  Terra / manual).
- `DELETE /api/devices/[id]` — déconnecte un provider.
- `POST /api/devices/readings` — saisir / ingérer une mesure (MANUAL ou
  provider).
- `GET  /api/devices/readings?kind=WEIGHT` — historique d'un type de mesure.

### Ingestion automatique
À faire dans un sprint dédié :
- Worker Inngest `cron(every 30m)` qui pour chaque `DeviceConnection ACTIVE`,
  appelle l'API provider et remplit `DeviceReading[]`.
- Webhooks provider → route `/api/devices/webhook/[provider]`.

### Conformité
- Les lectures santé sont stockées chiffrées (TLS en transit, Postgres au
  repos) + consentement explicite déjà géré par `consentHealthData` au
  moment de l'onboarding.
- Droit à l'effacement : `/api/account/delete` supprime en cascade via les
  `onDelete: Cascade` des relations.
