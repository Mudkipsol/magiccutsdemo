import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { motion, AnimatePresence, useScroll, MotionConfig } from 'framer-motion'
import { useAuthStore } from './store/authStore'
import ErrorBoundary from './components/ErrorBoundary'
import HomePage from './pages/HomePage'
import EmailSmsPopup from './components/EmailSmsPopup'

// Homepage loads eagerly (the primary entry). Everything else is split out so a
// visitor browsing the marketing site never downloads the dashboard, Stripe, or
// Recharts bundles until they actually navigate there.
const BookingPage = lazy(() => import('./pages/BookingPage'))
const BarberPortalPage = lazy(() => import('./pages/BarberPortalPage'))
const OwnerDashboardPage = lazy(() => import('./pages/OwnerDashboardPage'))
const GalleryPage = lazy(() => import('./pages/GalleryPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const UnsubscribePage = lazy(() => import('./pages/UnsubscribePage'))
const ManageBookingPage = lazy(() => import('./pages/ManageBookingPage'))
const AccountPage = lazy(() => import('./pages/AccountPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

// Per-route document titles — SPA has no SSR, so set them client-side for SEO/UX.
const TITLES = {
  '/': "Magic Cuts Salon — Premium Men's Grooming · Dublin, OH",
  '/book': 'Book a Chair — Magic Cuts Salon',
  '/account': 'My Account — Magic Cuts Salon',
  '/login': 'Sign In — Magic Cuts Salon',
  '/register': 'Create an Account — Magic Cuts Salon',
  '/manage': 'Manage Your Booking — Magic Cuts Salon',
  '/gallery': 'Gallery — Magic Cuts Salon',
  '/privacy': 'Privacy Policy — Magic Cuts Salon',
  '/terms': 'Terms of Service — Magic Cuts Salon',
  '/unsubscribe': 'Unsubscribe — Magic Cuts Salon',
  '/barber': 'Barber Portal — Magic Cuts Salon',
  '/dashboard': 'Owner Dashboard — Magic Cuts Salon',
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[100] h-[2px] origin-left"
      style={{
        scaleX: scrollYProgress,
        background: 'linear-gradient(90deg, #d8b25a, #c79a3a 60%, #9c6f20)',
      }}
    />
  )
}

function PageFallback() {
  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-onyx-950">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold-300/30 border-t-gold-300" />
    </div>
  )
}

function AppInner() {
  const location = useLocation()

  useEffect(() => {
    document.title = TITLES[location.pathname] || 'Magic Cuts Salon — Dublin, OH'
  }, [location.pathname])

  return (
    <div className="grain relative">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <ScrollProgress />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1c1c21',
            color: '#f4efe6',
            border: '1px solid rgba(199,154,58,0.2)',
          },
        }}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          id="main-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <Suspense fallback={<PageFallback />}>
            <Routes location={location}>
              <Route path="/" element={<><HomePage /><EmailSmsPopup /></>} />
              <Route path="/book" element={<BookingPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/unsubscribe" element={<UnsubscribePage />} />
              <Route path="/manage" element={<ManageBookingPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/login" element={<AccountPage />} />
              <Route path="/register" element={<AccountPage />} />
              <Route path="/barber" element={<BarberPortalPage />} />
              <Route path="/dashboard" element={<OwnerDashboardPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  const init = useAuthStore((s) => s.init)
  useEffect(() => { init() }, [init])
  return (
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <ErrorBoundary>
          <AppInner />
        </ErrorBoundary>
      </MotionConfig>
    </BrowserRouter>
  )
}
