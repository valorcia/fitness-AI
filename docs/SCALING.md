# Scaling plan — 0 → 1M users

## Stages

### 0 – 10k MAU

- Vercel Hobby/Pro, Supabase/Neon free/dev tier.
- Single Postgres region, Upstash free plan.
- Metrics: p95 < 300ms on app routes, error budget 99.9%.

### 10k – 100k MAU

- Vercel Pro + ISR on marketing pages.
- Postgres: move to Neon Scale or Supabase Pro; enable read replicas per region.
- Redis: Upstash Pay-as-you-go, partition keys per user.
- Queues: Inngest paid; dedicated workers for GPS batching, notifications, billing.
- Edge: push auth-light pages to Edge runtime; enable PoP caching for public endpoints.
- Observability: Sentry Team, PostHog cloud, SLO dashboards.
- Mobile: TestFlight + Play internal → public launch with staged rollout.

### 100k – 1M MAU

- Multi-region Postgres (primary + 2 replicas), latency-based routing.
- Partition GPS tables (daily or monthly) — Timescale/Citus candidates.
- Read-heavy catalog served from Redis + stale-while-revalidate.
- Separate Node workers (Inngest / dedicated Fly.io or Render) for TTS, plan generation, embeddings.
- Rate limits tuned per tier (Free strict, Elite generous).
- Geographic edge fan-out for assets (Cloudflare R2 or Vercel Blob).
- Data warehouse: ship BigQuery/Snowflake via Fivetran for product analytics.
- Cost controls: LLM routing (GPT-4o-mini default, escalate only when needed), embedding reuse.

## Performance budget

| Surface | p95 TTFB | p95 LCP | JS budget |
| --- | --- | --- | --- |
| Marketing | 150ms | 1.5s | 90kb |
| Dashboard | 300ms | 2.0s | 180kb |
| Workout live | 250ms | 2.0s | 220kb |
| Outdoor live | 400ms | 2.5s | 260kb |

## Database indexes

- Composite `(userId, scheduledFor)` on `Workout` (dashboard queries).
- `(userId, createdAt)` on `XPEntry`, `AuditLog`, `HydrationLog` (timelines).
- GIN on `conditions`/`medications` arrays when searched.
- Consider pgvector extension for exercise similarity / RAG of coach memory.

## Cost modelling (monthly, USD, ~100k MAU)

| Line | Estimate |
| --- | --- |
| Vercel Pro + usage | 400 |
| Postgres (Neon/Supabase) | 300 |
| Upstash Redis | 80 |
| OpenAI (LLM + TTS + Whisper) | 1,800 |
| Sentry + PostHog | 180 |
| Twilio/Resend (SOS, email) | 120 |
| **Total** | **~2,880** |

Margin target: 70% gross on Premium tier at 9,90€.

## Incident runbook

1. Sentry alert or PostHog anomaly fires.
2. On-call checks `/status` dashboard (synthetic probes).
3. Roll forward via Vercel deploy or feature-flag kill switch.
4. If DB: fail over to replica, pause background jobs, announce via statuspage.
5. Post-mortem within 48h, action items tagged in Linear.
