export const VAT_RATE = 0.05
export const FREE_DUBAI_DELIVERY_THRESHOLD = 500

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function getGrossVatBreakdown(grossTotal: number) {
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

export function getDeliveryPolicy(grossTotal: number, address?: string | null) {
  const normalizedTotal = roundCurrency(grossTotal)
  const inDubai = isDubaiAddress(address)
  const qualifiesByValue = normalizedTotal > FREE_DUBAI_DELIVERY_THRESHOLD
  const qualifiesForFreeDelivery = inDubai && qualifiesByValue
  const statusLabel = qualifiesForFreeDelivery ? 'Free' : 'Confirmed by location'
  const statusToneClass = qualifiesForFreeDelivery ? 'text-green-600' : 'text-amber-600'
  const totalLabel = qualifiesForFreeDelivery ? 'Total' : 'Items Total'
  const shortRule = `Free only inside Dubai on orders over AED ${FREE_DUBAI_DELIVERY_THRESHOLD}. Otherwise confirmed by location.`

  let detailedRule = shortRule

  if (address?.trim()) {
    if (qualifiesForFreeDelivery) {
      detailedRule = `Delivery is free for this order because the address is in Dubai and the items total is over AED ${FREE_DUBAI_DELIVERY_THRESHOLD}.`
    } else if (inDubai) {
      detailedRule = `Dubai delivery is free only on orders over AED ${FREE_DUBAI_DELIVERY_THRESHOLD}. The delivery fee for this order will be confirmed before dispatch.`
    } else {
      detailedRule = 'Delivery fee for this address will be confirmed based on location before dispatch.'
    }
  }

  return {
    inDubai,
    qualifiesByValue,
    qualifiesForFreeDelivery,
    statusLabel,
    statusToneClass,
    totalLabel,
    shortRule,
    detailedRule,
  }
}