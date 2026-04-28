import type { WhatsAppLeadType } from '@shared/types'

export interface AnalyticsItem {
  id: string
  model: string
  price: number
  quantity: number
  color?: string
  storage?: string
  condition?: string
}

interface WhatsAppLeadTrackingParams {
  leadType?: WhatsAppLeadType | 'generic'
  referenceId?: string
  referenceLabel?: string
  referencePrice?: number
  sourcePage?: string
}

interface PhoneContactParams {
  href: string
  referenceLabel?: string
  sourcePage?: string
}

interface PurchaseTrackingParams {
  orderId: string
  items: AnalyticsItem[]
  totalValue: number
}

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const STORAGE_PREFIX = 'pzm-analytics'
const GOOGLE_ADS_ID = String(import.meta.env.VITE_GOOGLE_ADS_ID || 'AW-16481610525').trim()

const GOOGLE_ADS_LABELS = {
  beginCheckout: String(import.meta.env.VITE_GOOGLE_ADS_BEGIN_CHECKOUT_LABEL || '').trim(),
  purchase: String(import.meta.env.VITE_GOOGLE_ADS_PURCHASE_LABEL || '').trim(),
  phone: String(import.meta.env.VITE_GOOGLE_ADS_PHONE_LABEL || '').trim(),
  whatsappGeneric: String(import.meta.env.VITE_GOOGLE_ADS_WHATSAPP_LABEL || '').trim(),
  whatsappProduct: String(import.meta.env.VITE_GOOGLE_ADS_WHATSAPP_PRODUCT_LABEL || '').trim(),
  whatsappService: String(import.meta.env.VITE_GOOGLE_ADS_WHATSAPP_SERVICE_LABEL || '').trim(),
  whatsappAppointment: String(import.meta.env.VITE_GOOGLE_ADS_WHATSAPP_APPOINTMENT_LABEL || '').trim(),
} as const

function getSourcePage(sourcePage?: string) {
  if (sourcePage) {
    return sourcePage
  }

  if (typeof window === 'undefined') {
    return undefined
  }

  return window.location.pathname
}

function getGtag() {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return null
  }

  return window.gtag
}

function normalizeMoney(value?: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return undefined
  }

  return Number(value.toFixed(2))
}

function mapAnalyticsItem(item: AnalyticsItem) {
  const variant = [item.condition, item.storage, item.color].filter(Boolean).join(' / ')

  return {
    item_id: item.id,
    item_name: item.model,
    price: normalizeMoney(item.price),
    quantity: item.quantity,
    item_variant: variant || undefined,
  }
}

function dispatchEvent(name: string, params: Record<string, unknown>) {
  const gtag = getGtag()
  if (!gtag) {
    return false
  }

  gtag('event', name, params)
  return true
}

function dispatchAdsConversion(label: string | undefined, params: Record<string, unknown>) {
  const gtag = getGtag()
  if (!gtag || !GOOGLE_ADS_ID || !label) {
    return false
  }

  gtag('event', 'conversion', {
    send_to: `${GOOGLE_ADS_ID}/${label}`,
    ...params,
  })

  return true
}

function rememberOnce(key: string) {
  if (typeof window === 'undefined') {
    return true
  }

  const existing = window.sessionStorage.getItem(key)
  if (existing) {
    return false
  }

  window.sessionStorage.setItem(key, new Date().toISOString())
  return true
}

function buildCartSignature(items: AnalyticsItem[]) {
  return items
    .map((item) => `${item.id}:${item.quantity}`)
    .sort()
    .join('|')
}

function getWhatsAppAdsLabel(leadType: WhatsAppLeadTrackingParams['leadType']) {
  switch (leadType) {
    case 'product':
      return GOOGLE_ADS_LABELS.whatsappProduct || GOOGLE_ADS_LABELS.whatsappGeneric
    case 'service':
      return GOOGLE_ADS_LABELS.whatsappService || GOOGLE_ADS_LABELS.whatsappGeneric
    case 'appointment':
      return GOOGLE_ADS_LABELS.whatsappAppointment || GOOGLE_ADS_LABELS.whatsappGeneric
    default:
      return GOOGLE_ADS_LABELS.whatsappGeneric
  }
}

export function isPhoneHref(href: string) {
  return href.startsWith('tel:')
}

export function isWhatsAppHref(href: string) {
  return /^https:\/\/wa\.me\//i.test(href) || /api\.whatsapp\.com/i.test(href)
}

export function trackAddToCart(item: AnalyticsItem) {
  const value = normalizeMoney(item.price * item.quantity)

  dispatchEvent('add_to_cart', {
    currency: 'AED',
    value,
    items: [mapAnalyticsItem(item)],
    source_page: getSourcePage(),
  })
}

export function trackBeginCheckout(items: AnalyticsItem[]) {
  if (items.length === 0) {
    return
  }

  const sessionKey = `${STORAGE_PREFIX}:begin-checkout:${buildCartSignature(items)}`
  if (!rememberOnce(sessionKey)) {
    return
  }

  const value = normalizeMoney(items.reduce((sum, item) => sum + item.price * item.quantity, 0))

  dispatchEvent('begin_checkout', {
    currency: 'AED',
    value,
    items: items.map(mapAnalyticsItem),
    source_page: getSourcePage(),
  })

  dispatchAdsConversion(GOOGLE_ADS_LABELS.beginCheckout, {
    currency: 'AED',
    value,
  })
}

export function trackPurchase({ orderId, items, totalValue }: PurchaseTrackingParams) {
  if (!orderId || items.length === 0) {
    return
  }

  const sessionKey = `${STORAGE_PREFIX}:purchase:${orderId}`
  if (!rememberOnce(sessionKey)) {
    return
  }

  const value = normalizeMoney(totalValue)

  dispatchEvent('purchase', {
    transaction_id: orderId,
    currency: 'AED',
    value,
    items: items.map(mapAnalyticsItem),
    source_page: getSourcePage(),
  })

  dispatchAdsConversion(GOOGLE_ADS_LABELS.purchase, {
    transaction_id: orderId,
    currency: 'AED',
    value,
  })
}

export function trackWhatsAppLead({
  leadType = 'generic',
  referenceId,
  referenceLabel,
  referencePrice,
  sourcePage,
}: WhatsAppLeadTrackingParams) {
  const value = normalizeMoney(referencePrice)

  dispatchEvent('generate_lead', {
    currency: value != null ? 'AED' : undefined,
    value,
    method: 'whatsapp',
    lead_type: leadType,
    reference_id: referenceId,
    reference_label: referenceLabel,
    source_page: getSourcePage(sourcePage),
  })

  dispatchAdsConversion(getWhatsAppAdsLabel(leadType), {
    currency: value != null ? 'AED' : undefined,
    value,
  })
}

export function trackPhoneContact({ href, referenceLabel, sourcePage }: PhoneContactParams) {
  dispatchEvent('contact', {
    method: 'phone',
    phone_href: href,
    reference_label: referenceLabel,
    source_page: getSourcePage(sourcePage),
  })

  dispatchAdsConversion(GOOGLE_ADS_LABELS.phone, {})
}

export function openTrackedPhoneHref({ href, referenceLabel, sourcePage }: PhoneContactParams) {
  trackPhoneContact({ href, referenceLabel, sourcePage })

  if (typeof window === 'undefined') {
    return
  }

  window.setTimeout(() => {
    window.location.href = href
  }, 180)
}