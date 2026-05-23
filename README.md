# Magic Cuts Salon

Production website + booking system for Magic Cuts Salon (Dublin, OH).
Vite + React + Tailwind front end, Supabase database/auth, Stripe deposits,
Resend email, Twilio SMS, deployed on Netlify.

## Stack

- **Front end:** Vite, React 18, React Router 7, Tailwind CSS 3, Framer Motion
- **State:** Zustand (`bookingStore` persists across refresh, `authStore`)
- **Backend:** Supabase (Postgres + Auth + RLS + Realtime)
- **Payments:** Stripe PaymentElement ($11 deposit) + webhook
- **Email:** Resend (confirmations, owner notifications, marketing)
- **SMS:** Twilio (confirmations, post-visit review requests)
- **Hosting:** Netlify (static build + Functions, including one scheduled function)

## Local development

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev                  # http://localhost:5173
```

Without Supabase/Stripe keys the app runs in a degraded "demo mode" (booking
can be skipped, dashboard shows empty data). All keys are documented in
`.env.example`.

## Environment variables

Set these in **Netlify → Site settings → Environment variables**. Only the
`VITE_`-prefixed ones are exposed to the browser — never put a secret behind a
`VITE_` prefix.

| Variable | Where | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | client | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | client | Public anon key (safe to expose) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | client | Stripe publishable key |
| `STRIPE_SECRET_KEY` | server | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | server | Verifies Stripe webhook signatures |
| `SUPABASE_SERVICE_ROLE_KEY` | server | Full DB access for Functions (**secret**) |
| `RESEND_API_KEY` | server | Resend email API key |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM_NUMBER` | server | SMS |
| `SHOP_EMAIL` | server | From/notification address |
| `SITE_URL` | server | Absolute base URL for email links |
| `GOOGLE_REVIEW_URL` | server | Link used in the review-request SMS |

## Database setup

Run the migrations **in order** in the Supabase SQL editor:

1. `supabase/migrations/001_initial_schema.sql` — tables, RLS, views, seed
2. `supabase/migrations/002_improvements.sql` — double-booking guard,
   `shop_settings`, `review_sms_sent`, and the real barber roster

> Migration 002 **deletes and re-seeds the `barbers` table** with fixed UUIDs
> that match `src/data.js`. Those IDs are stored on `appointments.barber_id`,
> so if you change a barber ID in one place you must change it in both.

### Create the owner login

After running migrations, create an auth user in Supabase, then:

```sql
insert into user_profiles (id, role)
values ('<that-user-uuid>', 'owner');
```

Sign in at `/dashboard`.

## Stripe webhook

The deposit is confirmed server-side by `netlify/functions/stripe-webhook.js`.
Wire it up once after deploy:

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. Endpoint URL: `https://<your-domain>/api/stripe-webhook`
3. Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`

## Scheduled jobs

`send-review-request` runs `@hourly` (configured in `netlify.toml`). It texts a
Google-review link to customers ~2–4h after their appointment, once each
(tracked by `appointments.review_sms_sent`). Appointment times are shop-local
but compared against server UTC, so the window is intentionally wide.

## Routes

| Path | Page |
|---|---|
| `/` | Home (hero, services, team, gallery teaser, FAQ) |
| `/book` | 6-step booking wizard |
| `/manage?id=…` | Customer view of a single booking |
| `/gallery` | Photo gallery |
| `/privacy`, `/terms`, `/unsubscribe` | Legal / compliance |
| `/dashboard` | Owner command station (auth required) |
| `/barber` | Barber portal (auth required) |
| `*` | 404 |

## Known follow-ups

- **Responsive images:** photos use `loading="lazy"` + decode hints, but true
  `srcset` needs resized derivatives (add a `sharp` build step and source art).
- **Gallery** currently ships 5 photos — swap in the client's real shoot.
- **Error monitoring** (e.g. Sentry) is not wired up.
