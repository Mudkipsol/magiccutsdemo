import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { motion, useScroll } from 'framer-motion'
import { useAuthStore } from './store/authStore'
import ErrorBoundary from './components/ErrorBoundary'
import HomePage from './pages/HomePage'
import BookingPage from './pages/BookingPage'
import BarberPortalPage from './pages/BarberPortalPage'
import OwnerDashboardPage from './pages/OwnerDashboardPage'
import GalleryPage from './pages/GalleryPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import UnsubscribePage from './pages/UnsubscribePage'
import ManageBookingPage from './pages/ManageBookingPage'
import AccountPage from './pages/AccountPage'
import NotFoundPage from './pages/NotFoundPage'
import EmailSmsPopup from './components/EmailSmsPopup'
import { installAnchorGlide } from './lib/glide'

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

function AppInner() {
  const location = useLocation()

  // New page, top of page. Without this, deep scroll positions carry across
  // routes (footer -> /book landed mid-page).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <div className="grain relative">
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
    </div>
  )
}

export default function App() {
  const init = useAuthStore((s) => s.init)
  useEffect(() => { init() }, [init])
  useEffect(() => installAnchorGlide({ headerOffset: 96 }), [])
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppInner />
      </ErrorBoundary>
    </BrowserRouter>
  )
}
