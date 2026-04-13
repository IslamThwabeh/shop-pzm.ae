import type { Product } from '@shared/types'
import { resolveProductBrand } from './productPresentation'

export type DeviceFinderCondition = 'brand-new' | 'pre-owned'
export type DeviceFinderKey = 'iphone' | 'macbook' | 'ipad' | 'samsung' | 'gaming' | 'all'

export interface DeviceFinderOption {
  key: DeviceFinderKey
  label: string
}

interface DeviceFinderConfig extends DeviceFinderOption {
  destinations: Record<DeviceFinderCondition, string>
  matcher?: (product: Product) => boolean
}

function buildFinderText(product: Product) {
  return [product.model, product.product_type, resolveProductBrand(product)]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

const deviceFinderConfig: Record<DeviceFinderKey, DeviceFinderConfig> = {
  iphone: {
    key: 'iphone',
    label: 'iPhone',
    destinations: {
      'brand-new': '/services/buy-iphone',
      'pre-owned': '/services/secondhand?category=used-phones&finder=iphone',
    },
    matcher: (product) => /\biphone\b/i.test(buildFinderText(product)),
  },
  macbook: {
    key: 'macbook',
    label: 'MacBook',
    destinations: {
      'brand-new': '/services/brand-new?category=laptops-computers&finder=macbook',
      'pre-owned': '/services/secondhand?category=used-laptops&finder=macbook',
    },
    matcher: (product) => /\bmacbook\b/i.test(buildFinderText(product)),
  },
  ipad: {
    key: 'ipad',
    label: 'iPad',
    destinations: {
      'brand-new': '/services/brand-new?category=phones-tablets&finder=ipad',
      'pre-owned': '/services/secondhand?category=used-tablets&finder=ipad',
    },
    matcher: (product) => /\bipad\b/i.test(buildFinderText(product)),
  },
  samsung: {
    key: 'samsung',
    label: 'Samsung',
    destinations: {
      'brand-new': '/services/brand-new?category=phones-tablets&finder=samsung',
      'pre-owned': '/services/secondhand?category=used-phones&finder=samsung',
    },
    matcher: (product) => /(\bsamsung\b|\bgalaxy\b)/i.test(buildFinderText(product)),
  },
  gaming: {
    key: 'gaming',
    label: 'Gaming',
    destinations: {
      'brand-new': '/services/brand-new?category=gaming-systems&finder=gaming',
      'pre-owned': '/services/secondhand?category=used-gaming&finder=gaming',
    },
    matcher: (product) => /(playstation|ps5|ps4|xbox|nintendo|switch|gaming|rog|alienware|console|ultragear|aorus|rtx|gtx)/i.test(buildFinderText(product)),
  },
  all: {
    key: 'all',
    label: 'All',
    destinations: {
      'brand-new': '/services/brand-new',
      'pre-owned': '/services/secondhand',
    },
  },
}

export const deviceFinderOptions: DeviceFinderOption[] = [
  deviceFinderConfig.iphone,
  deviceFinderConfig.macbook,
  deviceFinderConfig.ipad,
  deviceFinderConfig.samsung,
  deviceFinderConfig.gaming,
  deviceFinderConfig.all,
]

export function getDeviceFinderDestination(condition: DeviceFinderCondition, key: DeviceFinderKey) {
  return deviceFinderConfig[key].destinations[condition]
}

export function getDeviceFinderLabel(key: DeviceFinderKey) {
  return deviceFinderConfig[key].label
}

export function normalizeDeviceFinderKey(value: string | null): DeviceFinderKey | null {
  if (!value) {
    return null
  }

  const normalized = value.trim().toLowerCase()
  return normalized in deviceFinderConfig ? (normalized as DeviceFinderKey) : null
}

export function matchesDeviceFinderProduct(product: Product, key: DeviceFinderKey) {
  if (key === 'all') {
    return true
  }

  return deviceFinderConfig[key].matcher?.(product) ?? true
}