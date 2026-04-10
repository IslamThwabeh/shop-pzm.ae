import type { Product } from '@shared/types'

const colorReplacements = new Map<string, string>([
  ['latest stock', 'Contact us'],
  ['mixed stock', 'Various options'],
  ['contact for color', 'Color options'],
])

const descriptionReplacements: Array<[RegExp, string]> = [
  [/contact us for the exact edition in stock\.?/gi, 'Contact us for the exact edition.'],
  [/contact us for the latest stock details\.?/gi, 'Contact us for the latest details.'],
  [/contact us for the latest color availability\.?/gi, 'Contact us for color options.'],
  [/\s+and multiple units available\.?/gi, '.'],
  [/\s+with multiple units available\.?/gi, '.'],
]

function cleanText(value: string) {
  return value
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+\./g, '.')
    .replace(/\s+,/g, ',')
    .replace(/\.\s*\./g, '.')
    .trim()
}

function sanitizeOptionalText(value?: string | null) {
  const normalized = cleanText(String(value || ''))
  return normalized || undefined
}

const placeholderColors = new Set(['contact us', 'color options', 'various options'])

export function isPlaceholderColor(color: string) {
  return placeholderColors.has(color.toLowerCase())
}

export function sanitizeProductColor(color?: string) {
  const trimmedColor = (color || '').trim()
  if (!trimmedColor) {
    return trimmedColor
  }

  return colorReplacements.get(trimmedColor.toLowerCase()) || trimmedColor
}

export function sanitizeProductDescription(description?: string) {
  if (!description) {
    return description
  }

  let sanitizedDescription = description.trim()

  for (const [pattern, replacement] of descriptionReplacements) {
    sanitizedDescription = sanitizedDescription.replace(pattern, replacement)
  }

  sanitizedDescription = cleanText(sanitizedDescription)

  return sanitizedDescription || undefined
}

export function buildProductDisplayLabel(product: Pick<Product, 'model' | 'storage' | 'color'>) {
  const color = sanitizeProductColor(product.color)
  const segments = [sanitizeOptionalText(product.model), sanitizeOptionalText(product.storage)]

  if (color && !isPlaceholderColor(color)) {
    segments.push(color)
  }

  return cleanText(segments.filter(Boolean).join(' ')) || product.model.trim()
}

export function getPrimaryProductImage(product?: Pick<Product, 'image_url' | 'images'> | null) {
  if (!product) {
    return undefined
  }

  const candidates = [...(product.images || []), product.image_url]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim()
    }
  }

  return undefined
}

export function sanitizeProductForDisplay<T extends Product>(product: T): T {
  return {
    ...product,
    color: sanitizeProductColor(product.color),
    description: sanitizeProductDescription(product.description),
    brand: sanitizeOptionalText(product.brand),
    product_type: sanitizeOptionalText(product.product_type),
    google_product_category: sanitizeOptionalText(product.google_product_category),
    gtin: sanitizeOptionalText(product.gtin),
    mpn: sanitizeOptionalText(product.mpn),
    item_group_id: sanitizeOptionalText(product.item_group_id),
    warranty: sanitizeOptionalText(product.warranty),
    accessories_included: sanitizeOptionalText(product.accessories_included),
    cosmetic_grade: sanitizeOptionalText(product.cosmetic_grade),
    repair_history: sanitizeOptionalText(product.repair_history),
  }
}

export function sanitizeProductsForDisplay<T extends Product>(products: T[]) {
  return products.map((product) => sanitizeProductForDisplay(product))
}

/* ------------------------------------------------------------------ */
/*  Brand extraction                                                  */
/* ------------------------------------------------------------------ */

const brandPatterns: [RegExp, string][] = [
  [/^iphone|^ipad/i, 'Apple'],
  [/^macbook/i, 'Apple'],
  [/^samsung|^galaxy/i, 'Samsung'],
  [/^honor/i, 'Honor'],
  [/^nokia/i, 'Nokia'],
  [/^tecno/i, 'Tecno'],
  [/^playstation|^ps[45]/i, 'PlayStation'],
  [/^xbox/i, 'Xbox'],
  [/^nintendo/i, 'Nintendo'],
  [/^hp\b/i, 'HP'],
  [/^lenovo/i, 'Lenovo'],
  [/^dell/i, 'Dell'],
  [/^alienware/i, 'Alienware'],
  [/^asus|^rog\b/i, 'ASUS'],
  [/^aorus/i, 'AORUS'],
  [/^microsoft|^surface/i, 'Microsoft'],
  [/^huawei|^matepad/i, 'Huawei'],
  [/^redmi|^xiaomi/i, 'Xiaomi'],
  [/^lg\b/i, 'LG'],
  [/^gaming pc/i, 'Gaming PC'],
]

export function extractBrand(model: string): string {
  const trimmed = model.trim()
  for (const [pattern, brand] of brandPatterns) {
    if (pattern.test(trimmed)) return brand
  }
  return 'Other'
}

export function getKnownProductBrand(product: Pick<Product, 'brand' | 'model'>) {
  const explicitBrand = sanitizeOptionalText(product.brand)
  if (explicitBrand) {
    return explicitBrand
  }

  const inferredBrand = extractBrand(product.model)
  return inferredBrand === 'Other' ? undefined : inferredBrand
}

export function resolveProductBrand(product: Pick<Product, 'brand' | 'model'>) {
  return getKnownProductBrand(product) || 'Other'
}

export function getProductDetailRows(product: Product) {
  const brand = getKnownProductBrand(product)

  return [
    brand && { label: 'Brand', value: brand },
    sanitizeOptionalText(product.storage) && { label: 'Storage', value: product.storage.trim() },
    product.color && !isPlaceholderColor(product.color) && { label: 'Color', value: product.color },
    product.release_year && { label: 'Release year', value: String(product.release_year) },
    product.battery_health != null && { label: 'Battery health', value: `${product.battery_health}%` },
    sanitizeOptionalText(product.cosmetic_grade) && { label: 'Cosmetic grade', value: product.cosmetic_grade!.trim() },
    sanitizeOptionalText(product.repair_history) && { label: 'Repair history', value: product.repair_history!.trim() },
    sanitizeOptionalText(product.accessories_included) && { label: 'Included', value: product.accessories_included!.trim() },
    sanitizeOptionalText(product.warranty) && { label: 'Warranty', value: product.warranty!.trim() },
  ].filter(Boolean) as { label: string; value: string }[]
}

/* ------------------------------------------------------------------ */
/*  Variant grouping – collapse color × storage combos into one card  */
/* ------------------------------------------------------------------ */

export interface VariantGroup {
  colors: string[]
  storages: string[]
  lowestPrice: number
  /** Return the cheapest product for a given (color, storage) pair, or undefined if that combo doesn't exist. */
  getProduct: (color: string, storage: string) => Product | undefined
  /** All products in this group, sorted by price ascending. */
  products: Product[]
}

export function groupVariantsByColorAndStorage(products: Product[]): VariantGroup {
  const colorSet = new Set<string>()
  const storageSet = new Set<string>()
  const map = new Map<string, Product>()

  const sorted = [...products].sort((a, b) => a.price - b.price)

  for (const p of sorted) {
    const c = (p.color || '').trim()
    const s = (p.storage || '').trim()
    if (c) colorSet.add(c)
    if (s) storageSet.add(s)

    const key = `${c}|||${s}`
    if (!map.has(key)) {
      map.set(key, p)
    }
  }

  return {
    colors: Array.from(colorSet),
    storages: Array.from(storageSet),
    lowestPrice: sorted.length > 0 ? sorted[0].price : 0,
    getProduct: (color, storage) => map.get(`${color}|||${storage}`),
    products: sorted,
  }
}

/* ------------------------------------------------------------------ */
/*  Model-family grouping – collapse products sharing a base model    */
/* ------------------------------------------------------------------ */

/** Common storage tokens to strip when deriving the base model name. */
const storageSuffixPattern = /\s*\b(\d+\s*(gb|tb))\b\s*/gi

/**
 * Derive a "base model" key from a product's model string by stripping
 * known storage suffixes so that e.g. "MacBook Air M3 256GB" and
 * "MacBook Air M3 512GB" both resolve to "MacBook Air M3".
 */
function getBaseModelKey(model: string): string {
  return model
    .replace(storageSuffixPattern, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export interface ModelFamily {
  /** Display title (the cleaned base-model name). */
  title: string
  /** All products belonging to this model family. */
  products: Product[]
}

/**
 * Group an array of products by base model name.
 * Returns one `ModelFamily` per distinct base model, sorted by lowest price.
 */
export function groupProductsByModelFamily(products: Product[]): ModelFamily[] {
  const familyMap = new Map<string, { title: string; products: Product[] }>()

  for (const product of products) {
    const key = getBaseModelKey(product.model).toLowerCase()

    if (!familyMap.has(key)) {
      familyMap.set(key, { title: getBaseModelKey(product.model), products: [] })
    }

    familyMap.get(key)!.products.push(product)
  }

  return Array.from(familyMap.values()).sort((a, b) => {
    const aMin = Math.min(...a.products.map((p) => p.price))
    const bMin = Math.min(...b.products.map((p) => p.price))
    return aMin - bMin
  })
}