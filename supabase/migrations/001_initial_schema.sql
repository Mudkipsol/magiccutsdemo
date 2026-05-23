-- Magic Cuts Salon — Supabase Schema
-- Run this in your Supabase SQL editor

-- ─── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── User profiles (ties auth.users to roles) ────────────────────────────────
CREATE TABLE user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('owner', 'barber')),
  barber_id   UUID,  -- populated for barbers; null for owner
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── Barbers ──────────────────────────────────────────────────────────────────
CREATE TABLE barbers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  title         TEXT DEFAULT 'Barber',
  photo_url     TEXT,
  bio           TEXT,
  specialties   TEXT[] DEFAULT '{}',
  is_active     BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ─── Appointments ─────────────────────────────────────────────────────────────
CREATE TABLE appointments (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id                 UUID REFERENCES barbers(id) ON DELETE SET NULL,
  service_name              TEXT NOT NULL,
  service_price             INT NOT NULL,  -- dollars (e.g. 35)
  customer_name             TEXT NOT NULL,
  customer_email            TEXT NOT NULL,
  customer_phone            TEXT NOT NULL,
  appointment_date          DATE NOT NULL,
  appointment_time          TIME NOT NULL,
  status                    TEXT NOT NULL DEFAULT 'confirmed'
                              CHECK (status IN ('pending','confirmed','completed','cancelled','no_show')),
  deposit_paid              BOOLEAN DEFAULT false,
  deposit_amount            INT DEFAULT 1100,  -- cents
  stripe_payment_intent_id  TEXT,
  notes                     TEXT,
  created_at                TIMESTAMPTZ DEFAULT now()
);

-- Index for fast barber+date lookups (availability checks)
CREATE INDEX idx_appts_barber_date ON appointments (barber_id, appointment_date);
CREATE INDEX idx_appts_date        ON appointments (appointment_date);

-- ─── Marketing contacts ───────────────────────────────────────────────────────
CREATE TABLE marketing_contacts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE,
  phone           TEXT,
  name            TEXT,
  opted_in_email  BOOLEAN DEFAULT false,
  opted_in_sms    BOOLEAN DEFAULT false,
  source          TEXT DEFAULT 'popup',
  tags            TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE appointments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers               ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_contacts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles         ENABLE ROW LEVEL SECURITY;

-- Helper: is the caller an owner?
CREATE OR REPLACE FUNCTION is_owner()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'owner'
  );
$$;

-- Helper: barber_id for current user
CREATE OR REPLACE FUNCTION my_barber_id()
RETURNS UUID LANGUAGE sql SECURITY DEFINER AS $$
  SELECT barber_id FROM user_profiles WHERE id = auth.uid() AND role = 'barber';
$$;

-- barbers: public read (for booking UI), owner can write
CREATE POLICY "barbers_select_all" ON barbers FOR SELECT USING (true);
CREATE POLICY "barbers_write_owner" ON barbers FOR ALL USING (is_owner());

-- appointments: anon can INSERT (booking), owner sees all, barbers see own (name+time only via view)
CREATE POLICY "appts_insert_anon"  ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "appts_select_owner" ON appointments FOR SELECT USING (is_owner());
CREATE POLICY "appts_update_owner" ON appointments FOR UPDATE USING (is_owner());

-- Barbers access appointments through a restricted view (see below)

-- marketing_contacts: anon can insert, owner can select
CREATE POLICY "contacts_insert_anon"  ON marketing_contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "contacts_select_owner" ON marketing_contacts FOR SELECT USING (is_owner());

-- user_profiles: users see their own; owner sees all
CREATE POLICY "profiles_own"  ON user_profiles FOR SELECT USING (id = auth.uid() OR is_owner());
CREATE POLICY "profiles_owner_write" ON user_profiles FOR ALL USING (is_owner());

-- ─── Barber appointment view (hides contact info) ─────────────────────────────
CREATE VIEW barber_appointments AS
  SELECT
    id,
    barber_id,
    service_name,
    customer_name,           -- barbers see the name
    appointment_date,
    appointment_time,
    status
    -- customer_email and customer_phone are intentionally excluded
  FROM appointments
  WHERE barber_id = my_barber_id()
    AND status IN ('pending', 'confirmed');

-- ─── Seed initial barbers (update names/photos after setup) ───────────────────
INSERT INTO barbers (name, title, specialties, display_order) VALUES
  ('[BARBER_1_NAME]', 'Master Barber',  ARRAY['Skin Fades','Beard Sculpt','Classic Cut'], 1),
  ('[BARBER_2_NAME]', 'Senior Barber',  ARRAY['Hot-Towel Shave','Scissor Cut','Beard Color'], 2),
  ('[BARBER_3_NAME]', 'Barber',         ARRAY['High Fades','Design Cuts','Kids Cuts'], 3);
