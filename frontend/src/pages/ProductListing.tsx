import { useState, useMemo } from 'react'
import { Filter } from 'lucide-react'
import type { Product } from '@shared/types'

interface ProductListingProps {
  products: Product[]
  loading: boolean
  onProductClick: (productId: string) => void
}

type SortOption = 'price-asc' | 'price-desc' | 'newest'
type ConditionFilter = 'all' | 'new' | 'used'

export default function ProductListing({ products, loading, onProductClick }: ProductListingProps) {
  const [sortBy, setSortBy] = useState<SortOption>('price-asc')
  const [conditionFilter, setConditionFilter] = useState<ConditionFilter>('all')
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(10000)

  const filteredAndSorted = useMemo(() => {
    let filtered = products.filter((p) => {
      const matchesCondition = conditionFilter === 'all' || p.condition === conditionFilter
      const matchesPrice = p.price >= minPrice && p.price <= maxPrice
      return matchesCondition && matchesPrice
    })

      const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'newest':
          return new Date(b.created_at || b.createdAt || 0).getTime() - new Date(a.created_at || a.createdAt || 0).getTime()
        default:
          return 0
      }
    })

    return sorted
  }, [products, sortBy, conditionFilter, minPrice, maxPrice])

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading products...</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">PZM iPhone Store</h1>
      <p className="text-gray-600 mb-8">Buy new and used iPhones with Cash on Delivery</p>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} />
          <h2 className="text-lg font-semibold">Filters & Sorting</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Condition Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value as ConditionFilter)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Conditions</option>
              <option value="new">Brand New</option>
              <option value="used">Used</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Price (AED)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (AED)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6">
          Available Products ({filteredAndSorted.length})
        </h2>

        {filteredAndSorted.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600">No products match your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSorted.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                onClick={() => onProductClick(product.id)}
              >
                {/* Product Image */}
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

                {/* Product Info */}
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

                  <p className="text-2xl font-bold text-blue-600 mt-4">
                    AED {product.price.toFixed(2)}
                  </p>

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

                  <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors font-medium">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
