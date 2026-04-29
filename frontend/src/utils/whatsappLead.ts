import type { WhatsAppLeadType } from '@shared/types'
import { API_BASE_URL } from './siteConfig'
import { buildWhatsAppHref } from './contact'
import { trackWhatsAppLead } from './analytics'

interface WhatsAppLeadParams {
  leadType: WhatsAppLeadType
  referenceId?: string
  referenceLabel: string
  referencePrice?: number
  sourcePage: string
}

interface RegisteredWhatsAppHrefParams {
  href: string
  leadType: WhatsAppLeadType
  referenceId?: string
  referenceLabel?: string
  referencePrice?: number
  sourcePage: string
  fallbackMessage?: string
}

function buildWhatsAppMessage(params: WhatsAppLeadParams): string {
  const lines = [`Hi, I'm interested in: ${params.referenceLabel}`]
  if (params.referencePrice != null) {
    lines.push(`Price: AED ${params.referencePrice.toFixed(2)}`)
  }
  lines.push(`(via ${params.sourcePage} on PZM website)`)
  return lines.join('\n')
}

function buildFallbackWhatsAppMessage(sourcePage: string, referenceLabel?: string): string {
  if (referenceLabel) {
    return `Hi, I need help with ${referenceLabel}. (via ${sourcePage} on PZM website)`
  }

  return `Hi, I need help from PZM. (via ${sourcePage} on PZM website)`
}

function extractWhatsAppMessage(href: string): string | null {
  try {
    const url = new URL(href)
    return url.searchParams.get('text')
  } catch {
    return null
  }
}

function resolveReferenceLabel(referenceLabel: string | undefined, message: string): string {
  const explicitLabel = referenceLabel?.trim()
  if (explicitLabel) {
    return explicitLabel
  }

  const firstLine = message
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .find(Boolean)

  return firstLine || 'Website WhatsApp Contact'
}

function registerWhatsAppLead(params: WhatsAppLeadParams, message: string): void {
  fetch(`${API_BASE_URL}/whatsapp-leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lead_type: params.leadType,
      reference_id: params.referenceId,
      reference_label: params.referenceLabel,
      reference_price: params.referencePrice,
      source_page: params.sourcePage,
      whatsapp_message: message,
    }),
  }).catch(() => {
    // Silently swallow — the user still gets to WhatsApp
  })
}

/**
 * Register a WhatsApp lead in the backend, then open WhatsApp in a new tab.
 * The API call is fire-and-forget so the user is never blocked.
 */
export function openWhatsAppLead(params: WhatsAppLeadParams): void {
  const message = buildWhatsAppMessage(params)
  const url = buildWhatsAppHref(message)

  trackWhatsAppLead(params)

  registerWhatsAppLead(params, message)

  window.open(url, '_blank', 'noopener,noreferrer')
}

export function openRegisteredWhatsAppHref(params: RegisteredWhatsAppHrefParams): void {
  const message = extractWhatsAppMessage(params.href)
    || params.fallbackMessage
    || buildFallbackWhatsAppMessage(params.sourcePage, params.referenceLabel)

  registerWhatsAppLead(
    {
      leadType: params.leadType,
      referenceId: params.referenceId,
      referenceLabel: resolveReferenceLabel(params.referenceLabel, message),
      referencePrice: params.referencePrice,
      sourcePage: params.sourcePage,
    },
    message,
  )

  window.open(params.href, '_blank', 'noopener,noreferrer')
}
