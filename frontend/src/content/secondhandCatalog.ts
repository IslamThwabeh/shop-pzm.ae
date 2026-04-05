import type { Product } from '@shared/types'

export interface SecondhandCategory {
  key: 'used-phones' | 'used-laptops' | 'used-tablets' | 'used-gaming'
  title: string
  shortTitle: string
  description: string
  examples: string[]
  accentClassName: string
  matcher: RegExp
}

export const secondhandHero = {
  imageUrl: '/images/Catigories/Used_Phones.jpg',
  imageAlt: 'Certified pre-owned devices at PZM',
}

export const secondhandCategories: SecondhandCategory[] = [
  {
    key: 'used-phones',
    title: 'Used Phones and iPhones',
    shortTitle: 'Used Phones',
    description: 'The most common used-device requests start here: iPhones, Galaxy models, Pixel phones, and other premium smartphones with clear condition details before purchase.',
    examples: ['Used iPhones', 'Samsung Galaxy', 'Google Pixel', 'Premium Android phones'],
    accentClassName: 'from-emerald-100 via-green-50 to-white',
    matcher: /(iphone|galaxy|samsung|pixel|android|phone|mobile)/i,
  },
  {
    key: 'used-laptops',
    title: 'Used Laptops and MacBooks',
    shortTitle: 'Used Laptops',
    description: 'A request-first lane for MacBooks, Windows laptops, and refurbished computing hardware when buyers want battery, condition, and specification checks first.',
    examples: ['MacBook Air and Pro', 'Dell Latitude', 'HP EliteBook', 'Lenovo ThinkPad'],
    accentClassName: 'from-sky-100 via-cyan-50 to-white',
    matcher: /(macbook|laptop|notebook|dell|hp|lenovo|asus|acer|latitude|elitebook|thinkpad|xps|inspiron|spectre|envy|probook)/i,
  },
  {
    key: 'used-tablets',
    title: 'Used Tablets and iPads',
    shortTitle: 'Used Tablets',
    description: 'For buyers comparing iPads, Galaxy Tab models, and other tablets with storage, battery, and cosmetic guidance before they commit.',
    examples: ['iPad models', 'Galaxy Tab', 'Surface tablets', 'Android tablets'],
    accentClassName: 'from-amber-100 via-yellow-50 to-white',
    matcher: /(ipad|tablet|galaxy tab|surface)/i,
  },
  {
    key: 'used-gaming',
    title: 'Used Gaming Devices',
    shortTitle: 'Used Gaming',
    description: 'A used-device route for consoles, gaming laptops, and gaming gear when shoppers want quick confirmation before they visit the store.',
    examples: ['PlayStation', 'Xbox', 'Nintendo Switch', 'Gaming laptops'],
    accentClassName: 'from-violet-100 via-purple-50 to-white',
    matcher: /(playstation|ps5|ps4|xbox|nintendo|switch|gaming|rog|alienware|console)/i,
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

export function getSecondhandProducts(products: Product[]) {
  return dedupeProducts(
    products.filter((product) => product.condition === 'used')
  ).sort(sortProducts)
}

export function getSecondhandCategoryGroups(products: Product[]) {
  const liveSecondhandProducts = getSecondhandProducts(products).filter((product) => (product.quantity ?? 0) > 0)

  return secondhandCategories.map((category) => ({
    category,
    products: liveSecondhandProducts.filter((product) => category.matcher.test(normalizeModel(product.model))),
  }))
}