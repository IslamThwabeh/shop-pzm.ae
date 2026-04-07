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
  }
}

export function sanitizeProductsForDisplay<T extends Product>(products: T[]) {
  return products.map((product) => sanitizeProductForDisplay(product))
}