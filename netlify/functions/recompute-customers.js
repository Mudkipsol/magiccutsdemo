// Nightly cron: recompute RFM metrics, cadence, lifecycle status, and
// predicted next visit for every customer. Also backfills any appointments
// whose customer_id is not yet linked.
import { admin } from './_lib/admin.js'

const LIFECYCLE = {
  new: (visits, daysSince) => visits <= 1 && daysSince <= 90,
  active: (visits, daysSince, cadence) => visits > 1 && daysSince <= cadence * 1.5,
  lapsing: (visits, daysSince, cadence) => visits > 1 && daysSince > cadence * 1.5 && daysSince <= cadence * 2.5,
  lapsed: (visits, daysSince, cadence) => visits > 1 && daysSince > cadence * 2.5,
  winback: () => false, // set manually or after re-engagement attempt
}

function classifyLifecycle(visitCount, daysSinceLastVisit, avgCadence) {
  const c = avgCadence || 28
  if (LIFECYCLE.new(visitCount, daysSinceLastVisit)) return 'new'
  if (LIFECYCLE.active(visitCount, daysSinceLastVisit, c)) return 'active'
  if (LIFECYCLE.lapsing(visitCount, daysSinceLastVisit, c)) return 'lapsing'
  if (LIFECYCLE.lapsed(visitCount, daysSinceLastVisit, c)) return 'lapsed'
  return 'active'
}

export default async () => {
  const started = Date.now()
  let linked = 0
  let updated = 0

  // ── 1. Backfill: link appointments that have no customer_id ──────────────────
  const { data: unlinked } = await admin
    .from('appointments')
    .select('id, customer_phone, customer_email, customer_name')
    .is('customer_id', null)
    .limit(200)

  for (const appt of unlinked || []) {
    let customer = null

    if (appt.customer_phone) {
      const normalized = appt.customer_phone.replace(/\D/g, '').replace(/^(\d{10})$/, '+1$1').replace(/^1(\d{10})$/, '+1$1')
      const { data } = await admin.from('customers').select('id').eq('phone', normalized).maybeSingle()
      customer = data
    }
    if (!customer && appt.customer_email) {
      const { data } = await admin.from('customers').select('id').ilike('email', appt.customer_email).maybeSingle()
      customer = data
    }

    if (customer) {
      await admin.from('appointments').update({ customer_id: customer.id }).eq('id', appt.id)
      linked++
    }
  }

  // ── 2. Recompute RFM + lifecycle for all customers ───────────────────────────
  const { data: customers } = await admin.from('customers').select('id, phone, email, visit_count, last_visit, avg_cadence_days, lifecycle_status')
  const now = Date.now()

  const BATCH = 50
  for (let i = 0; i < (customers || []).length; i += BATCH) {
    const batch = customers.slice(i, i + BATCH)
    await Promise.all(batch.map(async (c) => {
      // Pull their appointment history
      const { data: appts } = await admin
        .from('appointments')
        .select('appointment_date, deposit_paid, deposit_amount')
        .eq('customer_id', c.id)
        .in('status', ['confirmed', 'completed'])
        .order('appointment_date', { ascending: false })

      if (!appts?.length) return

      const visitCount = appts.length
      const lastVisitStr = appts[0].appointment_date
      const firstVisitStr = appts[appts.length - 1].appointment_date
      const ltv = appts.reduce((s, a) => s + (a.deposit_paid ? (a.deposit_amount || 0) / 100 : 0), 0)

      // Average cadence: spread total days across intervals
      let avgCadence = null
      if (visitCount >= 2) {
        const first = new Date(firstVisitStr).getTime()
        const last = new Date(lastVisitStr).getTime()
        avgCadence = Math.round((last - first) / ((visitCount - 1) * 86_400_000))
      }

      const daysSince = Math.round((now - new Date(lastVisitStr).getTime()) / 86_400_000)
      const lifecycleStatus = classifyLifecycle(visitCount, daysSince, avgCadence)
      const predictedNextVisit = avgCadence
        ? new Date(new Date(lastVisitStr).getTime() + avgCadence * 86_400_000).toISOString().slice(0, 10)
        : null

      await admin.from('customers').update({
        visit_count: visitCount,
        first_visit: firstVisitStr,
        last_visit: lastVisitStr,
        lifetime_value: ltv,
        avg_cadence_days: avgCadence,
        predicted_next_visit: predictedNextVisit,
        lifecycle_status: lifecycleStatus,
      }).eq('id', c.id)
      updated++
    }))
  }

  const elapsed = Date.now() - started
  console.log(`recompute-customers: linked=${linked} updated=${updated} in ${elapsed}ms`)
  return Response.json({ linked, updated, elapsed })
}

// Runs nightly at 2 AM ET
export const config = { schedule: '0 7 * * *' }
