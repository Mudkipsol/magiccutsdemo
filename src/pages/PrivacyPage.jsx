import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const EFFECTIVE_DATE = 'May 23, 2026'
const SHOP = 'Magic Cuts Salon'
const EMAIL = 'hello@magicutsalon.com'
const PHONE = '(614) 376-0074'
const ADDRESS = '2779 Martin Rd, Dublin, OH 43017'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-onyx-950 px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="mb-10 flex items-center gap-2 text-sm text-bone/40 hover:text-bone">
          <ArrowLeft size={15} /> Back to site
        </Link>

        <h1 className="font-display text-4xl text-bone">Privacy Policy</h1>
        <p className="mt-2 text-sm text-bone/40">Effective date: {EFFECTIVE_DATE}</p>

        <div className="prose prose-invert mt-10 space-y-8 text-bone/70 [&_h2]:font-display [&_h2]:text-xl [&_h2]:text-bone [&_h2]:mt-8 [&_a]:text-gold-300 [&_a:hover]:underline">

          <p>
            {SHOP} ("we," "us," or "our") operates the website{' '}
            <a href="https://www.magicutsalon.com">magicutsalon.com</a> and provides
            appointment booking, payment processing, and marketing communications. This policy
            explains what data we collect, how we use it, and your rights.
          </p>

          <h2>Information We Collect</h2>
          <p>
            <strong className="text-bone">Booking information:</strong> When you book an
            appointment we collect your name, email address, phone number, selected service,
            and any optional notes you provide.
          </p>
          <p>
            <strong className="text-bone">Payment information:</strong> Deposits are processed
            by Stripe, Inc. We do not store your card number. Stripe's privacy policy governs
            payment data — see <a href="https://stripe.com/privacy">stripe.com/privacy</a>.
          </p>
          <p>
            <strong className="text-bone">Marketing opt-in:</strong> If you subscribe via our
            popup, we collect your email and/or phone number with your explicit consent.
          </p>
          <p>
            <strong className="text-bone">Usage data:</strong> We may collect standard web
            analytics (pages visited, browser type, referring site) to improve the site.
          </p>

          <h2>How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Send appointment confirmations and reminders</li>
            <li>Process your deposit via Stripe</li>
            <li>Send marketing emails and SMS messages — only if you opted in</li>
            <li>Request post-visit reviews (by SMS, approximately 2 hours after your appointment)</li>
            <li>Operate and improve the booking system</li>
          </ul>

          <h2>SMS Messaging</h2>
          <p>
            By providing your phone number during booking, you consent to receive transactional
            SMS messages related to your appointment (confirmation, reminder). Marketing SMS
            messages are sent only to contacts who explicitly opted in. Message and data rates
            may apply. You can opt out at any time by replying STOP or visiting our{' '}
            <Link to="/unsubscribe" className="text-gold-300 hover:underline">unsubscribe page</Link>.
          </p>

          <h2>Data Retention</h2>
          <p>
            Appointment records are retained for 3 years for business purposes. Marketing
            contacts are removed upon unsubscribe request. You may request deletion of your
            data at any time by emailing us.
          </p>

          <h2>Third-Party Services</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-bone">Stripe</strong> — payment processing</li>
            <li><strong className="text-bone">Twilio</strong> — SMS delivery</li>
            <li><strong className="text-bone">Resend</strong> — transactional and marketing email</li>
            <li><strong className="text-bone">Supabase</strong> — secure database hosting</li>
          </ul>
          <p>Each provider has its own privacy policy governing how they handle data.</p>

          <h2>Your Rights</h2>
          <p>
            You have the right to access, correct, or delete the personal information we hold
            about you. To exercise these rights, contact us at{' '}
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
          </p>

          <h2>Cookies</h2>
          <p>
            We use session storage to remember popup dismissal. We do not use tracking cookies
            or advertising pixels.
          </p>

          <h2>Children's Privacy</h2>
          <p>
            Our site is not directed at children under 13. We do not knowingly collect personal
            information from children under 13.
          </p>

          <h2>Contact</h2>
          <p>
            Questions? Reach us at:
            <br />{SHOP}
            <br />{ADDRESS}
            <br /><a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            <br /><a href={`tel:+16143760074`}>{PHONE}</a>
          </p>
        </div>
      </div>
    </div>
  )
}
