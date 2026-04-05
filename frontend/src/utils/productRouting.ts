import type { Product } from '@shared/types'

type ProductBrowseFields = Pick<Product, 'condition' | 'model'>

export function getProductBrowsePath(product: ProductBrowseFields): string {
  if (product.condition === 'used') {
    return '/services/secondhand'
  }

  if (/iphone/i.test(product.model || '')) {
    return '/services/buy-iphone'
  }

  return '/services/brand-new'
}