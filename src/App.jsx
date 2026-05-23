import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { motion, AnimatePresence, useScroll } from 'framer-motion'
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
import NotFoundPage from './pages/NotFoundPage'
import EmailSmsPopup from './components/EmailSmsPopup'

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
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <Routes location={location}>
            <Route path="/" element={<><HomePage /><EmailSmsPopup /></>} />
            <Route path="/book" element={<BookingPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/unsubscribe" element={<UnsubscribePage />} />
            <Route path="/barber" element={<BarberPortalPage />} />
            <Route path="/dashboard" element={<OwnerDashboardPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
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
      <ErrorBoundary>
        <AppInner />
      </ErrorBoundary>
    </BrowserRouter>
  )
}
