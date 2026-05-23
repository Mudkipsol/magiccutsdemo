import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const EFFECTIVE_DATE = 'May 23, 2026'
const SHOP = 'Magic Cuts Salon'
const EMAIL = 'hello@magicutsalon.com'
const PHONE = '(614) 376-0074'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-onyx-950 px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="mb-10 flex items-center gap-2 text-sm text-bone/40 hover:text-bone">
          <ArrowLeft size={15} /> Back to site
        </Link>

        <h1 className="font-display text-4xl text-bone">Terms of Service</h1>
        <p className="mt-2 text-sm text-bone/40">Effective date: {EFFECTIVE_DATE}</p>

        <div className="prose prose-invert mt-10 space-y-8 text-bone/70 [&_h2]:font-display [&_h2]:text-xl [&_h2]:text-bone [&_h2]:mt-8 [&_a]:text-gold-300 [&_a:hover]:underline">

          <p>
            By using the {SHOP} website and booking system, you agree to these terms. Please read
            them carefully.
          </p>

          <h2>Appointments and Deposits</h2>
          <p>
            A non-refundable deposit of $11 is required to secure your appointment. This deposit
            is applied toward the cost of your service. The deposit secures your time slot and
            compensates the shop for time reserved if you do not appear.
          </p>
          <p>
            <strong className="text-bone">Cancellations:</strong> To cancel or reschedule,
            contact us at least 24 hours before your appointment by calling{' '}
            <a href="tel:+16143760074">{PHONE}</a> or emailing{' '}
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. Late cancellations and no-shows forfeit the
            deposit.
          </p>

          <h2>Service Pricing</h2>
          <p>
            Prices listed on the website are starting prices. Final pricing is confirmed in the
            chair and may vary based on hair length, density, and the detail required. Any price
            difference is communicated before service begins.
          </p>

          <h2>Payments</h2>
          <p>
            Online deposits are processed securely by Stripe, Inc. By providing payment
            information, you authorize the $11 charge. Remaining balances are due at the shop
            at the time of service. We accept cash and major credit cards.
          </p>

          <h2>Walk-Ins</h2>
          <p>
            Walk-in customers are welcome subject to barber availability. We cannot guarantee
            wait times for walk-in visits. Booking online guarantees your slot.
          </p>

          <h2>Children's Services</h2>
          <p>
            The First Chair service is designed for children 8 and under. A parent or guardian
            must be present during the service. We reserve the right to decline service if a
            child's safety or comfort cannot be ensured.
          </p>

          <h2>Conduct</h2>
          <p>
            {SHOP} reserves the right to refuse service to anyone who is disruptive, abusive, or
            whose behavior poses a risk to staff or other clients.
          </p>

          <h2>SMS and Marketing Communications</h2>
          <p>
            By providing your phone number, you consent to receive transactional SMS messages
            related to your booking. Marketing messages are sent only to subscribers who
            explicitly opted in. You may unsubscribe at any time via our{' '}
            <Link to="/unsubscribe" className="text-gold-300 hover:underline">unsubscribe page</Link>{' '}
            or by replying STOP.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            {SHOP} is not liable for any indirect, incidental, or consequential damages arising
            from use of our services or website. Our liability is limited to the amount paid for
            the specific service in question.
          </p>

          <h2>Governing Law</h2>
          <p>
            These terms are governed by the laws of the State of Ohio. Disputes shall be
            resolved in Franklin County, Ohio.
          </p>

          <h2>Changes to These Terms</h2>
          <p>
            We may update these terms periodically. Continued use of the site after changes
            constitutes acceptance of the updated terms.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms? Contact us at{' '}
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a> or call{' '}
            <a href="tel:+16143760074">{PHONE}</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
