import type { Product } from '@shared/types'
import { buildApiUrl } from '../utils/siteConfig'

const generatedServiceMedia = (path: string) => buildApiUrl(`/media/generated/services/${path}`)

export interface BrandNewCategory {
  key: 'phones-tablets' | 'laptops-computers' | 'gaming-systems' | 'professional-equipment'
  title: string
  shortTitle: string
  description: string
  examples: string[]
  accentClassName: string
  matcher: RegExp
}

export const brandNewHero = {
  imageUrl: generatedServiceMedia('brand-new/brand-new-service.jpg'),
  imageAlt: 'Brand new devices at PZM',
}

export const brandNewCategories: BrandNewCategory[] = [
  {
    key: 'phones-tablets',
    title: 'Phones, Tablets, and Wearables',
    shortTitle: 'Phones & Tablets',
    description: 'iPhones, Samsung devices, iPads, Pixels, and wearables.',
    examples: ['iPhone models', 'Samsung Galaxy', 'Google Pixel', 'iPads and tablets', 'Smartwatches'],
    accentClassName: 'from-sky-100 via-cyan-50 to-white',
    matcher: /(iphone|ipad|tablet|galaxy|samsung|pixel|watch|wearable|phone|mobile)/i,
  },
  {
    key: 'laptops-computers',
    title: 'Laptops and Computers',
    shortTitle: 'Laptops',
    description: 'MacBooks, Windows laptops, and everyday computers.',
    examples: ['MacBook Air and Pro', 'Dell XPS and Inspiron', 'HP Spectre and Envy', 'Lenovo ThinkPad and Yoga', 'Gaming laptops'],
    accentClassName: 'from-emerald-100 via-green-50 to-white',
    matcher: /(macbook|laptop|notebook|dell|hp|lenovo|asus|acer|xps|inspiron|spectre|envy|thinkpad|yoga|vivobook|zenbook)/i,
  },
  {
    key: 'gaming-systems',
    title: 'Gaming Systems',
    shortTitle: 'Gaming',
    description: 'Consoles, gaming laptops, VR, and gaming hardware.',
    examples: ['Custom gaming PCs', 'Gaming laptops', 'Latest consoles', 'VR headsets', 'Gaming accessories'],
    accentClassName: 'from-violet-100 via-purple-50 to-white',
    matcher: /(playstation|ps5|ps4|xbox|nintendo|switch|gaming|rog|alienware|vr|console)/i,
  },
  {
    key: 'professional-equipment',
    title: 'Professional Equipment',
    shortTitle: 'Workstations',
    description: 'Workstations, monitors, business devices, and office hardware.',
    examples: ['Workstation laptops', 'Professional desktops', 'Business tablets', 'Network equipment', 'Office setups'],
    accentClassName: 'from-amber-100 via-yellow-50 to-white',
    matcher: /(workstation|desktop|monitor|business|network|router|server|surface|precision|elitebook|probook)/i,
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

export function getBrandNewProducts(products: Product[]) {
  return dedupeProducts(
    products.filter((product) => product.condition === 'new')
  ).sort(sortProducts)
}

export function getBrandNewCategoryGroups(products: Product[]) {
  const liveBrandNewProducts = getBrandNewProducts(products)
  const groupedProducts = brandNewCategories.map((category) => ({
    category,
    products: [] as Product[],
  }))

  for (const product of liveBrandNewProducts) {
    const normalizedModel = normalizeModel(product.model)
    const targetGroup = groupedProducts.find((group) => group.category.matcher.test(normalizedModel))

    if (targetGroup) {
      targetGroup.products.push(product)
    }
  }

  return groupedProducts.map((group) => ({
    ...group,
    products: group.products.sort(sortProducts),
  }))
}