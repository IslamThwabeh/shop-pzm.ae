import type { Product } from '@shared/types'
import { groupProductsByModelFamily, sanitizeProductDescription } from './productPresentation'

const MIN_FEATURED_DESCRIPTION_LENGTH = 90

interface SelectFeaturedProductsOptions {
  condition?: Product['condition']
  limit?: number
}

export function isQualityFeaturedProduct(product: Pick<Product, 'description' | 'quantity'>) {
  const description = sanitizeProductDescription(product.description) ?? ''
  return (product.quantity ?? 0) > 0 && description.length >= MIN_FEATURED_DESCRIPTION_LENGTH
}

export function selectFeaturedProducts(products: Product[], options: SelectFeaturedProductsOptions = {}) {
  const { condition, limit = 6 } = options
  const visibleProducts = products.filter((product) => {
    if (condition && product.condition !== condition) {
      return false
    }

    return isQualityFeaturedProduct(product)
  })

  return groupProductsByModelFamily(visibleProducts)
    .map((family) => [...family.products].sort((left, right) => left.price - right.price)[0])
    .slice(0, limit)
}

export function selectHomepageFeaturedProducts(products: Product[], perCondition = 3) {
  const featuredProducts = [
    ...selectFeaturedProducts(products, { condition: 'new', limit: perCondition }),
    ...selectFeaturedProducts(products, { condition: 'used', limit: perCondition }),
  ]
  const targetCount = perCondition * 2

  if (featuredProducts.length >= targetCount) {
    return featuredProducts.slice(0, targetCount)
  }

  const usedIds = new Set(featuredProducts.map((product) => product.id))
  const remainingProducts = selectFeaturedProducts(products, { limit: targetCount * 2 }).filter(
    (product) => !usedIds.has(product.id),
  )

  return [...featuredProducts, ...remainingProducts].slice(0, targetCount)
}