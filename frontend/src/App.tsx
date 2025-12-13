import { useState, useEffect } from 'react'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import './App.css'
import type { Product } from '@shared/types'
import { apiService } from './services/api'
import ProductListing from './pages/ProductListing'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import AdminPage from './pages/AdminPage'
import HomePage from './pages/HomePage'
import Header from './components/Header'

type PageType = 'home' | 'shop' | 'product' | 'cart' | 'checkout' | 'confirmation' | 'admin'

interface PageState {
  type: PageType
  productId?: string
  orderId?: string
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState<PageState>({ type: 'home' })
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

  const navigateTo = (page: PageState) => {
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={navigateTo} currentPage={currentPage.type} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {currentPage.type === 'home' && (
          <HomePage
            products={products}
            onShopClick={() => navigateTo({ type: 'shop' })}
          />
        )}

        {currentPage.type === 'shop' && (
          <ProductListing
            products={products}
            loading={loading}
            onProductClick={(productId) => navigateTo({ type: 'product', productId })}
          />
        )}

        {currentPage.type === 'product' && currentPage.productId && (
          <ProductDetail
            productId={currentPage.productId}
            onBack={() => navigateTo({ type: 'home' })}
            onCheckout={() => navigateTo({ type: 'checkout' })}
          />
        )}

        {currentPage.type === 'cart' && (
          <Cart
            onContinueShopping={() => navigateTo({ type: 'home' })}
            onCheckout={() => navigateTo({ type: 'checkout' })}
          />
        )}

        {currentPage.type === 'checkout' && (
          <Checkout
            onBack={() => navigateTo({ type: 'cart' })}
            onSuccess={(orderId) => navigateTo({ type: 'confirmation', orderId })}
          />
        )}

        {currentPage.type === 'confirmation' && currentPage.orderId && (
          <OrderConfirmation
            orderId={currentPage.orderId}
            onContinueShopping={() => navigateTo({ type: 'home' })}
          />
        )}

        {currentPage.type === 'admin' && (
          <AdminPage />
        )}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <CartProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </CartProvider>
  )
}
