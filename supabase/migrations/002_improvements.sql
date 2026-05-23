-- Magic Cuts — Migration 002
-- Prevents double-booking race conditions and adds editable shop settings

-- ─── Prevent double-booking ───────────────────────────────────────────────────
-- A barber can only have one active appointment per (date, time) slot.
-- Cancelled and no-show appointments free the slot.
CREATE UNIQUE INDEX IF NOT EXISTS idx_appts_slot_unique
  ON appointments (barber_id, appointment_date, appointment_time)
  WHERE status NOT IN ('cancelled', 'no_show');

-- ─── Shop settings (editable from dashboard) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS shop_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_read_all"    ON shop_settings FOR SELECT USING (true);
CREATE POLICY "settings_write_owner" ON shop_settings FOR ALL USING (is_owner());

-- Seed default hours (24-hour format for easy comparison)
INSERT INTO shop_settings (key, value) VALUES
  ('hours', '[
    {"day":"Monday",    "open":"10:00","close":"19:00"},
    {"day":"Tuesday",   "open":"10:00","close":"19:00"},
    {"day":"Wednesday", "open":"10:00","close":"19:00"},
    {"day":"Thursday",  "open":"10:00","close":"19:00"},
    {"day":"Friday",    "open":"10:00","close":"20:00"},
    {"day":"Saturday",  "open":"09:00","close":"20:00"},
    {"day":"Sunday",    "open":"Closed","close":""}
  ]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Seed default services
INSERT INTO shop_settings (key, value) VALUES
  ('services', '[
    {"id":"signature","name":"The Signature Cut","price":35,"duration":"45 min","blurb":"Precision scissor and clipper work, hot-towel finish, style that holds all week.","tag":"Most booked"},
    {"id":"fade","name":"Skin Fade","price":40,"duration":"50 min","blurb":"Bald-to-blend done by eye, not by guard alone. Clean lines, sharp edge-up."},
    {"id":"cut-beard","name":"Cut & Beard","price":50,"duration":"60 min","blurb":"The full reset. Haircut and beard shaped so the whole thing reads together.","tag":"Best value"},
    {"id":"shave","name":"Hot-Towel Shave","price":40,"duration":"40 min","blurb":"Straight-razor, the old way. Steamed towels, warm lather, a cooling finish."},
    {"id":"beard","name":"Beard Sculpt","price":25,"duration":"30 min","blurb":"Trim, shape and define. We build the line to your jaw."},
    {"id":"kids","name":"First Chair (8 & under)","price":25,"duration":"30 min","blurb":"Patient hands for the little ones. We make first cuts easy ones."},
    {"id":"color","name":"Color & Gray Blend","price":45,"duration":"45 min","blurb":"Custom-mixed shades and natural gray blending that looks like you, sharper."},
    {"id":"style","name":"Wash & Style","price":20,"duration":"20 min","blurb":"A proper wash, blow-out and finish for an event, shoot, or Friday that matters."}
  ]'::jsonb)
ON CONFLICT (key) DO NOTHING;
