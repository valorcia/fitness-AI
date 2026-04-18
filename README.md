# PulseCoach AI

> Premium AI fitness coaching — web, PWA, iOS & Android. Built for scale (1M+ users).

PulseCoach AI is a production-grade SaaS starter that pairs a conversational,
voice-driven AI coach with adaptive training, outdoor GPS tracking, gamification,
safety tooling and subscription billing.

## Highlights

- Next.js 15 App Router + React 19, TypeScript strict, Server Components first.
- Auth.js v5 (email + Google + Apple + Facebook), Prisma + Postgres (Supabase/Neon).
- Stripe subscriptions (Free / Premium 9,90€ / Pro 19,90€ / Elite 29,90€).
- OpenAI-powered coach: plan generation, adaptive feedback, TTS/STT voice.
- Upstash Redis for rate limiting & edge cache, Sentry + PostHog for observability.
- Security headers, GDPR consent ledger, audit logs, SOS & safety events.
- Tailwind + Radix primitives (ShadCN-style), Framer Motion, Zustand, TanStack Query.
- GitHub Actions CI (lint + typecheck + unit), Playwright e2e scaffold.

## Quickstart

```bash
pnpm install         # or npm / yarn
cp .env.example .env.local
pnpm prisma migrate dev
pnpm db:seed
pnpm dev
```

Open http://localhost:3000.

## Repository layout

```
src/
  app/                 # Next.js App Router (marketing, app, admin, api)
  components/          # Reusable UI (primitives + composite)
  features/            # Domain features (coach, workout, outdoor, nutrition, safety)
  lib/                 # Framework-agnostic helpers (prisma, auth, stripe, openai, redis)
  hooks/               # React hooks
  services/            # Orchestration (plan generator, adaptive engine, telemetry)
  types/               # Shared types
prisma/                # schema, migrations, seed
tests/                 # unit + e2e
.github/workflows/     # CI
docs/                  # ARCHITECTURE, ROADMAP, SCALING, SECURITY
```

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — layers, data flow, edge vs node.
- [docs/ROADMAP.md](docs/ROADMAP.md) — sprint-by-sprint execution plan.
- [docs/SCALING.md](docs/SCALING.md) — path from 0 → 100k → 1M users.
- [docs/SECURITY.md](docs/SECURITY.md) — GDPR, health data, threat model.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Local dev server |
| `pnpm build` | Production build (generates Prisma client) |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript `--noEmit` |
| `pnpm test` | Vitest unit tests |
| `pnpm test:e2e` | Playwright e2e |
| `pnpm db:seed` | Seed exercises/badges/flags |

## License

Proprietary — PulseCoach AI. All rights reserved.
