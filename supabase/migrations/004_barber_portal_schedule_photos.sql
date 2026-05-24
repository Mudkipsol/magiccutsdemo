-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 004 — Barber portal, per-barber schedules, photo uploads
--
-- Fixes the broken barber portal (barbers previously got zero rows because no
-- RLS policy granted them appointment access), enforces contact-info privacy at
-- the database layer via a view, lets each barber set their own weekly hours,
-- and adds a Storage bucket for barber headshots.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Per-barber weekly schedule ───────────────────────────────────────────────
-- JSONB array, Monday-first (matches shop_settings.hours). NULL = fall back to
-- shop-wide hours. Shape:
--   [{"day":"Monday","working":true,"open":"10:00","close":"19:00"}, ... 7 rows]
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS schedule JSONB;

-- A barber may update their OWN profile row (their hours, bio, etc.).
-- Owners keep full write access through the existing barbers_write_owner policy.
DROP POLICY IF EXISTS "barbers_update_own" ON barbers;
CREATE POLICY "barbers_update_own" ON barbers
  FOR UPDATE
  USING (id = my_barber_id())
  WITH CHECK (id = my_barber_id());

-- ─── Barber appointment access (privacy-enforced) ─────────────────────────────
-- Barbers read appointments ONLY through this view, which omits customer_email
-- and customer_phone. security_invoker = false (the default) means the view runs
-- with its owner's rights and bypasses the appointments table RLS, while the
-- my_barber_id() filter scopes every row to the calling barber. Customers and
-- anon get my_barber_id() = NULL, so they see nothing here.
DROP VIEW IF EXISTS barber_appointments;
CREATE VIEW barber_appointments
  WITH (security_invoker = false) AS
  SELECT
    id,
    barber_id,
    service_name,
    customer_name,          -- name is shown; email + phone are intentionally omitted
    appointment_date,
    appointment_time,
    status
  FROM appointments
  WHERE barber_id = my_barber_id()
    AND status IN ('pending', 'confirmed');

GRANT SELECT ON barber_appointments TO authenticated;

-- ─── Storage bucket for barber headshots ──────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('barber-photos', 'barber-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view the photos (they appear on the public site).
DROP POLICY IF EXISTS "barber_photos_public_read" ON storage.objects;
CREATE POLICY "barber_photos_public_read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'barber-photos');

-- Only the owner can upload / replace / delete headshots.
DROP POLICY IF EXISTS "barber_photos_owner_write" ON storage.objects;
CREATE POLICY "barber_photos_owner_write" ON storage.objects
  FOR ALL
  USING (bucket_id = 'barber-photos' AND is_owner())
  WITH CHECK (bucket_id = 'barber-photos' AND is_owner());
