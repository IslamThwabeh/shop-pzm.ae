import { useState, useMemo } from 'react'
import { Filter } from 'lucide-react'
import type { Product } from '@shared/types'
import ProductCard from '../components/ProductCard'

interface ProductListingProps {
  products: Product[]
  loading: boolean
}

type SortOption = 'price-asc' | 'price-desc' | 'newest'
type ConditionFilter = 'all' | 'new' | 'used'

export default function ProductListing({ products, loading }: ProductListingProps) {
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
      <h1 className="text-4xl font-bold mb-2">PZM Computers & Phones Store</h1>
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
            <label className="block text-sm font-medium text-gray-900 mb-2">Condition</label>
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value as ConditionFilter)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 font-medium"
            >
              <option value="all">All Conditions</option>
              <option value="new">Brand New</option>
              <option value="used">Used</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Min Price (AED)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 font-semibold"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Max Price (AED)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 font-semibold"
              placeholder="10000"
            />
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 font-medium"
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
              <div key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
