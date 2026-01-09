import { Link } from 'react-router-dom'
import type { Product } from '@shared/types'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
    >
      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
        {product.image_url || product.images?.[0] ? (
          <img
            src={product.image_url || product.images?.[0] || ''}
            alt={product.model}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center">
            <p className="text-gray-500 text-sm">No image</p>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900">{product.model}</h3>

        <div className="flex justify-between items-start mt-2">
          <div>
            <p className="text-sm text-gray-600">
              {product.storage} • {product.condition === 'new' ? '✨ Brand New' : '📱 Used'}
            </p>
            <p className="text-sm text-gray-600">{product.color}</p>
          </div>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
            {product.condition === 'new' ? 'New' : 'Used'}
          </span>
        </div>

        <p className="text-2xl font-bold text-blue-600 mt-4">AED {product.price.toFixed(2)}</p>

        <p className="text-sm text-gray-500 mt-2">
          Stock: {product.quantity > 0 ? (
            <span className="text-green-600 font-semibold">{product.quantity} available</span>
          ) : (
            <span className="text-red-600 font-semibold">Out of stock</span>
          )}
        </p>

        {product.description && (
          <p className="text-sm text-gray-600 mt-3 line-clamp-2">{product.description}</p>
        )}

        <div className="mt-4">
          <span className="inline-block w-full text-center bg-blue-600 text-white py-2 rounded font-medium">
            View Details
          </span>
        </div>
      </div>
    </Link>
  )
}
