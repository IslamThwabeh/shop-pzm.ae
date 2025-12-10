import { useEffect, useState } from 'react'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import './App.css'
import type { Product } from '@shared/types'
import { apiService } from './services/api'

function AppContent() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">PZM iPhone Store</h1>
          <p className="text-gray-600 mt-2">Buy new and used iPhones with Cash on Delivery</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-8">Available Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-semibold">{product.model}</h3>
                  <p className="text-gray-600 text-sm">{product.storage} • {product.condition === 'new' ? 'Brand New' : 'Used'}</p>
                  <p className="text-gray-600 text-sm">{product.color}</p>
                  <p className="text-2xl font-bold text-blue-600 mt-4">AED {product.price.toFixed(2)}</p>
                  <p className="text-gray-500 text-sm mt-2">Stock: {product.quantity}</p>
                  <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors">
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
            {products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">No products available</p>
              </div>
            )}
          </div>
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
