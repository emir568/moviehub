# MovieHub - Production-Ready Full Stack Streaming Platform

MovieHub is a deployment-ready monorepo for a streaming application with real monetization and account flows.

## What is included

- **Frontend (Next.js / Vercel-ready)**
  - Authentication with NextAuth (Email + Password, Google OAuth provider wiring)
  - Pricing/paywall UX for subscription + one-time purchase checkouts
  - Session-aware dashboard and protected calls to backend APIs
- **Backend (Express / Render-ready)**
  - JWT auth, registration/login endpoints
  - Stripe checkout for subscriptions and one-time payments
  - Stripe webhook processing for entitlement provisioning
  - Freemium/paywall enforcement route for stream URLs
  - Security middleware: Helmet, CORS, rate-limiting
- **Data layer (Supabase PostgreSQL + Prisma)**
  - Prisma schema for users, plans, and purchases
- **Cloud deployment configs**
  - `vercel.json` for frontend deploy
  - `render.yaml` for backend deploy
  - `supabase/config.toml` for Supabase local/project config
  - `firebase/firebase.json` for optional Firebase hosting/functions setup

## Monorepo layout

```txt
apps/
  web/      # Next.js frontend
  api/      # Express API backend
packages/
  shared/   # Shared schemas/types
```

## Quickstart

1. Install dependencies
   ```bash
   npm install
   ```
2. Configure env files
   - `apps/api/.env.example` -> `apps/api/.env`
   - `apps/web/.env.example` -> `apps/web/.env.local`
3. Generate Prisma client
   ```bash
   npm run prisma:generate --workspace=@moviehub/api
   ```
4. Run dev servers
   ```bash
   npm run dev
   ```

## Monetization flows

1. **Subscription (Stripe Checkout)**
   - frontend calls `/billing/checkout/subscription`
   - webhook sets user `plan = PREMIUM`
2. **One-time purchase (Stripe Checkout)**
   - frontend calls `/billing/checkout/one-time` with `movieId`
   - webhook records purchase entitlement
3. **Paywall enforcement**
   - `/content/movies/:id/stream-url` checks `PREMIUM` plan or purchase record
   - returns `402 Payment Required` with paywall metadata if not entitled

## Scale/production notes

- Stateless API + JWT for horizontal scaling.
- Rate limiting and secure headers enabled.
- Database-backed entitlements (no in-memory state).
- Stripe webhooks are idempotent-friendly by design target; add explicit event persistence in high-volume production.
- Add background queues (BullMQ/SQS) for asynchronous provisioning when needed.
- Add observability stack (OpenTelemetry + centralized logs) before high traffic launch.

## Next hardening steps

- Add refresh token rotation and revocation list.
- Implement robust OAuth token exchange endpoint in API.
- Add transactional email provider (Resend/Sendgrid) for verification + password reset.
- Add integration tests for webhook and paywall access matrix.
