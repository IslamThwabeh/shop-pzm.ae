import type { Product } from '@shared/types'
import deviceFinderConfigSource from '../content/deviceFinderDestinations.json'
import { resolveProductBrand } from './productPresentation'

export type DeviceFinderCondition = 'brand-new' | 'pre-owned'
export type DeviceFinderKey = 'iphone' | 'macbook' | 'ipad' | 'samsung' | 'gaming' | 'all'

export interface DeviceFinderOption {
  key: DeviceFinderKey
  label: string
}

interface DeviceFinderConfigEntry extends DeviceFinderOption {
  snapshotDescription: string
  destinations: Record<DeviceFinderCondition, string>
}

function buildFinderText(product: Product) {
  return [product.model, product.product_type, resolveProductBrand(product)]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

const deviceFinderConfig = (deviceFinderConfigSource as DeviceFinderConfigEntry[]).reduce<Record<DeviceFinderKey, DeviceFinderConfigEntry>>(
  (config, entry) => {
    config[entry.key] = entry
    return config
  },
  {} as Record<DeviceFinderKey, DeviceFinderConfigEntry>,
)

const deviceFinderMatchers: Record<DeviceFinderKey, ((product: Product) => boolean) | undefined> = {
  iphone: (product) => /\biphone\b/i.test(buildFinderText(product)),
  macbook: (product) => /\bmacbook\b/i.test(buildFinderText(product)),
  ipad: (product) => /\bipad\b/i.test(buildFinderText(product)),
  samsung: (product) => /(\bsamsung\b|\bgalaxy\b)/i.test(buildFinderText(product)),
  gaming: (product) => /(playstation|ps5|ps4|xbox|nintendo|switch|gaming|rog|alienware|console|ultragear|aorus|rtx|gtx)/i.test(buildFinderText(product)),
  all: undefined,
}

export const deviceFinderOptions: DeviceFinderOption[] = (deviceFinderConfigSource as DeviceFinderConfigEntry[]).map(({ key, label }) => ({
  key,
  label,
}))

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

  const normalized = value.trim().toLowerCase() as DeviceFinderKey
  return deviceFinderConfig[normalized] ? normalized : null
}

export function matchesDeviceFinderProduct(product: Product, key: DeviceFinderKey) {
  if (key === 'all') {
    return true
  }

  return deviceFinderMatchers[key]?.(product) ?? true
}