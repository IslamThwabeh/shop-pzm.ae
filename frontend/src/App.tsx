import { useState, useEffect, useLayoutEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import './App.css'
import type { Product } from '@shared/types'
import { apiService } from './services/api'
import ProductDetails from './pages/ProductDetails'
import OrderConfirmation from './pages/OrderConfirmation'
import AdminPage from './pages/AdminPage'
import HomePage from './pages/HomePage'
import Header from './components/Header'
import Footer from './components/Footer'
import StoreContactSection from './components/StoreContactSection'
import Terms from './pages/Terms'
import AdminInvoice from './pages/AdminInvoice'
import ServicesPage from './pages/ServicesPage'
import ServicePage from './pages/ServicePage'
import AreasPage from './pages/AreasPage'
import AreaPage from './pages/AreaPage'
import ReturnPolicyPage from './pages/ReturnPolicyPage'
import BlogPage from './pages/BlogPage'
import BlogPostPage from './pages/BlogPostPage'
import BuyIphonePage from './pages/BuyIphonePage'
import BrandNewPage from './pages/BrandNewPage'
import SecondhandPage from './pages/SecondhandPage'
import { sanitizeProductsForDisplay } from './utils/productPresentation'

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

function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const [initialProducts] = useState<Product[]>(() => readPreloadedProducts())
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [loading, setLoading] = useState(initialProducts.length === 0)
  const [error, setError] = useState<string | null>(null)
  const currentPageRaw = location.pathname === '/'
    ? 'home'
    : (location.pathname.split('/')[1] || 'home').replace(/\.html$/i, '')
  const currentPage = currentPageRaw === 'blog-post' ? 'blog' : currentPageRaw

  useEffect(() => {
    const loadProducts = async () => {
      const shouldShowLoader = initialProducts.length === 0

      try {
        if (shouldShowLoader) {
          setLoading(true)
        }

        const data = sanitizeProductsForDisplay(await apiService.getProducts())
        if (data.length > 0 || initialProducts.length === 0) {
          setProducts(data)
        }
        setError(null)
      } catch (err) {
        if (initialProducts.length === 0) {
          setError('Failed to load products')
        }
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [initialProducts.length])

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

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname, location.search])

  const navigateTo = (path: string) => {
    navigate(path)
    window.scrollTo(0, 0)
  }

  const isInvoiceRoute = location.pathname.startsWith('/admin/orders/') && location.pathname.endsWith('/invoice')
  const isAdminRoute = location.pathname.startsWith('/admin')
  const isHomeRoute = location.pathname === '/'
  const showStoreContactSection =
    !isInvoiceRoute &&
    !isAdminRoute &&
    !location.pathname.startsWith('/order/')

  if (isInvoiceRoute) {
    return (
      <Routes>
        <Route path="/admin/orders/:id/invoice" element={<AdminInvoice />} />
      </Routes>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAdminRoute && (
        <Header
          currentPage={currentPage}
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

      <main className={isAdminRoute || isHomeRoute ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'}>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <Routes>
          <Route path="/admin/orders/:id/invoice" element={<AdminInvoice />} />
          <Route
            path="/"
            element={<HomePage products={products} onShopClick={() => navigateTo('/services/brand-new')} />}
          />
          <Route
            path="/services"
            element={<ServicesPage />}
          />
          <Route
            path="/services/index.html"
            element={<ServicesPage />}
          />
          <Route
            path="/services/buy-iphone"
            element={<BuyIphonePage products={products} loading={loading} />}
          />
          <Route
            path="/services/buy-iphone.html"
            element={<BuyIphonePage products={products} loading={loading} />}
          />
          <Route
            path="/services/brand-new"
            element={<BrandNewPage products={products} loading={loading} />}
          />
          <Route
            path="/services/brand-new.html"
            element={<BrandNewPage products={products} loading={loading} />}
          />
          <Route
            path="/services/secondhand"
            element={<SecondhandPage products={products} loading={loading} />}
          />
          <Route
            path="/services/secondhand.html"
            element={<SecondhandPage products={products} loading={loading} />}
          />
          <Route
            path="/services/buy-used"
            element={<SecondhandPage products={products} loading={loading} />}
          />
          <Route
            path="/services/buy-used.html"
            element={<SecondhandPage products={products} loading={loading} />}
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
            element={<AreasPage />}
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
            element={<BlogPage />}
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
            element={<ProductDetails />}
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
            element={<Terms />}
          />
          <Route
            path="/return-policy"
            element={<ReturnPolicyPage />}
          />
          <Route
            path="/return-policy.html"
            element={<ReturnPolicyPage />}
          />
          <Route
            path="/admin"
            element={<AdminPage onLogout={() => navigateTo('/')} />}
          />
        </Routes>
      </main>

      {showStoreContactSection && <StoreContactSection />}
      {!isInvoiceRoute && !isAdminRoute && <Footer />}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
