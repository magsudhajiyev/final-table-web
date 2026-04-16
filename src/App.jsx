import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import TabShowcase from './components/TabShowcase'
import FeatureHighlight from './components/FeatureHighlight'
import Features from './components/Features'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  // Lenis smooth scroll
  useEffect(() => {
    if (typeof Lenis === 'undefined') return
    const lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })
    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault()
        const target = this.getAttribute('href')
        if (target && target !== '#' && document.querySelector(target)) {
          lenis.scrollTo(target)
        }
      })
    })

    return () => lenis.destroy()
  }, [])

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view')
          obs.unobserve(entry.target)
        }
      })
    }, { root: null, rootMargin: '0px', threshold: 0.15 })

    const observe = () => {
      document.querySelectorAll('.observe-me').forEach(el => observer.observe(el))
    }
    observe()

    // Re-run after a tick in case components haven't rendered yet
    const id = setTimeout(observe, 100)
    return () => {
      clearTimeout(id)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      <Navbar />
      <main className="main">
        <Hero />
        <TabShowcase />
        <FeatureHighlight />
        <Features />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
