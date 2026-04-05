import type { Product } from '@shared/types'
import { buildApiUrl } from '../utils/siteConfig'

const legacyBrandNewMedia = (path: string) => buildApiUrl(`/media/legacy/${path}`)

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
  imageUrl: legacyBrandNewMedia('Catigories/brand_new.jpg'),
  imageAlt: 'Brand new devices at PZM',
}

export const brandNewCategories: BrandNewCategory[] = [
  {
    key: 'phones-tablets',
    title: 'Phones, Tablets, and Wearables',
    shortTitle: 'Phones & Tablets',
    description: 'The live brand-new catalog is strongest here today, led by the current iPhone lineup with room for tablets, Galaxy devices, Pixels, and wearables as the catalog expands.',
    examples: ['iPhone models', 'Samsung Galaxy', 'Google Pixel', 'iPads and tablets', 'Smartwatches'],
    accentClassName: 'from-sky-100 via-cyan-50 to-white',
    matcher: /(iphone|ipad|tablet|galaxy|samsung|pixel|watch|wearable|phone|mobile)/i,
  },
  {
    key: 'laptops-computers',
    title: 'Laptops and Computers',
    shortTitle: 'Laptops',
    description: 'A retail lane for MacBooks, Windows laptops, and fresh everyday computing hardware when customers want stock confirmation before they buy.',
    examples: ['MacBook Air and Pro', 'Dell XPS and Inspiron', 'HP Spectre and Envy', 'Lenovo ThinkPad and Yoga', 'Gaming laptops'],
    accentClassName: 'from-emerald-100 via-green-50 to-white',
    matcher: /(macbook|laptop|notebook|dell|hp|lenovo|asus|acer|xps|inspiron|spectre|envy|thinkpad|yoga|vivobook|zenbook)/i,
  },
  {
    key: 'gaming-systems',
    title: 'Gaming Systems',
    shortTitle: 'Gaming',
    description: 'For customers comparing new gaming hardware, consoles, or performance-first laptops before checkout or store pickup.',
    examples: ['Custom gaming PCs', 'Gaming laptops', 'Latest consoles', 'VR headsets', 'Gaming accessories'],
    accentClassName: 'from-violet-100 via-purple-50 to-white',
    matcher: /(playstation|ps5|ps4|xbox|nintendo|switch|gaming|rog|alienware|vr|console)/i,
  },
  {
    key: 'professional-equipment',
    title: 'Professional Equipment',
    shortTitle: 'Workstations',
    description: 'A request-first lane for office, creator, and business hardware when a customer needs a clean stock or pricing confirmation before visiting.',
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
    const keepNext =
      (product.quantity ?? 0) > (existing.quantity ?? 0) ||
      ((product.quantity ?? 0) === (existing.quantity ?? 0) && nextTimestamp >= existingTimestamp)

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
  const liveBrandNewProducts = getBrandNewProducts(products).filter((product) => (product.quantity ?? 0) > 0)
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