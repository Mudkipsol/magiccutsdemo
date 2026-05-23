import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async (req, context) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const { amount = 1100, metadata = {} } = await req.json()

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    metadata,
    automatic_payment_methods: { enabled: true },
  })

  return Response.json({ clientSecret: paymentIntent.client_secret })
}

export const config = { path: '/api/create-payment-intent' }
