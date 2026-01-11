import { Link } from 'react-router-dom'
import type { Product } from '@shared/types'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="block bg-white rounded-lg border border-brandBorder shadow-sm hover:shadow-md transition-shadow overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
    >
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

        <div className="mt-4">
          <span className="inline-block w-full text-center bg-primary hover:bg-brandGreenDark text-white h-11 rounded-md font-medium flex items-center justify-center transition-colors">
            View Details
          </span>
        </div>
      </div>
    </Link>
  )
}
