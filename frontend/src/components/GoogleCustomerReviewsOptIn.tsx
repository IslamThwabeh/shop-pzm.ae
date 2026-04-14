import { useEffect, useMemo, useRef } from 'react'
import { isDubaiAddress } from '../utils/orderPricing'

const DEFAULT_GOOGLE_MERCHANT_ID = 5751786279
const GOOGLE_CUSTOMER_REVIEWS_OPT_IN_STYLE = 'CENTER_DIALOG'
const GOOGLE_CUSTOMER_REVIEWS_SCRIPT_ID = 'google-customer-reviews-platform'
const GOOGLE_CUSTOMER_REVIEWS_IFRAME_SELECTOR = 'iframe[src*="google.com/shopping/customerreviews/optin"]'

declare global {
  interface Window {
    ___gcfg?: {
      lang?: string
    }
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
    renderOptIn?: () => void
  }
}

interface GoogleCustomerReviewsOptInProps {
  orderId: string
  email: string
  address?: string | null
  placedAt?: string | null
  onStatusChange?: (status: string) => void
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

function resolveOptInStyle() {
  return GOOGLE_CUSTOMER_REVIEWS_OPT_IN_STYLE
}

export default function GoogleCustomerReviewsOptIn({ orderId, email, address, placedAt, onStatusChange }: GoogleCustomerReviewsOptInProps) {
  const hasRenderedRef = useRef(false)
  const merchantId = useMemo(() => parseMerchantId(), [])
  const trimmedEmail = email.trim()
  const trimmedOrderId = orderId.trim()
  const estimatedDeliveryDate = useMemo(() => buildEstimatedDeliveryDate(address, placedAt), [address, placedAt])
  const optInStyle = useMemo(() => resolveOptInStyle(), [])

  const updateStatus = (status: string) => {
    onStatusChange?.(status)
  }

  useEffect(() => {
    if (!trimmedOrderId || !trimmedEmail) {
      updateStatus('skipped-missing-order-data')
      return undefined
    }

    if (hasRenderedRef.current) {
      return undefined
    }

    let isDisposed = false
    let promptCheckTimeoutId: number | undefined

    const reportPromptPresence = () => {
      const promptIframe = document.querySelector(GOOGLE_CUSTOMER_REVIEWS_IFRAME_SELECTOR) as HTMLIFrameElement | null

      if (!promptIframe) {
        return
      }

      const promptSrc = promptIframe.getAttribute('src') || ''
      const promptRect = promptIframe.getBoundingClientRect()
      const promptStyleDeclaration = window.getComputedStyle(promptIframe)
      const styleMatch = promptSrc.match(/[?&]style=([^&#]+)/i)
      const promptStyle = styleMatch?.[1]?.toLowerCase() || optInStyle.toLowerCase()
      const promptVisible = promptStyleDeclaration.display !== 'none'
        && promptStyleDeclaration.visibility !== 'hidden'
        && Number(promptStyleDeclaration.opacity || '1') > 0
        && promptRect.width > 40
        && promptRect.height > 40

      updateStatus(`${promptVisible ? 'prompt-visible' : 'prompt-hidden'}:${promptStyle}`)
    }

    const renderOptIn = () => {
      if (!window.gapi || hasRenderedRef.current || isDisposed) {
        if (!window.gapi) {
          updateStatus('gapi-unavailable')
        }
        return
      }

      updateStatus('gapi-ready')

      window.gapi.load('surveyoptin', () => {
        if (hasRenderedRef.current || isDisposed) {
          return
        }

        if (typeof window.gapi?.surveyoptin?.render !== 'function') {
          updateStatus('surveyoptin-api-missing')
          return
        }

        updateStatus('render-called')

        window.gapi?.surveyoptin?.render({
          merchant_id: merchantId,
          order_id: trimmedOrderId,
          email: trimmedEmail,
          delivery_country: 'AE',
          estimated_delivery_date: estimatedDeliveryDate,
          opt_in_style: optInStyle,
        })

        hasRenderedRef.current = true
        updateStatus('render-complete')

        promptCheckTimeoutId = window.setTimeout(() => {
          if (!isDisposed) {
            reportPromptPresence()
          }
        }, 2500)
      })
    }

    window.___gcfg = {
      ...(window.___gcfg ?? {}),
      lang: window.___gcfg?.lang || 'en',
    }
    window.renderOptIn = renderOptIn

    const existingScript = document.getElementById(GOOGLE_CUSTOMER_REVIEWS_SCRIPT_ID) as HTMLScriptElement | null

    if (window.gapi) {
      renderOptIn()
      return () => {
        isDisposed = true
        if (typeof promptCheckTimeoutId === 'number') {
          window.clearTimeout(promptCheckTimeoutId)
        }
      }
    }

    if (existingScript) {
      updateStatus('script-found-waiting-for-google-callback')

      return () => {
        isDisposed = true
        if (typeof promptCheckTimeoutId === 'number') {
          window.clearTimeout(promptCheckTimeoutId)
        }
      }
    }

    const script = document.createElement('script')
    script.id = GOOGLE_CUSTOMER_REVIEWS_SCRIPT_ID
    script.src = 'https://apis.google.com/js/platform.js?onload=renderOptIn'
    script.async = true
    script.defer = true
    updateStatus('script-injected')
    script.addEventListener('error', () => updateStatus('script-load-error'), { once: true })
    document.body.appendChild(script)

    return () => {
      isDisposed = true
      if (typeof promptCheckTimeoutId === 'number') {
        window.clearTimeout(promptCheckTimeoutId)
      }
    }
  }, [estimatedDeliveryDate, merchantId, optInStyle, trimmedEmail, trimmedOrderId])

  return null
}