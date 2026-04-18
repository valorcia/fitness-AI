# Architecture

## Goals

- **Scalable**: stateless Next.js runtime on Vercel, Postgres for durable state, Redis for hot paths, queues for async work.
- **Secure by design**: strict CSP/HSTS, health-data consent, audit logs, rate-limited APIs.
- **Premium UX**: App Router server components, edge rendering, aggressive caching, Framer Motion.
- **Multi-surface**: Web + PWA today; React Native (Expo) shell planned (see ROADMAP) — shares REST/JSON API and auth.

## Layers

```
┌─────────────────────────────────────────────┐
│  Clients: Web (Next.js), PWA, iOS, Android  │
└───────────────┬─────────────────────────────┘
                │ HTTPS, JWT session
                ▼
┌─────────────────────────────────────────────┐
│  Edge / CDN (Vercel)                        │
│   - Static & ISR                            │
│   - Edge middleware (auth gate, geo, locale)│
└───────────────┬─────────────────────────────┘
                ▼
┌─────────────────────────────────────────────┐
│  Next.js runtime (Node + Edge)              │
│   - Server Components                       │
│   - Route Handlers (REST) / Server Actions  │
└──────┬─────────┬────────────┬───────────────┘
       │         │            │
       ▼         ▼            ▼
┌──────────┐ ┌────────┐ ┌─────────────┐
│ Postgres │ │ Redis  │ │ Queues       │
│ Supabase │ │ Upstash│ │ Inngest /    │
│  / Neon  │ │        │ │ Trigger.dev  │
└──────────┘ └────────┘ └─────────────┘
       │
       ▼
┌─────────────────────────────────────────────┐
│  External services                          │
│   - Stripe (billing + webhooks)             │
│   - OpenAI (chat, TTS, Whisper, embeddings) │
│   - Apple Health / Google Fit (native)      │
│   - Sentry / PostHog / Resend               │
└─────────────────────────────────────────────┘
```

## Key flows

### Onboarding → personalised plan

1. Client submits multi-step form (`/onboarding`).
2. Server validates with Zod, persists `Profile` + `HealthProfile`.
3. `services/plan-generator.ts` calls OpenAI with structured JSON schema.
4. Plan is written as a `TrainingPlan` + the next N `Workout` rows.
5. PostHog event fired; welcome notification queued.

### Coach conversation (SSE / Web stream)

- `POST /api/coach/chat` runs on Node runtime (OpenAI streaming).
- Rate-limited per user (Upstash sliding-window 20 req/min).
- Personality prompts live in `lib/ai/personas.ts`.

### Adaptive training engine

- After a workout, user submits `WorkoutFeedback` (difficulty, pain, RPE…).
- `services/adaptive-engine.ts` adjusts next session's volume, intensity and rest.
- Stagnation detection: 2 consecutive sessions without progression → suggest variation.

### Outdoor GPS live

- Mobile/PWA streams geolocation over WebSocket (or batched POST every 5s).
- Server aggregates into `OutdoorActivity` + `GpsPoint` (TimescaleDB-friendly).
- Polyline encoded for display (`@mapbox/polyline`).

### Safety / SOS

- Single tap publishes a `SafetyEvent` with geo.
- Queue dispatches SMS/email to primary `SafetyContact`.
- Missed check-in workers run every minute (Inngest cron).

### Billing

- Stripe Checkout session from `/api/stripe/checkout`.
- Webhook at `/api/stripe/webhook` updates `Subscription`.
- Feature gating via `lib/billing/entitlements.ts`.

## Runtimes

| Route | Runtime | Why |
| --- | --- | --- |
| Marketing pages | Edge/ISR | Static-first, global CDN |
| `/api/coach/chat` | Node | OpenAI streaming, long timeouts |
| `/api/stripe/webhook` | Node | Raw body verification |
| Auth.js | Node | Prisma adapter |
| `/api/geo/ip` | Edge | Low-latency personalization |

## Caching strategy

- `unstable_cache` for catalog queries (exercises, badges).
- `revalidateTag` after mutations.
- Redis: user entitlements, rate limits, active workout session state.
- HTTP: `Cache-Control: public, s-maxage=60, stale-while-revalidate=600` on marketing pages.

## Multi-tenant readiness

- `Team` + `TeamMember` models enable B2B challenges today.
- Admin console scoped via `role === ADMIN`; per-team scoping via middleware when activated.
- Row-level security (Supabase RLS) recommended when exposing Postgres directly.

## Observability

- Sentry (browser + server) with user context scrubbed (no PII in health data).
- PostHog events: `onboarding_completed`, `workout_completed`, `plan_generated`, `subscription_upgraded`.
- Structured logs via `pino` (see `lib/logger.ts`).
