// Single source of truth for site content.
// Real shop facts (address, phone, socials) are accurate to Magic Cuts Salon, Dublin OH.
// Service prices are sensible defaults — edit to match your current menu.

export const shop = {
  name: 'Magic Cuts',
  full: 'Magic Cuts Salon',
  tagline: 'Premium Men’s Grooming',
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

export const hours = [
  { day: 'Monday', open: '10:00', close: '7:00' },
  { day: 'Tuesday', open: '10:00', close: '7:00' },
  { day: 'Wednesday', open: '10:00', close: '7:00' },
  { day: 'Thursday', open: '10:00', close: '7:00' },
  { day: 'Friday', open: '10:00', close: '8:00' },
  { day: 'Saturday', open: '9:00', close: '8:00' },
  { day: 'Sunday', open: 'Closed', close: '' },
]

export const services = [
  {
    id: 'signature',
    name: 'The Signature Cut',
    price: 35,
    duration: '45 min',
    blurb:
      'A full consultation, precision scissor and clipper work, hot-towel finish and a style that holds all week.',
    tag: 'Most booked',
  },
  {
    id: 'fade',
    name: 'Skin Fade',
    price: 40,
    duration: '50 min',
    blurb:
      'Bald-to-blend gradients done by eye, not by guard alone. Clean lines, sharp edge-up, no shortcuts.',
  },
  {
    id: 'cut-beard',
    name: 'Cut & Beard',
    price: 50,
    duration: '60 min',
    blurb:
      'The full reset. Haircut paired with a shaped, lined and conditioned beard so the whole thing reads together.',
    tag: 'Best value',
  },
  {
    id: 'shave',
    name: 'Hot-Towel Shave',
    price: 40,
    duration: '40 min',
    blurb:
      'Straight-razor, the old way. Steamed towels, warm lather, a close shave and a cooling finish.',
  },
  {
    id: 'beard',
    name: 'Beard Sculpt',
    price: 25,
    duration: '30 min',
    blurb:
      'Trim, shape and define. We build the line to your jaw and leave you with the products to keep it.',
  },
  {
    id: 'kids',
    name: 'First Chair (8 & under)',
    price: 25,
    duration: '30 min',
    blurb:
      'Patient hands and a steady chair for the little ones. We make the first cuts the easy ones.',
  },
  {
    id: 'color',
    name: 'Color & Gray Blend',
    price: 45,
    duration: '45 min',
    blurb:
      'Custom-mixed shades and natural gray blending that looks like you, only sharper.',
  },
  {
    id: 'style',
    name: 'Wash & Style',
    price: 20,
    duration: '20 min',
    blurb:
      'A proper wash, blow-out and finish for an event, a shoot, or a Friday that matters.',
  },
]

export const stats = [
  { value: 'Est. 2023', label: 'Dublin original' },
  { value: '8', label: 'Services on the menu' },
  { value: '6 days', label: 'Open every week' },
  { value: 'Walk-ins', label: 'Always welcome' },
]

export const process = [
  {
    step: '01',
    title: 'Sit & talk',
    text: 'Every chair starts with a real consultation — your hair, your routine, what actually works for you.',
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
    text: 'You leave looking like the best version of the photo in your head — and we keep your chair open.',
  },
]

// Short, human testimonials. Replace with verbatim Google/Yelp reviews when you have them.
export const testimonials = [
  {
    quote:
      'Best fade I’ve had in Dublin, full stop. They actually listen instead of rushing you through.',
    name: 'Marcus T.',
    detail: 'Skin Fade',
  },
  {
    quote:
      'Took my 6-year-old for his first real haircut. They were patient, quick, and he loved it.',
    name: 'Priya R.',
    detail: 'First Chair',
  },
  {
    quote:
      'The hot-towel shave is the most relaxed I’ve been all month. Walked out feeling brand new.',
    name: 'Devin K.',
    detail: 'Hot-Towel Shave',
  },
  {
    quote:
      'Clean shop, no attitude, sharp work every time. This is my spot now.',
    name: 'Andre W.',
    detail: 'Cut & Beard',
  },
]

export const faqs = [
  {
    q: 'Do you take walk-ins?',
    a: 'Always. Walk-ins are welcome any day we’re open — though booking a chair guarantees your time and barber.',
  },
  {
    q: 'How do I book?',
    a: 'Use the form on this page to request a chair. We confirm by text or call, usually within the hour during shop hours.',
  },
  {
    q: 'Do you cut kids’ hair?',
    a: 'Yes — our First Chair service is built for ages 8 and under, with the patience that takes.',
  },
  {
    q: 'Where are you located?',
    a: 'We’re at 2779 Martin Rd in Dublin, Ohio, with parking right out front.',
  },
]
