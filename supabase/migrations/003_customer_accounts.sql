-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 003 — Customer accounts
--
-- Customers self-register through Supabase Auth (no user_profiles row — that
-- table is staff-only: owner + barber). A customer is simply an authenticated
-- user with no profile. They can read their OWN appointments, matched by the
-- email on their auth account. Staff logins are still created by the owner.
-- ─────────────────────────────────────────────────────────────────────────────

-- Customers can read appointments booked under their email address.
-- auth.email() returns the email claim of the calling user's JWT.
DROP POLICY IF EXISTS "appts_select_own_email" ON appointments;
CREATE POLICY "appts_select_own_email" ON appointments
  FOR SELECT
  USING (
    auth.email() IS NOT NULL
    AND lower(customer_email) = lower(auth.email())
  );

-- Speeds up the customer "my bookings" lookup.
CREATE INDEX IF NOT EXISTS appointments_customer_email_idx
  ON appointments (lower(customer_email));
