import type { Product } from '@shared/types'
import { buildApiUrl } from '../utils/siteConfig'
import { getPrimaryProductImage } from '../utils/productPresentation'

const generatedBuyIphoneFamilyMedia = (filename: string) => buildApiUrl(`/media/generated/buy-iphone/${filename}`)

export interface BuyIphoneFamily {
  key: 'iphone-17-pro-max' | 'iphone-17-pro' | 'iphone-17-air' | 'iphone-17' | 'iphone-16'
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
]

interface BuyIphoneImageUnificationRule {
  familyKey: BuyIphoneFamily['key']
  color: string
  preferStorages: string[]
}

const buyIphoneImageUnificationRules: BuyIphoneImageUnificationRule[] = [
  {
    familyKey: 'iphone-17-pro-max',
    color: 'deep blue',
    preferStorages: ['1TB', '256GB'],
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

function getStorageMagnitude(storage?: string) {
  const match = (storage || '').trim().match(/^(\d+)\s*(GB|TB)$/i)

  if (!match) {
    return Number.MIN_SAFE_INTEGER
  }

  const amount = Number.parseInt(match[1], 10)
  return match[2].toUpperCase() === 'TB' ? amount * 1024 : amount
}

function getFamilyForProduct(product: Product) {
  const normalizedModel = normalizeModel(product.model)
  return buyIphoneFamilies.find((family) => family.matcher.test(normalizedModel))
}

function pickUnifiedImageSource(products: Product[], rule: BuyIphoneImageUnificationRule) {
  const withImage = products.filter((product) => getPrimaryProductImage(product))

  for (const preferredStorage of rule.preferStorages) {
    const normalizedStorage = normalizeModel(preferredStorage)
    const preferredNew = withImage.find(
      (product) => product.condition === 'new' && normalizeModel(product.storage || '') === normalizedStorage,
    )

    if (preferredNew) {
      return preferredNew
    }

    const preferredAnyCondition = withImage.find(
      (product) => normalizeModel(product.storage || '') === normalizedStorage,
    )

    if (preferredAnyCondition) {
      return preferredAnyCondition
    }
  }

  return [...withImage].sort((left, right) => {
    if (left.condition !== right.condition) {
      return left.condition === 'new' ? -1 : 1
    }

    return getStorageMagnitude(right.storage) - getStorageMagnitude(left.storage)
  })[0]
}

function unifyBuyIphoneVariantImages(products: Product[]) {
  if (products.length === 0) {
    return products
  }

  const unifiedImages = new Map<string, { imageUrl: string; images: string[] }>()

  for (const rule of buyIphoneImageUnificationRules) {
    const matchingProducts = products.filter((product) => {
      const family = getFamilyForProduct(product)

      return family?.key === rule.familyKey && normalizeModel(product.color || '') === rule.color
    })

    const imageSource = pickUnifiedImageSource(matchingProducts, rule)
    const imageUrl = getPrimaryProductImage(imageSource)

    if (!imageSource || !imageUrl) {
      continue
    }

    const sourceImages = imageSource.images?.filter((image) => typeof image === 'string' && image.trim()) || []
    const normalizedImages = sourceImages.length > 0 ? sourceImages : [imageUrl]
    unifiedImages.set(`${rule.familyKey}|${rule.color}`, { imageUrl, images: normalizedImages })
  }

  if (unifiedImages.size === 0) {
    return products
  }

  return products.map((product) => {
    const family = getFamilyForProduct(product)
    const imageOverride = family ? unifiedImages.get(`${family.key}|${normalizeModel(product.color || '')}`) : undefined

    if (!imageOverride) {
      return product
    }

    return {
      ...product,
      image_url: imageOverride.imageUrl,
      images: imageOverride.images,
    }
  })
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
    unifyBuyIphoneVariantImages(
      products.filter((product) => normalizeModel(product.model).includes('iphone'))
    )
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