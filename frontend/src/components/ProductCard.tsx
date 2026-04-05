import { Link } from 'react-router-dom'
import type { Product } from '@shared/types'
import { useCart } from '../context/CartContext'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart()

  const handleAddToCart = () => {
    if ((product.quantity ?? 0) <= 0) {
      return
    }

    addItem({
      id: product.id,
      model: product.model,
      price: product.price,
      quantity: 1,
      color: product.color,
      storage: product.storage,
      condition: product.condition,
    })
  }

  return (
    <article className="bg-white rounded-lg border border-brandBorder shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="w-full h-56 md:h-56 lg:h-64 bg-green-50 flex items-center justify-center">
        {product.image_url || product.images?.[0] ? (
          <img
            src={product.image_url || product.images?.[0] || ''}
            alt={product.model}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-center">
            <p className="text-gray-500 text-sm">No image</p>
          </div>
        )}
      </div>

      <div className="p-4 md:p-6">
        <h3 className="text-xl md:text-lg font-semibold text-brandTextDark leading-tight">{product.model}</h3>

        <div className="flex justify-between items-start mt-2">
          <div>
            <p className="text-sm text-brandTextMedium leading-relaxed">
              {product.storage} • {product.condition === 'new' ? '✨ Brand New' : '📱 Used'}
            </p>
            <p className="text-sm text-brandTextMedium">{product.color}</p>
          </div>
          <span className="px-2 py-1 bg-green-100 text-primary text-xs font-semibold rounded">
            {product.condition === 'new' ? 'New' : 'Used'}
          </span>
        </div>

        <p className="text-3xl md:text-2xl font-bold text-primary mt-4 leading-tight">AED {product.price.toFixed(2)}</p>

        <div className="mt-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-primary text-xs font-semibold">
            Cash on Delivery
          </span>
        </div>

        <p className="text-sm text-brandTextMedium mt-2 leading-relaxed">
          Stock: {product.quantity > 0 ? (
            <span className="text-brandGreenDark font-semibold">{product.quantity} available</span>
          ) : (
            <span className="text-brandRed font-semibold">Out of stock</span>
          )}
        </p>

        {product.description && (
          <p className="text-sm text-brandTextMedium mt-3 line-clamp-2 leading-relaxed">{product.description}</p>
        )}

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            to={`/product/${product.id}`}
            className="inline-flex w-full items-center justify-center rounded-md border border-brandBorder px-4 py-3 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary"
          >
            View Details
          </Link>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={(product.quantity ?? 0) <= 0}
            className={`inline-flex w-full items-center justify-center rounded-md px-4 py-3 text-sm font-semibold transition-colors ${
              (product.quantity ?? 0) > 0
                ? 'bg-primary text-white hover:bg-brandGreenDark'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {(product.quantity ?? 0) > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>

        <p className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-brandTextMedium">
          Open the product page for full specs, photos, and delivery details.
        </p>
      </div>
    </article>
  )
}
