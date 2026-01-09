import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import './App.css'
import type { Product } from '@shared/types'
import { apiService } from './services/api'
import ProductListing from './pages/ProductListing'
import ProductDetail from './pages/ProductDetail'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import AdminPage from './pages/AdminPage'
import HomePage from './pages/HomePage'
import Header from './components/Header'

function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const navigateTo = (path: string) => {
    navigate(path)
    window.scrollTo(0, 0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentPage={location.pathname === '/' ? 'home' : location.pathname.split('/')[1] || 'home'}
        onNavigate={(page) => {
          // keep compatibility with previous onNavigate signature
          if (page && (page as any).type) {
            const p = page as any
            if (p.type === 'home') navigateTo('/')
            else if (p.type === 'shop') navigateTo('/shop')
            else if (p.type === 'admin') navigateTo('/admin')
            else if (p.type === 'cart') navigateTo('/cart')
            else if (p.type === 'checkout') navigateTo('/checkout')
          }
        }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <Routes>
          <Route
            path="/"
            element={<HomePage products={products} onShopClick={() => navigateTo('/shop')} />}
          />
          <Route
            path="/shop"
            element={<ProductListing products={products} loading={loading} onProductClick={(id) => navigateTo(`/product/${id}`)} />}
          />
          <Route
            path="/product/:id"
            element={<ProductDetails />}
          />
          <Route
            path="/cart"
            element={<Cart onContinueShopping={() => navigateTo('/shop')} onCheckout={() => navigateTo('/checkout')} />}
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
            path="/admin"
            element={<AdminPage onLogout={() => navigateTo('/')} />}
          />
        </Routes>
      </main>
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
