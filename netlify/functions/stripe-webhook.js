import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const sig = req.headers.get('stripe-signature')
  const body = await req.text()

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object
    const { error } = await supabase
      .from('appointments')
      .update({ deposit_paid: true, status: 'confirmed' })
      .eq('stripe_payment_intent_id', pi.id)
    if (error) console.error('Supabase update failed:', error.message)
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object
    await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('stripe_payment_intent_id', pi.id)
  }

  return Response.json({ received: true })
}

export const config = { path: '/api/stripe-webhook' }
