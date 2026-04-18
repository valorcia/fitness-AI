# Mobile apps (Expo)

The web app is a full-feature PWA today. The native iOS/Android apps will be
delivered via an Expo shell that reuses the existing REST API and Auth.js session.

## Recommended layout

```
apps/
  web/        # this Next.js project
  mobile/     # Expo Router, shares @pulsecoach/ui, @pulsecoach/api-client
packages/
  ui/         # tokens + primitives usable in React Native
  api-client/ # typed fetchers against /api/*
  types/      # shared DTO types
```

## Sprints

- **Sprint 2** — Expo shell, deep links, push, Apple Health + Google Fit.
- **Sprint 5** — Apple In-App Purchase + Google Play Billing parity with Stripe entitlements.
- **Sprint 8** — TestFlight + Play internal → public launch.

## Feature parity checklist

- [ ] Auth (magic link + OAuth via in-app browser)
- [ ] Onboarding wizard
- [ ] Dashboard
- [ ] Workout player (timers, voice, haptics)
- [ ] Outdoor GPS (background location, HealthKit)
- [ ] SOS + fall detection
- [ ] Nutrition + hydration reminders (push + local notifications)
- [ ] Subscription (IAP + restore purchases)

## Shared assumptions

- All backend calls go through `/api/*`.
- Session via Auth.js cookie (web) or signed JWT issued by `/api/mobile/token` (to be added).
- Feature flags served by `GET /api/flags` for dynamic rollout on mobile clients.
