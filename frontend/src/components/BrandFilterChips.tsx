import { useMemo } from 'react'
import type { Product } from '@shared/types'
import { extractBrand } from '../utils/productPresentation'

interface BrandFilterChipsProps {
  products: Product[]
  activeBrands: Set<string>
  onToggle: (brand: string) => void
}

export default function BrandFilterChips({ products, activeBrands, onToggle }: BrandFilterChipsProps) {
  const brands = useMemo(() => {
    const countMap = new Map<string, number>()
    for (const product of products) {
      const brand = extractBrand(product.model)
      countMap.set(brand, (countMap.get(brand) || 0) + 1)
    }
    return Array.from(countMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))
  }, [products])

  if (brands.length <= 1) return null

  return (
    <div className="flex flex-wrap gap-2">
      {brands.map(({ name, count }) => {
        const active = activeBrands.has(name)
        return (
          <button
            key={name}
            type="button"
            onClick={() => onToggle(name)}
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
  )
}
