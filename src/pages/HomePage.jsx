import Nav from '../components/Nav'
import Hero from '../components/Hero'
import Marquee from '../components/Marquee'
import Services from '../components/Services'
import Team from '../components/Team'
import Experience from '../components/Experience'
import Process from '../components/Process'
import Testimonials from '../components/Testimonials'
import Visit from '../components/Visit'
import Footer from '../components/Footer'

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Services />
        <Team />
        <Experience />
        <Process />
        <Testimonials />
        <Visit />
      </main>
      <Footer />
    </>
  )
}
