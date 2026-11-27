import { gsap } from 'gsap'
import { Component, lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from 'react'
import { Route, Routes, type Location } from 'react-router-dom'
import { Footer } from './components/sections/Footer'
import { qualityFor } from './components/three/quality'
import { CartDrawer } from './components/ui/CartDrawer'
import { Cursor } from './components/ui/Cursor'
import { Loader } from './components/ui/Loader'
import { Navbar } from './components/ui/Navbar'
import { PageTransition } from './components/ui/PageTransition'
import { detectWebGL, isLowPower, isMobileViewport, isTouchDevice, prefersReducedMotion } from './lib/device'
import { measureSections, scene } from './lib/scene'
import { initSmoothScroll } from './lib/smoothScroll'
import AboutPage from './pages/AboutPage'
import BlendsPage from './pages/BlendsPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import ContactPage from './pages/ContactPage'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import ProductPage from './pages/ProductPage'
import ShopPage from './pages/ShopPage'
import SpicesPage from './pages/SpicesPage'

// The scroll-driven 3D film is the heaviest chunk — load it in parallel with the loader.
const CinematicScrollScene = lazy(() => import('./components/three/CinematicScrollScene'))

/** If WebGL fails at runtime, fall back to the illustrated hero. */
class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    console.warn('[3D] scene disabled:', error)
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/** Read once at startup, before the first render. */
function readEnvironment() {
  const reduced = prefersReducedMotion()
  const mobile = isMobileViewport()
  const touch = isTouchDevice()
  scene.reducedMotion = reduced
  scene.isMobile = mobile
  scene.isTouch = touch
  return { reduced, mobile, touch, webgl: detectWebGL(), lowPower: isLowPower() }
}
const env = readEnvironment()
const quality = qualityFor(env.mobile, env.lowPower)

/** Pages with a scroll-driven WebGL film. */
function sceneModeFor(pathname: string) {
  if (pathname === '/') return 'home' as const
  if (pathname === '/about') return 'about' as const
  return null
}

export default function App() {
  const initialMode = sceneModeFor(window.location.pathname)
  const [webglOk, setWebglOk] = useState(env.webgl)
  const [sceneReady, setSceneReady] = useState(!env.webgl || !initialMode)
  const [fontsReady, setFontsReady] = useState(false)
  const [intro, setIntro] = useState(false)

  useEffect(() => {
    window.history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    return initSmoothScroll(env.reduced)
  }, [])

  // fonts must be ready before jar labels are painted & layout is measured
  useEffect(() => {
    let alive = true
    const timeout = window.setTimeout(() => alive && setFontsReady(true), 4000)
    Promise.all([
      document.fonts.load('600 96px Cinzel'),
      document.fonts.load('700 92px "Cormorant Garamond"'),
      document.fonts.load('italic 600 92px "Cormorant Garamond"'),
      document.fonts.load('600 30px Manrope'),
    ])
      .catch(() => undefined)
      .finally(() => {
        if (!alive) return
        window.clearTimeout(timeout)
        setFontsReady(true)
      })
    return () => {
      alive = false
      window.clearTimeout(timeout)
    }
  }, [])

  // never let a slow GPU hold the curtain closed forever
  useEffect(() => {
    const t = window.setTimeout(() => setSceneReady(true), 9000)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    if (env.touch) return
    const move = (e: PointerEvent) => {
      scene.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      scene.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])

  const startIntro = useCallback(() => {
    setIntro(true)
    measureSections()
    gsap.to(scene, { intro: 1, duration: env.reduced ? 0.01 : 3.4, ease: 'power2.out' })
  }, [])

  const onSceneError = useCallback(() => {
    setWebglOk(false)
    setSceneReady(true)
  }, [])

  const renderPage = (location: Location) => {
    const mode = sceneModeFor(location.pathname)
    return (
      <>
        {webglOk && fontsReady && mode && (
          <div className="pointer-events-none fixed inset-0 z-10" aria-hidden>
            <SceneBoundary onError={onSceneError}>
              <Suspense fallback={null}>
                <CinematicScrollScene key={mode} mode={mode} quality={quality} onReady={() => setSceneReady(true)} />
              </Suspense>
            </SceneBoundary>
          </div>
        )}
        <main id="main">
          <Routes location={location}>
            <Route path="/" element={<HomePage ready={intro} fallback={!webglOk} />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/spices" element={<SpicesPage webgl={webglOk} />} />
            <Route path="/blends" element={<BlendsPage webgl={webglOk} />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/shop/:id" element={<ProductPage webgl={webglOk} />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </>
    )
  }

  return (
    <div className="grain">
      <Loader ready={fontsReady && sceneReady} onDone={startIntro} />
      {!env.touch && !env.reduced && <Cursor />}
      <Navbar visible={intro} />
      <CartDrawer />
      <PageTransition>{renderPage}</PageTransition>
      <Footer />
    </div>
  )
}
