import { useState, useEffect } from 'react'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import type { Product } from '@shared/types'
import { apiService } from '../services/api'
import { useCart } from '../context/CartContext'

interface ProductDetailProps {
  productId: string
  onBack: () => void
  onCheckout: () => void
}

export default function ProductDetail({ productId, onBack, onCheckout }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const { addItem } = useCart()

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        const data = await apiService.getProduct(productId)
        if (data) {
          setProduct(data)
          setError(null)
        } else {
          setError('Product not found')
        }
      } catch (err) {
        setError('Failed to load product')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [productId])

  const handleAddToCart = () => {
    if (product && quantity > 0) {
      addItem({
        id: product.id,
        model: product.model,
        price: product.price,
        quantity,
        color: product.color,
        storage: product.storage,
      })
      alert('Added to cart!')
      onCheckout()
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading product...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={20} />
          Back to Products
        </button>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft size={20} />
        Back to Products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-lg shadow p-8">
        {/* Product Image */}
        <div className="flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg h-96">
          {product.image_url || product.images?.[0] ? (
            <img
              src={product.image_url || product.images?.[0] || ''}
              alt={product.model}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="text-center">
              <p className="text-gray-500">No image available</p>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.model}</h1>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                product.condition === 'new'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {product.condition === 'new' ? '✨ Brand New' : '📱 Used'}
              </span>
              <span className="text-gray-600">{product.color}</span>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Specifications</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Storage:</span>
                <span className="font-semibold">{product.storage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Condition:</span>
                <span className="font-semibold capitalize">{product.condition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Color:</span>
                <span className="font-semibold">{product.color}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Stock:</span>
                <span className={`font-semibold ${product.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.quantity > 0 ? `${product.quantity} available` : 'Out of stock'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}

          {/* Price */}
          <div className="mb-6">
            <p className="text-gray-600 mb-2">Price</p>
            <p className="text-5xl font-bold text-blue-600">AED {product.price.toFixed(2)}</p>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max={product.quantity}
                className="w-20 px-3 py-2 border border-gray-300 rounded text-center text-gray-900 font-semibold"
              />
              <button
                onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.quantity === 0}
            className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
              product.quantity === 0
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <ShoppingCart size={20} />
            {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart & Checkout'}
          </button>

          {/* COD Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>✓ Cash on Delivery Available</strong> - Pay when you receive your order
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
