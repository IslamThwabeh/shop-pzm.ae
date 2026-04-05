import { MessageCircle, Phone } from 'lucide-react'
import { siteContact } from '../content/siteData'

interface WhatsAppCTAProps {
  title?: string
  description?: string
  prefilledMessage: string
}

function buildWhatsAppUrl(message: string) {
  return `https://wa.me/971528026677?text=${encodeURIComponent(message)}`
}

export default function WhatsAppCTA({
  title = 'Have a question?',
  description = 'Message us on WhatsApp and the team will follow up directly.',
  prefilledMessage,
}: WhatsAppCTAProps) {
  return (
    <div className="rounded-[28px] border border-brandBorder bg-white p-8 shadow-sm text-left">
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-brandTextMedium">{description}</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href={buildWhatsAppUrl(prefilledMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-brandBorder px-5 py-3 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary"
        >
          <MessageCircle size={16} className="text-[#25D366]" />
          WhatsApp Us
        </a>
        <a
          href={siteContact.phoneHref}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-brandBorder px-5 py-3 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary"
        >
          <Phone size={16} />
          {siteContact.phoneDisplay}
        </a>
      </div>
    </div>
  )
}
