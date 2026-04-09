export const VAT_RATE = 0.05
export const FREE_DUBAI_DELIVERY_THRESHOLD = 500
export const FLAT_DUBAI_DELIVERY_FEE = 20

export interface GrossVatBreakdown {
  grossTotal: number
  subtotalExVat: number
  vatAmount: number
}

export interface DeliveryPolicy {
  itemsTotal: number
  deliveryFee: number | null
  totalPrice: number
  inDubai: boolean
  qualifiesByValue: boolean
  qualifiesForFreeDelivery: boolean
  usesFlatDubaiDeliveryFee: boolean
  requiresLocationConfirmation: boolean
  statusLabel: string
  totalLabel: string
  shortRule: string
  detailedRule: string
}

export function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function getGrossVatBreakdown(grossTotal: number): GrossVatBreakdown {
  const normalizedTotal = roundCurrency(grossTotal)
  const subtotalExVat = roundCurrency(normalizedTotal / (1 + VAT_RATE))
  const vatAmount = roundCurrency(normalizedTotal - subtotalExVat)

  return {
    grossTotal: normalizedTotal,
    subtotalExVat,
    vatAmount,
  }
}

export function isDubaiAddress(address?: string | null) {
  return !!address?.trim() && /\bdubai\b/i.test(address)
}

export function getDeliveryPolicy(itemsTotal: number, address?: string | null): DeliveryPolicy {
  const normalizedItemsTotal = roundCurrency(itemsTotal)
  const hasAddress = !!address?.trim()
  const inDubai = isDubaiAddress(address)
  const qualifiesByValue = normalizedItemsTotal > FREE_DUBAI_DELIVERY_THRESHOLD
  const qualifiesForFreeDelivery = inDubai && qualifiesByValue
  const usesFlatDubaiDeliveryFee = inDubai && hasAddress && !qualifiesByValue
  const deliveryFee = qualifiesForFreeDelivery ? 0 : usesFlatDubaiDeliveryFee ? FLAT_DUBAI_DELIVERY_FEE : null
  const totalPrice = roundCurrency(normalizedItemsTotal + (deliveryFee ?? 0))
  const requiresLocationConfirmation = deliveryFee === null
  const shortRule = `Free only inside Dubai on orders over AED ${FREE_DUBAI_DELIVERY_THRESHOLD}. Dubai orders up to AED ${FREE_DUBAI_DELIVERY_THRESHOLD} use a flat AED ${FLAT_DUBAI_DELIVERY_FEE} delivery fee. Other locations are confirmed by address.`

  let statusLabel = 'Enter address'
  let totalLabel = 'Items Total'
  let detailedRule = shortRule

  if (qualifiesForFreeDelivery) {
    statusLabel = 'Free'
    totalLabel = 'Total Amount'
    detailedRule = `Delivery is free because the address is in Dubai and the items total is over AED ${FREE_DUBAI_DELIVERY_THRESHOLD}.`
  } else if (usesFlatDubaiDeliveryFee) {
    statusLabel = `AED ${FLAT_DUBAI_DELIVERY_FEE.toFixed(2)}`
    totalLabel = 'Total Amount'
    detailedRule = `Dubai delivery for this order is a flat AED ${FLAT_DUBAI_DELIVERY_FEE.toFixed(2)} because the items total is AED ${normalizedItemsTotal.toFixed(2)}.`
  } else if (hasAddress) {
    statusLabel = 'Confirmed by location'
    detailedRule = 'Delivery fee for this address will be confirmed based on location before dispatch.'
  }

  return {
    itemsTotal: normalizedItemsTotal,
    deliveryFee,
    totalPrice,
    inDubai,
    qualifiesByValue,
    qualifiesForFreeDelivery,
    usesFlatDubaiDeliveryFee,
    requiresLocationConfirmation,
    statusLabel,
    totalLabel,
    shortRule,
    detailedRule,
  }
}