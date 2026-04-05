import { useState, useEffect, useLayoutEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import './App.css'
import type { Product } from '@shared/types'
import { apiService } from './services/api'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
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

function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentPageRaw = location.pathname === '/'
    ? 'home'
    : (location.pathname.split('/')[1] || 'home').replace(/\.html$/i, '')
  const currentPage = currentPageRaw === 'blog-post' ? 'blog' : currentPageRaw

  // Load Elfsight widget script for Google Reviews
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://static.elfsight.com/platform/platform.js'
    script.setAttribute('data-use-service-core', '')
    script.async = true
    document.body.appendChild(script)

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const data = await apiService.getProducts()
        setProducts(data)
        setError(null)
      } catch (err) {
        setError('Failed to load products')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

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
    location.pathname !== '/cart' &&
    location.pathname !== '/checkout' &&
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
              else if (p.type === 'cart') navigateTo('/cart')
              else if (p.type === 'checkout') navigateTo('/checkout')
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
            path="/shop"
            element={<Navigate to="/services/brand-new" replace />}
          />
          <Route
            path="/product/:id"
            element={<ProductDetails />}
          />
          <Route
            path="/cart"
            element={<Cart onContinueShopping={() => navigateTo('/services/brand-new')} onCheckout={() => navigateTo('/checkout')} />}
          />
          <Route
            path="/checkout"
            element={<Checkout onBack={() => navigateTo('/cart')} onSuccess={(orderId) => navigateTo(`/order/${orderId}`)} />}
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
    <CartProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </CartProvider>
  )
}

export default App
