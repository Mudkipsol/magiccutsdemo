-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 005 — AI Growth Engine foundations
--
-- Adds the data model the agent layer runs on: a real customer identity with
-- RFM/cadence/lifecycle, two-way conversation threads, an action audit log,
-- marketing campaigns, a cancellation waitlist, and agent settings. Backfills
-- customers from existing appointments and links them.
--
-- All new tables are owner-only via RLS (is_owner() from migration 001).
-- Service-role functions bypass RLS. Barbers/customers/anon get no access,
-- consistent with the privacy model established in migration 004.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Helper: normalize a phone to +1XXXXXXXXXX (best-effort) ──────────────────
CREATE OR REPLACE FUNCTION normalize_phone(raw TEXT)
RETURNS TEXT LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN raw IS NULL THEN NULL
    WHEN length(regexp_replace(raw, '\D', '', 'g')) = 10
      THEN '+1' || regexp_replace(raw, '\D', '', 'g')
    WHEN length(regexp_replace(raw, '\D', '', 'g')) = 11
         AND left(regexp_replace(raw, '\D', '', 'g'), 1) = '1'
      THEN '+' || regexp_replace(raw, '\D', '', 'g')
    ELSE nullif(regexp_replace(raw, '\D', '', 'g'), '')
  END
$$;

-- ─── Customers (identity + lifecycle) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone                TEXT UNIQUE,
  email                TEXT,
  name                 TEXT,
  first_visit          DATE,
  last_visit           DATE,
  visit_count          INT DEFAULT 0,
  lifetime_value       INT DEFAULT 0,            -- dollars
  avg_cadence_days     INT,                      -- null until 2+ visits
  predicted_next_visit DATE,
  lifecycle_status     TEXT DEFAULT 'new'
                         CHECK (lifecycle_status IN ('new','active','lapsing','lapsed','winback')),
  preferred_barber_id  UUID REFERENCES barbers(id) ON DELETE SET NULL,
  consent_sms          BOOLEAN DEFAULT false,
  consent_email        BOOLEAN DEFAULT false,
  do_not_contact       BOOLEAN DEFAULT false,
  last_contacted_at    TIMESTAMPTZ,
  tags                 TEXT[] DEFAULT '{}',
  created_at           TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_customers_lifecycle ON customers (lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_customers_next_visit ON customers (predicted_next_visit);

-- Link appointments to a customer (nullable; legacy rows backfilled below)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_appts_customer ON appointments (customer_id);

-- ─── Conversations + messages (two-way threads) ───────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  channel     TEXT NOT NULL DEFAULT 'sms' CHECK (channel IN ('sms','web')),
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','needs_human','closed')),
  assignee    TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  direction       TEXT NOT NULL CHECK (direction IN ('in','out')),
  sender          TEXT NOT NULL CHECK (sender IN ('customer','agent','human')),
  body            TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages (conversation_id, created_at);

-- ─── Agent action audit log ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_actions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent       TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  payload     JSONB DEFAULT '{}',
  status      TEXT NOT NULL DEFAULT 'queued'
                CHECK (status IN ('auto_sent','queued','approved','sent','skipped','failed')),
  reason      TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_agent_actions_status ON agent_actions (status, created_at);

-- ─── Marketing campaigns (draft → approve → send) ─────────────────────────────
CREATE TABLE IF NOT EXISTS campaigns (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type       TEXT NOT NULL,
  segment    JSONB DEFAULT '{}',
  channel    TEXT NOT NULL CHECK (channel IN ('sms','email')),
  subject    TEXT,
  body       TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','sending','sent')),
  metrics    JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Cancellation waitlist (gap-fill) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS waitlist (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id    UUID REFERENCES customers(id) ON DELETE SET NULL,
  contact_name   TEXT,
  contact_phone  TEXT,
  barber_id      UUID REFERENCES barbers(id) ON DELETE SET NULL,
  desired_date   DATE,
  desired_window TEXT,
  status         TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','offered','booked','expired')),
  created_at     TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_waitlist_open ON waitlist (status, desired_date);

-- ─── Row Level Security: owner-only for all new tables ────────────────────────
ALTER TABLE customers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns     ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist      ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['customers','conversations','messages','agent_actions','campaigns','waitlist']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_owner_all', t);
    EXECUTE format('CREATE POLICY %I ON %I FOR ALL USING (is_owner()) WITH CHECK (is_owner())', t || '_owner_all', t);
  END LOOP;
END $$;

-- Waitlist needs anonymous INSERT so customers can join from the booking flow.
DROP POLICY IF EXISTS "waitlist_insert_anon" ON waitlist;
CREATE POLICY "waitlist_insert_anon" ON waitlist FOR INSERT WITH CHECK (true);

-- ─── Agent settings (reuses shop_settings JSONB pattern) ──────────────────────
INSERT INTO shop_settings (key, value) VALUES
  ('ai_autonomy',       '{"transactional":"auto","marketing":"approval"}'::jsonb),
  ('ai_quiet_hours',    '{"start":"09:00","end":"20:00","tz":"America/New_York"}'::jsonb),
  ('ai_frequency_caps', '{"per_customer_per_week":2,"global_per_day":200}'::jsonb),
  ('ai_brand_voice',    '"Confident, warm, concise. Premium barbershop — never salesy or spammy."'::jsonb),
  ('ai_provider_model', '{"provider":"groq","fast":"qwen/qwen3-32b","smart":"qwen/qwen3-32b"}'::jsonb),
  ('ai_kill_switch',    'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ─── Backfill customers from existing appointments ────────────────────────────
WITH grouped AS (
  SELECT
    normalize_phone(customer_phone)                       AS phone,
    max(customer_email)                                   AS email,
    max(customer_name)                                    AS name,
    min(appointment_date)                                 AS first_visit,
    max(appointment_date)                                 AS last_visit,
    count(*)                                              AS visit_count,
    coalesce(sum(service_price), 0)::int                  AS lifetime_value,
    CASE WHEN count(*) > 1
      THEN (max(appointment_date) - min(appointment_date)) / nullif(count(*) - 1, 0)
      ELSE NULL END                                       AS avg_cadence_days
  FROM appointments
  WHERE status IN ('confirmed','completed')
    AND normalize_phone(customer_phone) IS NOT NULL
  GROUP BY normalize_phone(customer_phone)
)
INSERT INTO customers (phone, email, name, first_visit, last_visit, visit_count,
                       lifetime_value, avg_cadence_days, predicted_next_visit, lifecycle_status)
SELECT
  phone, email, name, first_visit, last_visit, visit_count, lifetime_value, avg_cadence_days,
  CASE WHEN avg_cadence_days IS NOT NULL THEN last_visit + avg_cadence_days::int ELSE NULL END,
  CASE
    WHEN visit_count <= 1 THEN 'new'
    WHEN last_visit >= current_date - GREATEST(coalesce(avg_cadence_days,30) * 1.5, 35) THEN 'active'
    WHEN last_visit >= current_date - 90 THEN 'lapsing'
    ELSE 'lapsed'
  END
FROM grouped
ON CONFLICT (phone) DO NOTHING;

-- Link appointments to their customer by normalized phone.
UPDATE appointments a
SET customer_id = c.id
FROM customers c
WHERE c.phone = normalize_phone(a.customer_phone)
  AND a.customer_id IS NULL;

-- ─── Reminder tracking columns on appointments (Phase 1 cron agents) ──────────
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_48h_sent BOOLEAN DEFAULT false;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_2h_sent  BOOLEAN DEFAULT false;
