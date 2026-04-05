import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Filter } from 'lucide-react'
import type { Product } from '@shared/types'
import ProductCard from '../components/ProductCard'
import Seo from '../components/Seo'

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

  const liveProducts = useMemo(
    () => products.filter((product) => (product.quantity ?? 0) > 0),
    [products]
  )
  const liveNewCount = useMemo(
    () => liveProducts.filter((product) => product.condition === 'new').length,
    [liveProducts]
  )
  const liveUsedCount = useMemo(
    () => liveProducts.filter((product) => product.condition === 'used').length,
    [liveProducts]
  )
  const lowestLivePrice = useMemo(
    () => (liveProducts.length > 0 ? Math.min(...liveProducts.map((product) => product.price)) : null),
    [liveProducts]
  )

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
      <div className="rounded-[28px] border border-brandBorder bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Live catalog</p>
        <p className="mt-4 text-lg text-brandTextMedium">Loading current product listings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <Seo
        title="Shop Devices in Dubai | PZM Computers & Phones"
        description="Browse current device listings from PZM in Dubai with filters for condition, price, and availability, or jump into the dedicated new, used, and iPhone pages."
        canonicalPath="/shop"
      />

      <section className="overflow-hidden rounded-[32px] border border-brandBorder bg-[linear-gradient(180deg,#f0f7ff_0%,#e8f4fd_100%)] p-8 shadow-sm md:p-12">
        <span className="inline-flex rounded-full bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-sky-700 shadow-sm">
          PZM Shop
        </span>
        <h1 className="mt-5 max-w-4xl text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
          Browse current device listings from the Dubai storefront
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-brandTextMedium">
          Use the full shop to compare current product listings by condition and price. If you want a category-first route, jump to the dedicated brand-new, used-device, or iPhone pages.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-brandBorder bg-white/80 px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brandTextMedium">Live products</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{liveProducts.length}</p>
          </div>
          <div className="rounded-2xl border border-brandBorder bg-white/80 px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brandTextMedium">Brand new</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{liveNewCount}</p>
          </div>
          <div className="rounded-2xl border border-brandBorder bg-white/80 px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brandTextMedium">Used</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{liveUsedCount}</p>
          </div>
          <div className="rounded-2xl border border-brandBorder bg-white/80 px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brandTextMedium">Starting from</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{lowestLivePrice ? `AED ${lowestLivePrice.toFixed(0)}` : 'Ask us'}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/services/brand-new"
            className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brandGreenDark"
          >
            Brand-New Devices
          </Link>
          <Link
            to="/services/secondhand"
            className="inline-flex items-center rounded-xl border border-brandBorder bg-white/80 px-5 py-3 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary"
          >
            Used Devices
          </Link>
          <Link
            to="/services/buy-iphone"
            className="inline-flex items-center rounded-xl border border-brandBorder bg-white/80 px-5 py-3 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary"
          >
            Buy iPhone
          </Link>
        </div>
      </section>

      <section className="rounded-[28px] border border-brandBorder bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-primary" />
              <h2 className="text-xl font-semibold text-slate-950">Refine the catalog</h2>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-brandTextMedium">
              Narrow the storefront by condition and price, then open the product page for full specs or add in-stock items straight to the cart.
            </p>
          </div>
          <span className="rounded-full bg-brandLight px-4 py-2 text-sm font-semibold text-primary">
            {filteredAndSorted.length} results
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-primary">Condition</label>
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value as ConditionFilter)}
              className="w-full rounded-xl border border-brandBorder px-4 py-3 text-brandTextDark font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Conditions</option>
              <option value="new">Brand New</option>
              <option value="used">Used</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-primary">Min Price (AED)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value))}
              className="w-full rounded-xl border border-brandBorder px-4 py-3 text-brandTextDark font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="0"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-primary">Max Price (AED)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full rounded-xl border border-brandBorder px-4 py-3 text-brandTextDark font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="10000"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-primary">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full rounded-xl border border-brandBorder px-4 py-3 text-brandTextDark font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Shop results</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">Current listings</h2>
            <p className="mt-3 max-w-3xl text-brandTextMedium">
              Browse the filtered storefront below. Use the dedicated service pages when you want a guided route for brand-new, used, or iPhone-specific shopping.
            </p>
          </div>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-brandTextDark shadow-sm ring-1 ring-brandBorder">
            {filteredAndSorted.length} listings
          </span>
        </div>

        {filteredAndSorted.length === 0 ? (
          <div className="rounded-[28px] border border-brandBorder bg-white p-10 text-center shadow-sm">
            <p className="text-xl font-bold text-slate-950">No products match your filters right now.</p>
            <p className="mt-3 text-brandTextMedium">Try widening the price range or switch to the dedicated brand-new or used-device pages for guided browsing.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/services/brand-new"
                className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brandGreenDark"
              >
                Brand-New Devices
              </Link>
              <Link
                to="/services/secondhand"
                className="inline-flex items-center rounded-xl border border-brandBorder px-5 py-3 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary"
              >
                Used Devices
              </Link>
            </div>
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
      </section>
    </div>
  )
}
