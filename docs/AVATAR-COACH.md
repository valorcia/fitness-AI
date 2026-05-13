# Avatar Coach — Architecture & roadmap

> Le coach est le **cœur** de Coachmii-fit. Voix ultra-réaliste + avatar photoréaliste + personnalité
> cohérente + expertise réelle. Chaque décision technique doit préserver cet objectif.

---

## 1. Architecture globale

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Client (mobile + web)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────────────┐   │
│  │ Avatar video │  │ Voice capture│  │ Chat (texte + vocal push2 ) │   │
│  │ (HeyGen SDK) │  │ (WebRTC/VAD) │  │ + contexte séance           │   │
│  └──────┬───────┘  └──────┬───────┘  └─────────────┬───────────────┘   │
└─────────┼──────────────────┼─────────────────────────┼─────────────────┘
          │ streaming RTC    │ audio/webm              │ JSON/SSE
          ▼                  ▼                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       Next.js Edge/Node API layer                      │
│                                                                        │
│   POST /api/coach/voice/transcribe   (Whisper STT)                     │
│   POST /api/coach/voice/speak        (TTS → audio stream)              │
│   POST /api/coach/chat               (LLM streaming, persona)          │
│   POST /api/coach/session/start      (WebRTC token, avatar session)    │
│   GET  /api/coach/profiles           (catalogue de coachs)             │
│   POST /api/coach/select/:id         (choix + voice & avatar IDs)      │
└────────────────────────────────────────────────────────────────────────┘
           │              │             │                    │
           ▼              ▼             ▼                    ▼
   ┌────────────┐  ┌────────────┐ ┌────────────┐   ┌────────────────────┐
   │  Whisper   │  │ ElevenLabs │ │ GPT-4o /   │   │ HeyGen / D-ID /    │
   │ OpenAI STT │  │ (ou OpenAI │ │ Claude     │   │ LiveKit Agents     │
   │            │  │  TTS)      │ │ + RAG      │   │ (avatar video)     │
   └────────────┘  └────────────┘ └─────┬──────┘   └────────────────────┘
                                        ▼
                                 ┌──────────────┐
                                 │ Postgres     │
                                 │ + pgvector   │
                                 │ (RAG memory) │
                                 └──────────────┘
```

## 2. Flux voix bidirectionnel (latence cible < 1.5 s)

```
Mic → VAD (client) → chunks 200 ms
   → /api/coach/voice/transcribe (Whisper)   [~250 ms]
   → /api/coach/chat                         [LLM streaming, ~300 ms TTFT]
   → /api/coach/voice/speak (ElevenLabs)     [streaming audio, ~250 ms TTFB]
   → Audio element + lip-sync vers HeyGen    [50 ms]
```

Alternative « all-in-one » : **OpenAI Realtime API** (voice-to-voice natif, latence ~700 ms bout-en-bout, simplifie massivement l'intégration).

## 3. Modèle de données

```prisma
model CoachProfile {
  id            String   @id @default(cuid())
  slug          String   @unique       // alex, lea, marcus…
  displayName   String
  gender        String                  // male | female | neutral
  ageYears      Int
  ethnicity     String?                 // self-declared for diversity display
  specialty     String                  // musculation | cardio | crossfit | perte-poids | fitness | elite
  style         String                  // MILITARY | FRIENDLY | EXPERT
  bio           String
  tagline       String
  portraitUrl   String                  // photorealistic still
  bodyUrl       String?                 // full-body image
  elevenLabsVoiceId String?
  openaiVoice   String?                 // alloy | echo | shimmer | fable | onyx | nova
  heygenAvatarId String?
  sampleAudioUrl String?                // 10s voice sample for preview
  locales       String[] @default(["fr"])
  isPremium     Boolean  @default(false)
  active        Boolean  @default(true)
}

model Preference {
  ...
  coachProfileId  String?        // selected CoachProfile
  coachVoiceMode  String  @default("tts")  // tts | avatar | text
}
```

## 4. Modes d'interaction

1. **Plein écran (onboarding, bilan hebdo, moment clé)** — stream vidéo HeyGen plein écran + voix.
2. **Médaillon séance** — mini coach en coin, intervient aux moments clés (fin de série, repos). Voix uniquement si l'utilisateur regarde l'exercice.
3. **Audio seul (outdoor/cardio)** — ElevenLabs streaming, aucun rendu vidéo.
4. **Chat texte + audio optionnel** — chat classique, bouton ▶ sur chaque message du coach.
5. **Push-to-talk vs. always-on VAD** — par défaut push-to-talk (bouton micro), always-on sur Premium.

## 5. Catalogue de coachs (8 → 16 profils)

| Slug | Nom | Genre | Âge | Spécialité | Style | Voix ElevenLabs | Avatar HeyGen |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `alex` | Alex Morel | M | 34 | Musculation | MILITARY | `ErXwobaYiN019PkySvjV` | *à provisionner* |
| `lea` | Léa Chen | F | 29 | Cardio/endurance | FRIENDLY | `EXAVITQu4vr4xnSDxMaL` | *à provisionner* |
| `marcus` | Marcus Diallo | M | 41 | Crossfit | EXPERT | `VR6AewLTigWG4xSOukaG` | *à provisionner* |
| `sofia` | Sofia Rossi | F | 37 | Perte de poids & nutrition | FRIENDLY | `MF3mGyEYCl7XYWbV9V6O` | *à provisionner* |
| `sam` | Sam Jensen | N | 32 | Remise en forme | FRIENDLY | `pNInz6obpgDQGcFmaJgB` | *à provisionner* |
| `kenji` | Kenji Takeda | M | 45 | Mobilité / récupération | EXPERT | `TxGEqnHWrfWFTfGW9XjX` | *à provisionner* |
| `nora` | Nora Haddad | F | 31 | Running | MILITARY | `yoZ06aMxZJJ28mfd3POQ` | *à provisionner* |
| `maya` | Maya Johnson | F | 48 | Coaching longévité | EXPERT | `oWAxZoI1aAwrhHvPlQ1h` | *à provisionner* |

Les voix ElevenLabs ci-dessus sont leurs IDs publiques françaises/anglaises par défaut — à
remplacer par vos propres voix cloneées en production.

Chaque coach a :
- **Portrait photoréaliste** (Unsplash ou commissionné) — vue mi-corps, studio propre.
- **Plein corps** — pour la version premium / bilan vidéo.
- **Clip audio 10 s** — sample joué au moment de la sélection.
- **Bio crédible** — parcours, spécialités, philosophie.
- **3 tenues** — séance / discussion / récupération (pour version HeyGen).

## 6. Moteur d'émotion (voix + expression)

```ts
type EmotionContext =
  | "motivational"   // encouragement explosif
  | "supportive"    // fatigue, doute, échec
  | "analytic"      // explication technique
  | "celebratory"   // PR, streak, fin de plan
  | "corrective"    // erreur de forme, sécurité
  | "checkin";      // ouverture quotidienne

function pickEmotion(ctx: {
  userMsg: string;
  recentPerf: "up" | "flat" | "down";
  hour: number;
  fatigue: number; // 0..10
}): EmotionContext { ... }
```

Mappée sur :
- `voice_settings.stability`, `similarity_boost`, `style_exaggeration`
- HeyGen `expression` + `head_movement`
- SSML pour Google/Azure (`<prosody>`, `<break>`, `<emphasis>`)

## 7. RAG mémoire

- pgvector sur Postgres (déjà en place via Prisma `extensions = [pgcrypto, citext]`).
- Table `CoachMemory { userId, embedding, kind, content, createdAt }`.
- Kinds : `injury`, `goal`, `preference`, `life_event`, `perf_record`, `conversation`.
- Ingestion automatique après chaque séance, feedback, conversation.
- Recherche top-k cosine à chaque prompt pour injecter 3-5 souvenirs pertinents.

## 8. FAQ + LLM hybride

- `coach_faq` table : 200+ Q/R pré-rédigées (technique, nutrition, mindset).
- À chaque question, embedding + top-1 cosine. Si similarité > 0.88 → réponse FAQ direct.
- Sinon LLM streaming avec prompt persona + RAG.
- Réponses FAQ converties en audio et mises en cache CDN.

## 9. Budget indicatif (1 000 utilisateurs actifs, 20 min voix / jour)

| Poste | Tarif | Volume mensuel | Coût |
| --- | --- | --- | --- |
| OpenAI Realtime voice | 0.06€ in + 0.24€ out /min | 600 000 min | ~16 200€ |
| **ou** ElevenLabs + Whisper + GPT-4o | 0.30€ / 1k char + 0.006€/min | équivalent | ~4 800€ |
| HeyGen streaming (premium only, 10%) | 0.80€/min | 60 000 min | ~4 800€ |
| Infra (Vercel + Postgres + Redis) | | | ~500€ |
| **Total** ~FREE+PREMIUM | | | ~10 100€/mois |

Optimisations obligatoires :
- Cache audio (greetings, encouragements standard) — 30 à 50 % d'économie.
- Pré-génération hebdo bilan vidéo (pas de streaming live).
- Tier FREE → texte + voix cached only, pas d'avatar vidéo.
- Pool TTS : regroupement des requêtes courtes.
- Compression audio adaptative (WebM Opus 24 kbps mobile).

## 10. Roadmap sprint par sprint

### Sprint 1 — POC vocal (cette branche commence ici)
- `POST /api/coach/voice/speak` — OpenAI TTS streaming, retour audio/mpeg.
- `POST /api/coach/voice/transcribe` — Whisper multipart upload.
- Bouton lecture sur chaque message du coach.
- Bouton micro push-to-talk sur `/coach`.
- Cache simple LRU in-memory pour phrases courantes.

### Sprint 2 — Catalogue coachs photoréalistes
- Schéma `CoachProfile` + seed de 8 profils.
- Galerie sélection avec portrait + preview audio.
- Stockage voice ID ElevenLabs + `heygenAvatarId`.
- Migration de la préférence existante (`coachAvatar` → `coachProfileId`).

### Sprint 3 — ElevenLabs + emotion engine
- Provider ElevenLabs (stream) derrière la même route `/speak?provider=elevenlabs`.
- `pickEmotion()` modulation des paramètres vocaux.
- SSML / contexte LLM pour varier le ton.
- Cache audio cloud (Vercel Blob ou R2) par hash(text + voice + emotion).

### Sprint 4 — Conversation vocale temps réel
- OpenAI Realtime API (alternative complète).
- VAD client (silero VAD.js ou rnnoise).
- Interrupt handling + barge-in.
- Mode mains libres (détection activation « Hey {coachName} »).

### Sprint 5 — Avatar vidéo streaming
- Intégration HeyGen Interactive Avatar SDK (web + mobile via webview).
- Route `/api/coach/session/start` — token éphémère HeyGen.
- Avatar plein écran dans `/coach`, médaillon dans `/workout/[id]`.
- Pré-génération des vidéos de bilan hebdo via webhook Inngest.

### Sprint 6 — RAG mémoire long terme
- Table `CoachMemory`, extension pgvector.
- Ingestion continue (onboarding, séance, feedback, post).
- Injection top-k dans le prompt LLM.
- UI « ce que votre coach se souvient » dans Paramètres.

### Sprint 7 — A/B testing & rétention
- GrowthBook ou flagsmith.
- Experiences : voix A/B, persona A/B, avatar on/off.
- Tracking PostHog : durée conversation, complétion de séance, 7-day retention.

### Sprint 8 — Multilingue & accessibilité
- i18n `next-intl`, voix ElevenLabs en FR/EN/ES/IT/DE/PT.
- Sous-titres auto (Whisper diarization) sur les vidéos coach.
- Mode texte-seul / audio-seul / complet exposés à l'utilisateur.

## 11. Sécurité, éthique, RGPD

- **Transparence** : badge discret « Coach IA » + pages dédiées dans /manual.
- **Consentement** : capture audio opt-in, stockage 30 jours max, droit à l'effacement direct.
- **Deepfake** : uniquement pour avatars créés en interne avec contrats acteurs ; interdiction absolue de copier une personne réelle non consentante.
- **Licence voix** : ElevenLabs Pro/Enterprise obligatoire pour voice cloning à grande échelle.
- **Disclaimer** : sortie systématique de doc médicale dès qu'un sujet santé survient.
- **Anti-troubles alimentaires / body-shaming** : filtre de sortie + redirection pro santé (déjà câblé dans `lib/ai/personas.ts`).
- **Logs** : pas d'audio brut conservé en production, seulement la transcription si l'utilisateur consent.

## 12. Décisions ouvertes à valider

1. **OpenAI Realtime** vs. **ElevenLabs + Whisper + GPT-4o** ?
   - Realtime plus simple, latence meilleure, coût ~3 × supérieur.
   - Recommandation : **ElevenLabs + GPT-4o + Whisper** pour le v1, migration possible.
2. **HeyGen** vs. **D-ID** vs. **Soul Machines** ?
   - HeyGen Interactive Avatar est actuellement le meilleur équilibre qualité/latence.
3. **Voice cloning custom** vs. voix ElevenLabs existantes ?
   - Phase 1 : voix catalogues. Phase 3+ : cloning interne acteurs réels sous contrat.
4. **Gate avatar vidéo** : Pro & Elite uniquement ? (recommandé pour coûts).
