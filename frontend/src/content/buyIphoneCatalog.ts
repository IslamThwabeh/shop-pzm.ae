import type { Product } from '@shared/types'
import { buildApiUrl } from '../utils/siteConfig'

const generatedBuyIphoneFamilyMedia = (filename: string) => buildApiUrl(`/media/generated/buy-iphone/${filename}`)

export interface BuyIphoneFamily {
  key: 'iphone-17-pro-max' | 'iphone-17-pro' | 'iphone-17-air' | 'iphone-17' | 'iphone-16' | 'iphone-15'
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
    description: 'Flagship size, colors, and top-tier iPhone options.',
    imageUrl: generatedBuyIphoneFamilyMedia('iphone-17-pro-max-family.webp'),
    imageAlt: 'iPhone 17 Pro Max color lineup',
    matcher: /\biphone\s*17\s*pro\s*max\b/i,
  },
  {
    key: 'iphone-17-pro',
    title: 'iPhone 17 Pro',
    shortTitle: 'Pro',
    description: 'Flagship performance in the smaller Pro size.',
    imageUrl: generatedBuyIphoneFamilyMedia('iphone-17-pro-family.webp'),
    imageAlt: 'iPhone 17 Pro color lineup',
    matcher: /\biphone\s*17\s*pro\b(?!\s*max)/i,
  },
  {
    key: 'iphone-17-air',
    title: 'iPhone 17 Air',
    shortTitle: 'Air',
    description: 'Thin-and-light iPhone options in the Air line.',
    imageUrl: generatedBuyIphoneFamilyMedia('iphone-17-air-family.webp'),
    imageAlt: 'iPhone 17 Air color lineup',
    matcher: /\biphone\s*17\s*air\b/i,
  },
  {
    key: 'iphone-17',
    title: 'iPhone 17',
    shortTitle: 'Standard',
    description: 'Current-generation iPhone options outside the Pro tier.',
    imageUrl: generatedBuyIphoneFamilyMedia('iphone-17-family.webp'),
    imageAlt: 'iPhone 17 color lineup',
    matcher: /\biphone\s*17\b(?!\s*pro\b)(?!\s*air\b)/i,
  },
  {
    key: 'iphone-16',
    title: 'iPhone 16',
    shortTitle: '16',
    description: 'Strong-value current iPhone options with practical everyday specs.',
    imageUrl: generatedBuyIphoneFamilyMedia('iphone-16-family-primary.webp'),
    imageAlt: 'iPhone 16 color lineup',
    matcher: /\biphone\s*16\b(?!\s*pro\b)(?!\s*plus\b)/i,
  },
  {
    key: 'iphone-15',
    title: 'iPhone 15',
    shortTitle: '15',
    description: 'Apple value picks for buyers who want a lower entry price without going old.',
    imageUrl: generatedBuyIphoneFamilyMedia('iphone-15-family-primary.webp'),
    imageAlt: 'iPhone 15 color lineup',
    matcher: /\biphone\s*15\b(?!\s*pro\b)(?!\s*plus\b)/i,
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
    const keepNext = nextTimestamp >= existingTimestamp

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
  const liveIphoneProducts = getBuyIphoneProducts(products)

  return buyIphoneFamilies.map((family) => ({
    family,
    products: liveIphoneProducts.filter((product) => family.matcher.test(normalizeModel(product.model))),
  }))
}