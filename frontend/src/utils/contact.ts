export const SUPPORT_PHONE_E164 = '+971528026677'
export const SUPPORT_PHONE_DISPLAY = '+971 52 802 6677'
export const SUPPORT_WHATSAPP_NUMBER = '971528026677'

export function buildWhatsAppHref(message: string): string {
  return `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
