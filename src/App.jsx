import Nav from './components/Nav'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Services from './components/Services'
import Experience from './components/Experience'
import Process from './components/Process'
import Testimonials from './components/Testimonials'
import Booking from './components/Booking'
import Visit from './components/Visit'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="grain relative">
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Services />
        <Experience />
        <Process />
        <Testimonials />
        <Booking />
        <Visit />
      </main>
      <Footer />
    </div>
  )
}
