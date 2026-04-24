export const sharedReturnPolicy = {
  '@type': 'MerchantReturnPolicy',
  applicableCountry: 'AE',
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
  merchantReturnDays: 7,
  returnMethod: 'https://schema.org/ReturnInStore',
  returnFees: 'https://schema.org/FreeReturn',
}

export const sharedShippingDetails = {
  '@type': 'OfferShippingDetails',
  shippingRate: {
    '@type': 'MonetaryAmount',
    value: '0',
    currency: 'AED',
  },
  shippingDestination: {
    '@type': 'DefinedRegion',
    addressCountry: 'AE',
  },
  deliveryTime: {
    '@type': 'ShippingDeliveryTime',
    handlingTime: {
      '@type': 'QuantitativeValue',
      minValue: 0,
      maxValue: 1,
      unitCode: 'DAY',
    },
    transitTime: {
      '@type': 'QuantitativeValue',
      minValue: 1,
      maxValue: 3,
      unitCode: 'DAY',
    },
  },
}

export function extractBrandFromName(productName: string): string {
  const lowerName = productName.toLowerCase()
  if (lowerName.includes('apple') || lowerName.includes('iphone') || lowerName.includes('macbook') || lowerName.includes('ipad') || lowerName.includes('imac')) return 'Apple'
  if (lowerName.includes('samsung') || lowerName.includes('galaxy')) return 'Samsung'
  if (lowerName.includes('sony') || lowerName.includes('playstation') || lowerName.includes('ps4') || lowerName.includes('ps5')) return 'Sony'
  if (lowerName.includes('lenovo')) return 'Lenovo'
  if (lowerName.includes('hp ')) return 'HP'
  if (lowerName.includes('dell')) return 'Dell'
  if (lowerName.includes('asus')) return 'ASUS'
  if (lowerName.includes('microsoft') || lowerName.includes('xbox')) return 'Microsoft'
  return 'PZM'
}
