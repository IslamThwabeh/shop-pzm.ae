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
        condition: product.condition,
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
          className="inline-flex items-center gap-2 px-4 py-2 text-primary hover:opacity-90"
        >
          <ArrowLeft size={20} />
          Back to Products
        </button>
      </div>
    )
  }

  const totalPrice = product ? product.price * quantity : 0

  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-primary hover:opacity-90 mb-6"
      >
        <ArrowLeft size={20} />
        Back to Products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-lg shadow p-8">
        {/* Product Image */}
        <div className="flex items-center justify-center bg-green-50 rounded-lg h-96">
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
            <h1 className="text-4xl font-bold text-primary mb-2">{product.model}</h1>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                product.condition === 'new'
                  ? 'bg-green-100 text-primary'
                  : 'bg-green-100 text-primary'
              }`}>
                {product.condition === 'new' ? '✨ Brand New' : '📱 Used'}
              </span>
              <span className="text-brandTextMedium">{product.color}</span>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-primary mb-3">Specifications</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-brandTextMedium">Storage:</span>
                <span className="font-semibold text-brandTextDark">{product.storage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brandTextMedium">Condition:</span>
                <span className="font-semibold text-brandTextDark capitalize">{product.condition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brandTextMedium">Color:</span>
                <span className="font-semibold text-brandTextDark">{product.color}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brandTextMedium">Stock:</span>
                <span className={`font-semibold ${product.quantity > 0 ? 'text-brandGreenDark' : 'text-brandRed'}`}>
                  {product.quantity > 0 ? `${product.quantity} available` : 'Out of stock'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-primary mb-2">Description</h3>
              <p className="text-brandTextMedium">{product.description}</p>
            </div>
          )}

          {/* Price */}
          <div className="mb-6 space-y-2">
            <div>
              <p className="text-brandTextMedium">Price (per unit)</p>
              <p className="text-3xl font-bold text-primary">AED {product.price.toFixed(2)}</p>
            </div>
            <div className="rounded-lg bg-green-50 border border-primary p-3">
              <p className="text-sm font-semibold text-primary">Total ({quantity} × AED {product.price.toFixed(2)})</p>
              <p className="text-4xl font-bold text-primary">AED {totalPrice.toFixed(2)}</p>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-primary mb-2">Quantity</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 border-2 border-brandBorder rounded-md hover:border-primary hover:bg-green-50 transition-colors text-primary font-bold text-lg"
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max={product.quantity}
                className="w-20 px-3 py-2 border-2 border-brandBorder rounded-md text-center text-brandTextDark font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <button
                onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                className="px-4 py-2 border-2 border-brandBorder rounded-md hover:border-primary hover:bg-green-50 transition-colors text-primary font-bold text-lg"
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
                : 'bg-primary text-white hover:bg-brandGreenDark'
            }`}
          >
            <ShoppingCart size={20} />
            {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart & Checkout'}
          </button>

          {/* COD Info */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-primary">
            <p className="text-sm text-primary font-semibold">
              ✓ Cash on Delivery Available - Pay when you receive your order
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
