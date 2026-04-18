# Security & Compliance

## Principles

- Least privilege everywhere (DB roles, Vercel envs, Stripe restricted keys).
- Defense in depth: CSP, HSTS, rate limits, audit trail, signed URLs.
- Health data treated as sensitive: explicit consent, minimised, encrypted at rest by provider.
- No raw credentials in logs or Sentry breadcrumbs.

## GDPR / health data

- `Consent` model stores granular opt-ins with version.
- `DELETE /api/account` performs soft delete (30-day grace) then hard delete cascade.
- Right to portability: `GET /api/account/export` returns JSON + CSV dump.
- DPO contact in Privacy policy; processors list maintained in `/legal/processors`.

## Auth hardening

- Auth.js v5 sessions (JWT by default; rotate `AUTH_SECRET` quarterly).
- Password hashing with bcrypt (12 rounds) via custom credentials provider if enabled.
- Suspicious login detection: IP + UA diff → email notification.
- Device sessions visible under `/settings/security`.

## API hardening

- Zod validation at every boundary.
- Upstash sliding-window rate limit per user and per IP.
- CSRF: same-site lax + origin check on state-changing routes.
- Stripe webhooks verified with raw body + signature (Node runtime).

## Threat model quick reference

| Threat | Mitigation |
| --- | --- |
| Prompt injection | System prompt + structured output + allowlists + content filter. |
| Account takeover | Email-based magic link, breach password check, rate limit. |
| IDOR on workouts | Prisma queries always filter by `userId` from session. |
| PII leak via logs | Pino serializers strip `email`, `token`, `phone`. |
| Stripe replay | Webhook secret + idempotency keys. |
| SOS abuse | Per-user daily cap, cool-down before re-trigger. |

## Secrets management

- `.env.local` never committed (enforced by `.gitignore`).
- Production secrets in Vercel encrypted env, scoped to environment.
- Rotation cadence: Auth secret 90d, Stripe keys 180d, OpenAI 180d.

## Audit & monitoring

- `AuditLog` for authz-sensitive actions (role change, data export, billing).
- Sentry alerts on >5 errors/min in any route group.
- PostHog alerts on drop in `workout_completed` > 20% day-over-day.

## Responsible disclosure

security@pulsecoach.ai — 90-day coordinated disclosure.
