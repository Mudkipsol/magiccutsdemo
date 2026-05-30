# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Production website + booking system for **Magic Cuts Salon** (Dublin, OH). A
Vite/React/Tailwind single-page app, backed by Supabase (Postgres + Auth + RLS),
Stripe deposits, Resend email, Twilio SMS, and an "AI Growth Engine" agent layer.
Deployed on Netlify (static build + Functions).

## Commands

```bash
npm install
cp .env.example .env.local   # fill in keys (see README for the full table)
npm run dev                  # vite dev server on http://localhost:5173
npm run build                # production build to dist/
npm run preview              # serve the built bundle
npm run shots                # puppeteer screenshots (scripts/screenshots.mjs → shots/)
```

There is **no test suite, linter, or typechecker** configured. "Verifying"
a change means running `npm run build` and/or exercising it in `npm run dev`.

Netlify Functions are served at `/api/*` (see `netlify.toml` redirect). When
running `npm run dev` alone, only the front end runs — Functions require
`netlify dev` (Netlify CLI) to be exercised locally.

### Demo / degraded mode

The app is built to run **without** backend keys. `src/lib/supabase.js` exports
`hasSupabase` and a possibly-null `supabase` client; `_lib/ai.js` exports
`aiEnabled()`. When keys are missing, booking can be skipped, the dashboard shows
empty data, and the AI layer returns a static fallback reply. Preserve this
graceful degradation — guard backend calls with these checks rather than
assuming a client exists.

## Architecture

### Front end (`src/`)
- `App.jsx` — `BrowserRouter` + all routes, wrapped in `ErrorBoundary`. Routes:
  `/` (home), `/book`, `/manage?id=`, `/account` (+ `/login`, `/register`
  aliases), `/gallery`, `/privacy`, `/terms`, `/unsubscribe`, `/dashboard`
  (owner), `/barber` (barber portal), `*` (404).
- `data.js` — **static shop content** (services, hours, FAQ, testimonials) and
  the **barber roster**. See "Barber IDs" below — this file is one of two places
  the UUIDs must agree.
- `store/` — Zustand. `bookingStore` is `persist`ed to localStorage (`mc-booking`)
  so a refresh mid-wizard keeps state; it deliberately does NOT persist confirmed
  state (step resets to 1 once past 5). `authStore.init()` is called once from
  `App` and subscribes to Supabase `onAuthStateChange`, loading
  `user_profiles.{role, barber_id}`.
- `flows/booking/Step1–6*.jsx` — the 6-step booking wizard (service → barber →
  calendar → contact → Stripe payment → confirm).
- `lib/availability.js` — **single source of truth** for slot/day availability,
  shared by the booking calendar. Slots are fixed half-hours 10:00–18:30; Sundays
  closed by default; per-barber `schedule` (7-item Mon-first array) overrides hours.
  Note: the server agent (`_lib/tools.js`) **mirrors** this logic rather than
  importing it (it can't import from `src/`); keep the two in sync.

### Roles & accounts
Two account kinds, both Supabase Auth users:
- **Customers** self-register at `/account` via `authStore.signUp`. They have NO
  `user_profiles` row — a customer is just an authenticated user, scoped by RLS to
  appointments matching their login email (migration 003).
- **Staff** (owner/barber) never self-register. The owner creates barber logins
  from the dashboard, which calls `create-staff.js` (service-role). The first
  owner is created manually via SQL (`insert into user_profiles … role='owner'`).

### Backend (`netlify/functions/`)
Each top-level `.js` is a deployed Function (Web Request/Response API, e.g.
`export default async (req) => …` with `export const config = { path: '/api/…' }`).
Files under `_lib/` are **shared helpers, NOT deployed** as standalone functions:
- `_lib/admin.js` — service-role Supabase client (bypasses RLS), `requireOwner(req)`
  bearer-token guard, in-memory `checkRate`, `normalizePhone`.
- `_lib/ai.js` — provider-agnostic Qwen client (Groq + Cerebras, OpenAI-compatible
  `/chat/completions`). `chat()` does failover between providers; `runTools()` is
  the tool-calling loop. Models default to `qwen/qwen3-32b`.
- `_lib/tools.js` — agent tool **schemas** (`TOOLS`) + `makeExecutors()` that run
  them against the DB.
- `_lib/guardrails.js` — `gateOutbound()`: every agent-initiated message passes
  through this (kill switch, consent, `do_not_contact`, quiet hours, frequency
  caps, and an autonomy mode of `auto` vs `approval`). `logAction()` writes the
  `agent_actions` audit log. Settings come from `shop_settings` keys
  (`ai_autonomy`, `ai_quiet_hours`, `ai_frequency_caps`, `ai_kill_switch`).
- `_lib/messaging.js` — Resend (`sendEmail`) + Twilio (`sendSMS`) wrappers.

Key endpoints: `create-payment-intent` + `stripe-webhook` (deposit confirmed
server-side), `create-appointment`, `create-staff`, `agent-chat` (powers the
floating `ChatWidget`), `agent-rebooking` / `agent-reminders` (lifecycle SMS),
`send-marketing`, `send-review-request`, `sms-inbound` (Twilio webhook, two-way),
`approve-action` (owner one-tap approval of queued marketing).

### Scheduled functions
Configured in `netlify.toml`. `send-review-request` runs `@hourly` (texts a
Google-review link ~2–4h post-appointment, once per appt via
`appointments.review_sms_sent`). Appointment times are shop-local but compared
against server UTC, so the matching window is intentionally wide.

### Database (`supabase/migrations/`)
Run migrations **in order** in the Supabase SQL editor. New tables are owner-only
via RLS (`is_owner()` from 001); service-role functions bypass RLS.
- `001` initial schema (user_profiles, barbers, appointments) + seed
- `002` double-booking guard, `shop_settings`, **re-seeds `barbers` with fixed UUIDs**
- `003` customer accounts + RLS scoping
- `004` barber portal: per-barber `schedule` + photo uploads
- `005` AI Growth Engine: `customers` (RFM/lifecycle), `conversations`, `messages`,
  `agent_actions`, `campaigns`, `waitlist`; backfills customers from appointments
- `006` barber name fixes

## Critical invariants

- **Barber IDs**: the UUIDs in `src/data.js` MUST match the seeded rows in
  `supabase/migrations/002_improvements.sql`. They are stored on
  `appointments.barber_id` (a UUID FK). Change one place → change both, or bookings
  fail the FK constraint.
- **`availability.js` ↔ `_lib/tools.js`**: the client and the server agent compute
  slots independently; the slot list, Sunday-closed rule, and Mon-first schedule
  indexing must stay identical in both.
- **Secrets vs. client env**: only `VITE_`-prefixed vars reach the browser. Never
  put a secret (service role key, Stripe secret, Twilio token, AI keys) behind a
  `VITE_` prefix. `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS — server only.
- **Agent sends**: never bypass `gateOutbound()` for agent-initiated messages —
  it enforces consent/compliance (STOP opt-out, quiet hours, caps, kill switch).
