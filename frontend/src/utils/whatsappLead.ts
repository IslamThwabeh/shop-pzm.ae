import type { WhatsAppLeadType } from '@shared/types'
import { API_BASE_URL } from './siteConfig'

const WHATSAPP_NUMBER = '971528026677'

interface WhatsAppLeadParams {
  leadType: WhatsAppLeadType
  referenceId?: string
  referenceLabel: string
  referencePrice?: number
  sourcePage: string
}

function buildWhatsAppMessage(params: WhatsAppLeadParams): string {
  const lines = [`Hi, I'm interested in: ${params.referenceLabel}`]
  if (params.referencePrice != null) {
    lines.push(`Price: AED ${params.referencePrice.toFixed(2)}`)
  }
  lines.push(`(via ${params.sourcePage} on PZM website)`)
  return lines.join('\n')
}

function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

/**
 * Register a WhatsApp lead in the backend, then open WhatsApp in a new tab.
 * The API call is fire-and-forget so the user is never blocked.
 */
export function openWhatsAppLead(params: WhatsAppLeadParams): void {
  const message = buildWhatsAppMessage(params)
  const url = buildWhatsAppUrl(message)

  // Fire-and-forget: register lead in the background
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

  window.open(url, '_blank', 'noopener,noreferrer')
}
