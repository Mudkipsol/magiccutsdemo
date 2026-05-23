import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import HomePage from './pages/HomePage'
import BookingPage from './pages/BookingPage'
import BarberPortalPage from './pages/BarberPortalPage'
import OwnerDashboardPage from './pages/OwnerDashboardPage'
import EmailSmsPopup from './components/EmailSmsPopup'

export default function App() {
  const init = useAuthStore((s) => s.init)
  useEffect(() => { init() }, [init])

  return (
    <BrowserRouter>
      <div className="grain relative">
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
        <Routes>
          <Route path="/" element={<><HomePage /><EmailSmsPopup /></>} />
          <Route path="/book" element={<BookingPage />} />
          <Route path="/barber" element={<BarberPortalPage />} />
          <Route path="/dashboard" element={<OwnerDashboardPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
