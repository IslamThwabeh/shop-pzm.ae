import { useEffect, useMemo, useRef } from 'react'
import { isDubaiAddress } from '../utils/orderPricing'

const DEFAULT_GOOGLE_MERCHANT_ID = 5751786279
const GOOGLE_CUSTOMER_REVIEWS_STYLE = 'BOTTOM_TRAY'
const GOOGLE_CUSTOMER_REVIEWS_SCRIPT_ID = 'google-customer-reviews-platform'

declare global {
  interface Window {
    gapi?: {
      load: (feature: string, callback: () => void) => void
      surveyoptin?: {
        render: (config: {
          merchant_id: number
          order_id: string
          email: string
          delivery_country: string
          estimated_delivery_date: string
          opt_in_style?: string
        }) => void
      }
    }
  }
}

interface GoogleCustomerReviewsOptInProps {
  orderId: string
  email: string
  address?: string | null
  placedAt?: string | null
}

function parseMerchantId() {
  const parsedValue = Number(import.meta.env.VITE_GOOGLE_MERCHANT_ID || DEFAULT_GOOGLE_MERCHANT_ID)
  return Number.isFinite(parsedValue) ? parsedValue : DEFAULT_GOOGLE_MERCHANT_ID
}

function addBusinessDays(startDate: Date, businessDays: number) {
  const result = new Date(startDate)
  let remainingDays = businessDays

  while (remainingDays > 0) {
    result.setDate(result.getDate() + 1)
    const dayOfWeek = result.getDay()

    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      remainingDays -= 1
    }
  }

  return result
}

function formatDateForGoogle(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function buildEstimatedDeliveryDate(address?: string | null, placedAt?: string | null) {
  const baseDate = placedAt ? new Date(placedAt) : new Date()
  const normalizedBaseDate = Number.isNaN(baseDate.getTime()) ? new Date() : baseDate
  const businessDays = isDubaiAddress(address) ? 2 : 3

  return formatDateForGoogle(addBusinessDays(normalizedBaseDate, businessDays))
}

export default function GoogleCustomerReviewsOptIn({ orderId, email, address, placedAt }: GoogleCustomerReviewsOptInProps) {
  const hasRenderedRef = useRef(false)
  const merchantId = useMemo(() => parseMerchantId(), [])
  const trimmedEmail = email.trim()
  const trimmedOrderId = orderId.trim()
  const estimatedDeliveryDate = useMemo(() => buildEstimatedDeliveryDate(address, placedAt), [address, placedAt])

  useEffect(() => {
    if (!trimmedOrderId || !trimmedEmail || hasRenderedRef.current) {
      return undefined
    }

    const renderOptIn = () => {
      if (!window.gapi || hasRenderedRef.current) {
        return
      }

      window.gapi.load('surveyoptin', () => {
        if (hasRenderedRef.current) {
          return
        }

        window.gapi?.surveyoptin?.render({
          merchant_id: merchantId,
          order_id: trimmedOrderId,
          email: trimmedEmail,
          delivery_country: 'AE',
          estimated_delivery_date: estimatedDeliveryDate,
          opt_in_style: GOOGLE_CUSTOMER_REVIEWS_STYLE,
        })

        hasRenderedRef.current = true
      })
    }

    const existingScript = document.getElementById(GOOGLE_CUSTOMER_REVIEWS_SCRIPT_ID) as HTMLScriptElement | null

    if (window.gapi) {
      renderOptIn()
      return undefined
    }

    if (existingScript) {
      existingScript.addEventListener('load', renderOptIn, { once: true })

      return () => {
        existingScript.removeEventListener('load', renderOptIn)
      }
    }

    const script = document.createElement('script')
    script.id = GOOGLE_CUSTOMER_REVIEWS_SCRIPT_ID
    script.src = 'https://apis.google.com/js/platform.js'
    script.async = true
    script.defer = true
    script.addEventListener('load', renderOptIn, { once: true })
    document.body.appendChild(script)

    return () => {
      script.removeEventListener('load', renderOptIn)
    }
  }, [estimatedDeliveryDate, merchantId, trimmedEmail, trimmedOrderId])

  return null
}