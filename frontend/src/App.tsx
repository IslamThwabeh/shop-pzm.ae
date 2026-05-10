import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { LanguageProvider } from './context/LanguageContext'
import './App.css'
import type { Product, WhatsAppLeadType } from '@shared/types'
import { apiService } from './services/api'
import HomePage from './pages/HomePage'
import Header from './components/Header'
import Footer from './components/Footer'
import StoreContactSection from './components/StoreContactSection'
import ConsentBanner from './components/ConsentBanner'
import { sanitizeProductsForDisplay } from './utils/productPresentation'
import { isPhoneHref, isWhatsAppHref, openTrackedPhoneHref, trackWhatsAppLead } from './utils/analytics'
import { openRegisteredWhatsAppHref } from './utils/whatsappLead'

const ProductDetails = lazy(() => import('./pages/ProductDetails'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const Terms = lazy(() => import('./pages/Terms'))
const AdminInvoice = lazy(() => import('./pages/AdminInvoice'))
const ServicesPage = lazy(() => import('./pages/ServicesPage'))
const ServicePage = lazy(() => import('./pages/ServicePage'))
const AreasPage = lazy(() => import('./pages/AreasPage'))
const AreaPage = lazy(() => import('./pages/AreaPage'))
const ReturnPolicyPage = lazy(() => import('./pages/ReturnPolicyPage'))
const BlogPage = lazy(() => import('./pages/BlogPage'))
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'))
const BuyIphonePage = lazy(() => import('./pages/BuyIphonePage'))
const BrandNewPage = lazy(() => import('./pages/BrandNewPage'))
const SecondhandPage = lazy(() => import('./pages/SecondhandPage'))

type PreloadedProductsMode = 'none' | 'partial' | 'single' | 'full'

function readPreloadedProducts() {
  if (typeof document === 'undefined') {
    return [] as Product[]
  }

  const payloadElement = document.getElementById('pzm-preloaded-products')
  if (!payloadElement?.textContent) {
    return [] as Product[]
  }

  try {
    const parsed = JSON.parse(payloadElement.textContent)
    return Array.isArray(parsed) ? sanitizeProductsForDisplay(parsed as Product[]) : []
  } catch (error) {
    console.error('Failed to parse preloaded products', error)
    return [] as Product[]
  }
}

function readPreloadedProductsMode(): PreloadedProductsMode {
  if (typeof document === 'undefined') {
    return 'none'
  }

  const payloadElement = document.getElementById('pzm-preloaded-products-meta')
  if (!payloadElement?.textContent) {
    return 'none'
  }

  try {
    const parsed = JSON.parse(payloadElement.textContent) as { mode?: PreloadedProductsMode }
    return parsed.mode || 'none'
  } catch (error) {
    console.error('Failed to parse preloaded products metadata', error)
    return 'none'
  }
}

function routeNeedsFullCatalog(pathname: string) {
  return (
    pathname.startsWith('/services/buy-iphone') ||
    pathname.startsWith('/services/brand-new') ||
    pathname.startsWith('/services/secondhand') ||
    pathname.startsWith('/product/')
  )
}

function getWhatsAppLeadType(pathname: string, href: string, referenceLabel?: string): WhatsAppLeadType {
  if (pathname.startsWith('/product/')) {
    return 'product'
  }

  const leadSignal = `${referenceLabel || ''} ${href}`.toLowerCase()
  if (pathname.startsWith('/services/') && /appointment|book/.test(leadSignal)) {
    return 'appointment'
  }

  return 'service'
}

function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const [initialProducts] = useState<Product[]>(() => readPreloadedProducts())
  const [catalogMode, setCatalogMode] = useState<PreloadedProductsMode>(() => readPreloadedProductsMode())
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [loading, setLoading] = useState(initialProducts.length === 0)
  const [error, setError] = useState<string | null>(null)
  const [fullCatalogRequested, setFullCatalogRequested] = useState(false)

  // Strip /ar prefix so all route-type checks work identically for both
  // the English surface (/) and the Arabic mirror (/ar/).
  const effectivePath = location.pathname.startsWith('/ar/')
    ? location.pathname.slice(3)   // "/ar/services/foo" → "/services/foo"
    : location.pathname === '/ar'
      ? '/'
      : location.pathname

  const currentPageRaw = effectivePath === '/'
    ? 'home'
    : (effectivePath.split('/')[1] || 'home').replace(/\.html$/i, '')
  const currentPage = currentPageRaw === 'blog-post' ? 'blog' : currentPageRaw
  const currentRouteNeedsFullCatalog = routeNeedsFullCatalog(effectivePath)
  const requiresFullCatalogLoad = catalogMode === 'none' || currentRouteNeedsFullCatalog || fullCatalogRequested
  const routeLoading = loading || (currentRouteNeedsFullCatalog && catalogMode === 'none')

  const requestFullCatalog = () => {
    if (catalogMode === 'full') {
      return
    }

    setFullCatalogRequested(true)
  }

  useEffect(() => {
    if (!requiresFullCatalogLoad || catalogMode === 'full') {
      return undefined
    }

    const loadProducts = async () => {
      const shouldShowLoader = currentRouteNeedsFullCatalog || (catalogMode === 'none' && initialProducts.length === 0)

      try {
        if (shouldShowLoader) {
          setLoading(true)
        }

        const data = sanitizeProductsForDisplay(await apiService.getProducts())
        if (data.length > 0 || catalogMode === 'none') {
          setProducts(data)
          setCatalogMode('full')
        }

        setError(null)
      } catch (err) {
        if (catalogMode === 'none') {
          setError('Failed to load products')
        }
        console.error(err)
      } finally {
        setFullCatalogRequested(false)
        setLoading(false)
      }
    }

    loadProducts()
    return undefined
  }, [catalogMode, currentRouteNeedsFullCatalog, fullCatalogRequested, initialProducts.length, requiresFullCatalogLoad])

  useEffect(() => {
    if (!('scrollRestoration' in window.history)) {
      return undefined
    }

    const previousValue = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'

    return () => {
      window.history.scrollRestoration = previousValue
    }
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname, location.search])

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }

      const target = event.target
      if (!(target instanceof Element)) {
        return
      }

      const anchor = target.closest('a[href]')
      if (!(anchor instanceof HTMLAnchorElement)) {
        return
      }

      const href = anchor.href
      const referenceLabel = anchor.textContent?.trim() || undefined

      if (isPhoneHref(href)) {
        event.preventDefault()
        openTrackedPhoneHref({
          href,
          referenceLabel,
          sourcePage: location.pathname,
        })
        return
      }

      if (isWhatsAppHref(href)) {
        event.preventDefault()
        trackWhatsAppLead({
          leadType: 'generic',
          referenceLabel,
          sourcePage: location.pathname,
        })
        openRegisteredWhatsAppHref({
          href,
          leadType: getWhatsAppLeadType(location.pathname, href, referenceLabel),
          referenceLabel,
          sourcePage: location.pathname,
        })
        return
      }
    }

    document.addEventListener('click', handleDocumentClick)
    return () => {
      document.removeEventListener('click', handleDocumentClick)
    }
  }, [location.pathname])

  const navigateTo = (path: string) => {
    navigate(path)
    window.scrollTo(0, 0)
  }

  const redirectTo = (path: string) => <Navigate replace to={path} />

  const isInvoiceRoute = location.pathname.startsWith('/admin/orders/') && location.pathname.endsWith('/invoice')
  const isAdminRoute = location.pathname.startsWith('/admin')
  const isHomeRoute = effectivePath === '/'
  const isServiceRoute = effectivePath.startsWith('/services')
  const isFullWidthRoute = isHomeRoute || isServiceRoute
  const showStoreContactSection =
    !isInvoiceRoute &&
    !isAdminRoute &&
    !location.pathname.startsWith('/order/')

  if (isInvoiceRoute) {
    return (
      <Suspense fallback={null}>
        <Routes>
          <Route path="/admin/orders/:id/invoice" element={<AdminInvoice />} />
        </Routes>
      </Suspense>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {!isAdminRoute && (
        <Header
          currentPage={currentPage}
          products={products}
          onSearchActivate={requestFullCatalog}
          onNavigate={(page) => {
            // keep compatibility with previous onNavigate signature
            if (page && (page as any).type) {
              const p = page as any
              if (p.type === 'home') navigateTo('/')
              else if (p.type === 'admin') navigateTo('/admin')

            }
          }}
        />
      )}

      <main className={isAdminRoute || isFullWidthRoute ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'}>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <Suspense fallback={<div className="flex items-center justify-center py-24 text-sm text-slate-400">Loading…</div>}>
        <Routes>
          <Route path="/admin/orders/:id/invoice" element={<AdminInvoice />} />
          <Route
            path="/index.html"
            element={redirectTo('/')}
          />
          <Route
            path="/"
            element={<HomePage products={products} />}
          />
          <Route
            path="/services"
            element={<ServicesPage />}
          />
          <Route
            path="/services/index.html"
            element={redirectTo('/services/')}
          />
          <Route
            path="/services/buy-iphone"
            element={<BuyIphonePage products={products} loading={loading || routeLoading} />}
          />
          <Route
            path="/services/buy-iphone.html"
            element={redirectTo('/services/buy-iphone/')}
          />
          <Route
            path="/services/brand-new"
            element={<BrandNewPage products={products} loading={loading || routeLoading} />}
          />
          <Route
            path="/services/brand-new.html"
            element={redirectTo('/services/brand-new/')}
          />
          <Route
            path="/services/secondhand"
            element={<SecondhandPage products={products} loading={loading || routeLoading} />}
          />
          <Route
            path="/services/secondhand.html"
            element={redirectTo('/services/secondhand/')}
          />
          <Route
            path="/services/buy-used"
            element={redirectTo('/services/secondhand/')}
          />
          <Route
            path="/services/buy-used.html"
            element={redirectTo('/services/secondhand/')}
          />
          <Route
            path="/services/:slug"
            element={<ServicePage />}
          />
          <Route
            path="/areas"
            element={<AreasPage />}
          />
          <Route
            path="/areas/index.html"
            element={redirectTo('/areas/')}
          />
          <Route
            path="/areas/:slug"
            element={<AreaPage />}
          />
          <Route
            path="/blog"
            element={<BlogPage />}
          />
          <Route
            path="/blog.html"
            element={redirectTo('/blog/')}
          />
          <Route
            path="/blog/:slug"
            element={<BlogPostPage />}
          />
          <Route
            path="/blog-post.html"
            element={<BlogPostPage />}
          />
          <Route
            path="/blog-post"
            element={<BlogPostPage />}
          />
          <Route
            path="/product/:id"
            element={<ProductDetails products={products} />}
          />
          <Route
            path="/cart"
            element={<Cart onContinueShopping={() => navigateTo('/services/brand-new')} onCheckout={() => navigateTo('/checkout')} />}
          />
          <Route
            path="/checkout"
            element={<Checkout onBack={() => navigateTo('/cart')} onSuccess={(id) => navigateTo(`/order/${id}`)} />}
          />

          <Route
            path="/order/:id"
            element={<OrderConfirmation onContinueShopping={() => navigateTo('/')} orderId={undefined as any} />}
          />
          <Route
            path="/terms"
            element={<Terms />}
          />
          <Route
            path="/terms.html"
            element={redirectTo('/terms/')}
          />
          <Route
            path="/return-policy"
            element={<ReturnPolicyPage />}
          />
          <Route
            path="/return-policy.html"
            element={redirectTo('/return-policy/')}
          />
          <Route
            path="/admin"
            element={<AdminPage onLogout={() => navigateTo('/')} />}
          />

          {/* ── Arabic mirror routes (/ar/*) ──────────────── */}
          <Route path="/ar" element={<HomePage products={products} />} />
          <Route path="/ar/" element={<HomePage products={products} />} />
          <Route path="/ar/services/:slug" element={<ServicePage />} />
          <Route path="/ar/services/:slug/" element={<ServicePage />} />
          <Route path="/ar/services/buy-iphone" element={<BuyIphonePage products={products} loading={loading || routeLoading} />} />
          <Route path="/ar/services/buy-iphone/" element={<BuyIphonePage products={products} loading={loading || routeLoading} />} />
          <Route path="/ar/return-policy" element={<ReturnPolicyPage />} />
          <Route path="/ar/return-policy/" element={<ReturnPolicyPage />} />
        </Routes>
        </Suspense>
      </main>

      {showStoreContactSection && <StoreContactSection />}
      {!isInvoiceRoute && !isAdminRoute && <Footer />}
      {!isInvoiceRoute && !isAdminRoute && <ConsentBanner />}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
