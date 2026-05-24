-- Migration 006 — Fix barber names and add Luis
-- Bashar was misspelled as Bashaar; barber3 was mislabeled as Bebo (it's Luis).
-- Bebo's photo (barber3.jpg) is now correctly assigned. Luis is added as barber4.

UPDATE barbers SET
  name = 'Bashar',
  bio  = 'Precision fades, clean lines, and a straight-razor finish that holds all week. Bashar sets the standard in the shop.'
WHERE id = '11111111-1111-4111-8111-111111111111';

UPDATE barbers SET
  name  = 'Bebo',
  title = 'Master Barber',
  bio   = 'Sharp fades, clean lines, and the kind of precision that keeps clients coming back every time.',
  specialties = ARRAY['Skin Fades','Beard Sculpt','Classic Cut']
WHERE id = '33333333-3333-4333-8333-333333333333';

INSERT INTO barbers (id, name, title, photo_url, bio, specialties, display_order)
VALUES (
  '44444444-4444-4444-8444-444444444444',
  'Luis',
  'Barber',
  '/barbers/barber4.jpg',
  'High fades, bold designs, and the kind of energy that makes the chair feel like yours.',
  ARRAY['High Fades','Design Cuts','Kids Cuts'],
  4
)
ON CONFLICT (id) DO NOTHING;
