import type { Product } from '@shared/types'
import { buildApiUrl } from '../utils/siteConfig'

const legacyBuyIphoneMedia = (filename: string) => buildApiUrl(`/media/legacy/buy_iphone/${filename}`)

export interface BuyIphoneFamily {
  key: 'iphone-17-pro-max' | 'iphone-17-pro' | 'iphone-17-air' | 'iphone-17'
  title: string
  shortTitle: string
  description: string
  imageUrl: string
  imageAlt: string
  matcher: RegExp
}

export const buyIphoneFamilies: BuyIphoneFamily[] = [
  {
    key: 'iphone-17-pro-max',
    title: 'iPhone 17 Pro Max',
    shortTitle: 'Pro Max',
    description: 'Flagship storage, premium colors, and the highest-intent purchase traffic on the site.',
    imageUrl: legacyBuyIphoneMedia('iPhone_17_Pro_Max_all_colors.jpg'),
    imageAlt: 'iPhone 17 Pro Max color lineup',
    matcher: /\biphone\s*17\s*pro\s*max\b/i,
  },
  {
    key: 'iphone-17-pro',
    title: 'iPhone 17 Pro',
    shortTitle: 'Pro',
    description: 'Professional iPhone configurations for buyers who want flagship power without the Pro Max size.',
    imageUrl: legacyBuyIphoneMedia('iPhone_17_Pro_all_colors.jpg'),
    imageAlt: 'iPhone 17 Pro color lineup',
    matcher: /\biphone\s*17\s*pro\b(?!\s*max)/i,
  },
  {
    key: 'iphone-17-air',
    title: 'iPhone 17 Air',
    shortTitle: 'Air',
    description: 'Thin-and-light iPhone demand with the same on-site checkout and availability flow.',
    imageUrl: legacyBuyIphoneMedia('iPhone_17_Air_all_colors.jpg'),
    imageAlt: 'iPhone 17 Air color lineup',
    matcher: /\biphone\s*17\s*air\b/i,
  },
  {
    key: 'iphone-17',
    title: 'iPhone 17',
    shortTitle: 'Standard',
    description: 'Entry flagship configurations for buyers who want the current generation without the Pro tier.',
    imageUrl: legacyBuyIphoneMedia('iPhone_17_all_colors.jpg'),
    imageAlt: 'iPhone 17 color lineup',
    matcher: /\biphone\s*17\b(?!\s*pro\b)(?!\s*air\b)/i,
  },
]

function normalizeModel(model: string) {
  return model.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function getProductDeduplicationKey(product: Product) {
  return [product.model, product.storage, product.color, product.condition]
    .map((value) => normalizeModel(value || ''))
    .join('|')
}

function getProductTimestamp(product: Product) {
  return Date.parse(product.updated_at || product.updatedAt || product.created_at || product.createdAt || '') || 0
}

function sortProducts(left: Product, right: Product) {
  if (left.price !== right.price) {
    return left.price - right.price
  }

  return left.model.localeCompare(right.model)
}

function dedupeProducts(products: Product[]) {
  const uniqueProducts = new Map<string, Product>()

  for (const product of products) {
    const key = getProductDeduplicationKey(product)
    const existing = uniqueProducts.get(key)

    if (!existing) {
      uniqueProducts.set(key, product)
      continue
    }

    const existingTimestamp = getProductTimestamp(existing)
    const nextTimestamp = getProductTimestamp(product)
    const keepNext =
      (product.quantity ?? 0) > (existing.quantity ?? 0) ||
      ((product.quantity ?? 0) === (existing.quantity ?? 0) && nextTimestamp >= existingTimestamp)

    if (keepNext) {
      uniqueProducts.set(key, product)
    }
  }

  return Array.from(uniqueProducts.values())
}

export function getBuyIphoneProducts(products: Product[]) {
  return dedupeProducts(
    products.filter((product) => normalizeModel(product.model).includes('iphone'))
  )
    .sort(sortProducts)
}

export function getBuyIphoneFamilyGroups(products: Product[]) {
  const liveIphoneProducts = getBuyIphoneProducts(products).filter((product) => (product.quantity ?? 0) > 0)

  return buyIphoneFamilies.map((family) => ({
    family,
    products: liveIphoneProducts.filter((product) => family.matcher.test(normalizeModel(product.model))),
  }))
}