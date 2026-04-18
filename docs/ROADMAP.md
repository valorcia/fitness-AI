# Roadmap

Cadence: 2-week sprints. Each sprint ships to production behind feature flags.

## Sprint 0 — Foundations (done in this starter)

- Next.js 15 + TS strict, Tailwind + Radix, Prisma schema.
- Auth.js v5 scaffolding, middleware, session helpers.
- Marketing landing, auth pages, onboarding flow.
- Dashboard shell, workout player, outdoor map placeholder.
- Stripe checkout + webhook skeleton.
- OpenAI coach endpoint (streaming).
- CI (lint + typecheck + unit), Playwright scaffold.

## Sprint 1 — Training engine

- Full exercise catalog (300+) + media assets.
- AI plan generator with structured output + guardrails.
- Adaptive engine v1 (progressive overload, stagnation detection).
- Workout player polish: rest timer, audio cues, persona TTS.

## Sprint 2 — Outdoor & Health integrations

- Expo mobile shell (shared API, deep linking).
- Apple Health / Google Fit sync.
- Real-time GPS session (WebSocket), offline queue.
- HR zones, cadence, pace-based fractionné.

## Sprint 3 — Nutrition & Recovery

- Barcode/OFF food lookup, daily macro target.
- Hydration smart reminders (meteo-aware).
- Sleep ingestion + fatigue score.
- Weekly recovery recommendation.

## Sprint 4 — Safety premium

- SOS + SMS/email dispatch via Twilio/Resend.
- Live position sharing (signed short-lived URL).
- Fall detection heuristic (accelerometer + confirmation dialog).
- Risk-zone geofencing.

## Sprint 5 — Gamification & Social

- XP ledger, streaks, badges, monthly challenges.
- Friends, group leaderboards, team challenges (B2B).
- Shareable result cards (OG image generator).

## Sprint 6 — Admin & Analytics

- Admin panel: users, subscriptions, feature flags, audit log.
- PostHog dashboards + funnel alarms.
- Churn model, cohort retention.

## Sprint 7 — Internationalisation & SEO

- i18n (fr, en, es, de, it, pt-BR).
- Marketing blog (MDX), structured data, sitemap, OG images.
- Compare pages vs competitors.

## Sprint 8 — Mobile launch

- TestFlight + Play Store internal.
- In-App Purchase (Apple) + Google Play Billing integration.
- Push notifications (Expo + APNs + FCM).

## Continuous

- Security patching, Sentry triage SLO < 24h.
- Red-team LLM prompts quarterly.
- Load tests before each major release (k6 scenarios committed).
