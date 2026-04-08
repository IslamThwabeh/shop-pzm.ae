import { useMemo } from 'react'
import type { Product } from '@shared/types'
import { extractBrand } from '../utils/productPresentation'

export interface FilterCategory {
  key: string
  shortTitle: string
  matcher: RegExp
}

interface CatalogFilterProps {
  categories: FilterCategory[]
  products: Product[]
  activeCategories: Set<string>
  activeBrands: Set<string>
  onToggleCategory: (key: string) => void
  onToggleBrand: (brand: string) => void
}

function normalizeModel(model: string) {
  return model.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

export default function CatalogFilter({
  categories,
  products,
  activeCategories,
  activeBrands,
  onToggleCategory,
  onToggleBrand,
}: CatalogFilterProps) {
  const categoryCountMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const product of products) {
      const norm = normalizeModel(product.model)
      for (const cat of categories) {
        if (cat.matcher.test(norm)) {
          map.set(cat.key, (map.get(cat.key) || 0) + 1)
          break
        }
      }
    }
    return map
  }, [products, categories])

  const categoryFilteredProducts = useMemo(() => {
    if (activeCategories.size === 0) return products
    const activeCats = categories.filter((c) => activeCategories.has(c.key))
    return products.filter((p) => {
      const norm = normalizeModel(p.model)
      return activeCats.some((cat) => cat.matcher.test(norm))
    })
  }, [products, activeCategories, categories])

  const brands = useMemo(() => {
    const countMap = new Map<string, number>()
    for (const product of categoryFilteredProducts) {
      const brand = extractBrand(product.model)
      countMap.set(brand, (countMap.get(brand) || 0) + 1)
    }
    return Array.from(countMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))
  }, [categoryFilteredProducts])

  const liveCategories = categories.filter((c) => (categoryCountMap.get(c.key) || 0) > 0)

  if (liveCategories.length <= 1 && brands.length <= 1) return null

  return (
    <div className="space-y-3">
      {liveCategories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {liveCategories.map((cat) => {
            const active = activeCategories.has(cat.key)
            const count = categoryCountMap.get(cat.key) || 0
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => onToggleCategory(cat.key)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-brandBorder bg-white text-slate-600 hover:border-slate-400'
                }`}
              >
                {cat.shortTitle}
                <span className={`ml-1.5 text-xs ${active ? 'text-white/70' : 'text-slate-400'}`}>{count}</span>
              </button>
            )
          })}
        </div>
      )}

      {activeCategories.size > 0 && brands.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {brands.map(({ name, count }) => {
            const active = activeBrands.has(name)
            return (
              <button
                key={name}
                type="button"
                onClick={() => onToggleBrand(name)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? 'border-primary bg-primary text-white'
                    : 'border-brandBorder bg-white text-slate-600 hover:border-slate-400'
                }`}
              >
                {name}
                <span className={`ml-1.5 text-xs ${active ? 'text-white/70' : 'text-slate-400'}`}>{count}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
