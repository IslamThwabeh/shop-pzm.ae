import { getDeliveryPolicy as getSharedDeliveryPolicy } from '@shared/utils'

export {
  FLAT_DUBAI_DELIVERY_FEE,
  FREE_DUBAI_DELIVERY_THRESHOLD,
  VAT_RATE,
  getGrossVatBreakdown,
  isDubaiAddress,
} from '@shared/utils'

export function getDeliveryPolicy(itemsTotal: number, address?: string | null) {
  const deliveryPolicy = getSharedDeliveryPolicy(itemsTotal, address)

  return {
    ...deliveryPolicy,
    statusToneClass: deliveryPolicy.qualifiesForFreeDelivery
      ? 'text-green-600'
      : deliveryPolicy.usesFlatDubaiDeliveryFee
        ? 'text-primary'
        : 'text-amber-600',
  }
}