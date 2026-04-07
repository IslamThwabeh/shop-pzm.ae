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
    description: 'Used iPhones, Samsung devices, Pixels, Honors, and other phones.',
    examples: ['Used iPhones', 'Samsung Galaxy', 'Google Pixel', 'Honor phones', 'Premium Android phones'],
    accentClassName: 'from-emerald-100 via-green-50 to-white',
    matcher: /(iphone|galaxy|samsung|pixel|android|phone|mobile|honor|redmi|tecno|nokia)/i,
  },
  {
    key: 'used-laptops',
    title: 'Used Laptops and MacBooks',
    shortTitle: 'Used Laptops',
    description: 'Used MacBooks, Windows laptops, and refurbished computers.',
    examples: ['MacBook Air and Pro', 'Dell Latitude', 'HP EliteBook', 'Lenovo ThinkPad', 'Lenovo ThinkBook'],
    accentClassName: 'from-sky-100 via-cyan-50 to-white',
    matcher: /(macbook|laptop|notebook|dell|hp|lenovo|asus|acer|latitude|elitebook|thinkpad|thinkbook|xps|inspiron|spectre|envy|probook|vivobook|zenbook|ultra)/i,
  },
  {
    key: 'used-tablets',
    title: 'Used Tablets and iPads',
    shortTitle: 'Used Tablets',
    description: 'Used iPads, Galaxy Tabs, MatePads, and other tablets.',
    examples: ['iPad models', 'Galaxy Tab', 'Surface tablets', 'Huawei MatePad', 'Android tablets'],
    accentClassName: 'from-amber-100 via-yellow-50 to-white',
    matcher: /(ipad|tablet|galaxy tab|surface|matepad|\btab\b)/i,
  },
  {
    key: 'used-gaming',
    title: 'Used Gaming Devices',
    shortTitle: 'Used Gaming',
    description: 'Used consoles, gaming PCs, monitors, and gaming hardware.',
    examples: ['PlayStation', 'Xbox', 'Nintendo Switch', 'Gaming laptops', 'Gaming monitors'],
    accentClassName: 'from-violet-100 via-purple-50 to-white',
    matcher: /(playstation|ps5|ps4|xbox|nintendo|switch|gaming|rog|alienware|console|desktop|monitor|ultragear|swift|viewfinity|rtx|gtx|aorus)/i,
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

export function getSecondhandProducts(products: Product[]) {
  return dedupeProducts(
    products.filter((product) => product.condition === 'used')
  ).sort(sortProducts)
}

export function getSecondhandCategoryGroups(products: Product[]) {
  const liveSecondhandProducts = getSecondhandProducts(products)

  return secondhandCategories.map((category) => ({
    category,
    products: liveSecondhandProducts.filter((product) => category.matcher.test(normalizeModel(product.model))),
  }))
}