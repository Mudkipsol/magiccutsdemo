// ─────────────────────────────────────────────────────────────────────────────
// SHOP INFO — verified from magicutsalon.com / Yelp / Fresha
// ─────────────────────────────────────────────────────────────────────────────
export const shop = {
  name: 'Magic Cuts',
  full: 'Magic Cuts Salon',
  tagline: "Premium Men's Grooming",
  established: '2023',
  city: 'Dublin, Ohio',
  phone: '(614) 376-0074',
  phoneHref: 'tel:+16143760074',
  email: 'hello@magicutsalon.com',
  address: '2779 Martin Rd',
  addressLine2: 'Dublin, OH 43017',
  mapHref: 'https://maps.google.com/?q=2779+Martin+Rd+Dublin+OH+43017',
  instagram: 'https://www.instagram.com/themagic.cuts/',
  instagramHandle: '@themagic.cuts',
}

// ─────────────────────────────────────────────────────────────────────────────
// BARBERS — replace [BARBER_X_NAME] with the real names from your photo files
// Place photos at: public/barbers/barber1.jpg, barber2.jpg, barber3.jpg
// ─────────────────────────────────────────────────────────────────────────────
export const barbers = [
  {
    id: 'b1',
    name: 'Bashaar',
    title: 'Lead Barber',
    bio: 'Precision fades, clean lines, and a straight-razor finish that holds all week. Bashaar sets the standard in the shop.',
    specialties: ['Skin Fades', 'Straight-Razor', 'Classic Cut'],
    photo: '/barbers/barber1.jpg',
  },
  {
    id: 'b2',
    name: 'Alejandro',
    title: 'Senior Barber',
    bio: 'Detail work that goes beyond the cut — beard shaping, edge-ups, and fades built to your face.',
    specialties: ['Beard Sculpt', 'Edge-Up', 'Skin Fades'],
    photo: '/barbers/barber2.jpg',
  },
  {
    id: 'b3',
    name: 'Bebo',
    title: 'Barber',
    bio: 'High fades, bold designs, and the kind of energy that makes the chair feel like yours.',
    specialties: ['High Fades', 'Design Cuts', 'Kids Cuts'],
    photo: '/barbers/barber3.jpg',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// HOURS
// ─────────────────────────────────────────────────────────────────────────────
export const hours = [
  { day: 'Monday',    open: '10:00', close: '7:00' },
  { day: 'Tuesday',   open: '10:00', close: '7:00' },
  { day: 'Wednesday', open: '10:00', close: '7:00' },
  { day: 'Thursday',  open: '10:00', close: '7:00' },
  { day: 'Friday',    open: '10:00', close: '8:00' },
  { day: 'Saturday',  open: '9:00',  close: '8:00' },
  { day: 'Sunday',    open: 'Closed', close: '' },
]

// ─────────────────────────────────────────────────────────────────────────────
// SERVICES — prices in USD. Deposit is $11 collected upfront via Stripe.
// ─────────────────────────────────────────────────────────────────────────────
export const services = [
  {
    id: 'signature',
    name: 'The Signature Cut',
    price: 35,
    duration: '45 min',
    blurb: 'Precision scissor and clipper work, hot-towel finish, style that holds all week.',
    tag: 'Most booked',
  },
  {
    id: 'fade',
    name: 'Skin Fade',
    price: 40,
    duration: '50 min',
    blurb: 'Bald-to-blend done by eye, not by guard alone. Clean lines, sharp edge-up.',
  },
  {
    id: 'cut-beard',
    name: 'Cut & Beard',
    price: 50,
    duration: '60 min',
    blurb: 'The full reset. Haircut and beard shaped so the whole thing reads together.',
    tag: 'Best value',
  },
  {
    id: 'shave',
    name: 'Hot-Towel Shave',
    price: 40,
    duration: '40 min',
    blurb: 'Straight-razor, the old way. Steamed towels, warm lather, a cooling finish.',
  },
  {
    id: 'beard',
    name: 'Beard Sculpt',
    price: 25,
    duration: '30 min',
    blurb: 'Trim, shape and define. We build the line to your jaw.',
  },
  {
    id: 'kids',
    name: 'First Chair (8 & under)',
    price: 25,
    duration: '30 min',
    blurb: 'Patient hands for the little ones. We make first cuts easy ones.',
  },
  {
    id: 'color',
    name: 'Color & Gray Blend',
    price: 45,
    duration: '45 min',
    blurb: 'Custom-mixed shades and natural gray blending that looks like you, sharper.',
  },
  {
    id: 'style',
    name: 'Wash & Style',
    price: 20,
    duration: '20 min',
    blurb: 'A proper wash, blow-out and finish for an event, shoot, or Friday that matters.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// STATS, PROCESS, TESTIMONIALS
// ─────────────────────────────────────────────────────────────────────────────
export const stats = [
  { value: 'Est. 2023', label: 'Dublin original' },
  { value: '8',         label: 'Services on the menu' },
  { value: '6 days',    label: 'Open every week' },
  { value: 'Walk-ins',  label: 'Always welcome' },
]

export const process = [
  {
    step: '01',
    title: 'Sit & talk',
    text: 'Every chair starts with a real consultation — your hair, your routine, what actually works.',
  },
  {
    step: '02',
    title: 'The work',
    text: 'Scissor-over-comb, clipper craft and straight-razor detail. Traditional technique, modern finish.',
  },
  {
    step: '03',
    title: 'The finish',
    text: 'Hot towel, style, and product matched to your hair so you can do it again at home.',
  },
  {
    step: '04',
    title: 'Walk out sharp',
    text: 'You leave looking like the best version of the photo in your head.',
  },
]

export const testimonials = [
  {
    quote: "Best fade I've had in Dublin, full stop. They actually listen to what you want instead of guessing.",
    name: 'Marcus T.',
    detail: 'Skin Fade',
    stars: 5,
  },
  {
    quote: "Took my 6-year-old for his first real cut. They were patient, quick, and he sat still the whole time.",
    name: 'Priya R.',
    detail: 'First Chair',
    stars: 5,
  },
  {
    quote: "Hot-towel shave on a Friday afternoon. Came in wound up, left like a different person. Genuinely great.",
    name: 'Devin K.',
    detail: 'Hot-Towel Shave',
    stars: 4,
  },
  {
    quote: "Sharp cuts, fair price, nobody trying to upsell you on product. I drive past three other barbers to get here.",
    name: 'Andre W.',
    detail: 'Cut & Beard',
    stars: 5,
  },
]

export const faqs = [
  {
    q: 'Do you take walk-ins?',
    a: "Always. Walk-ins are welcome any day we're open — though booking guarantees your time and barber.",
  },
  {
    q: 'Why is there an $11 deposit?',
    a: 'It secures your chair and goes toward the cost of your service. No-shows cost us real time — this keeps the schedule honest for everyone.',
  },
  {
    q: "Do you cut kids' hair?",
    a: 'Yes — our First Chair service is built for ages 8 and under, with the patience that takes.',
  },
  {
    q: 'Where are you located?',
    a: "We're at 2779 Martin Rd in Dublin, Ohio, with parking right out front.",
  },
  {
    q: 'Can I pick my barber?',
    a: 'Absolutely. When you book online you choose your barber and see their real-time availability.',
  },
]
