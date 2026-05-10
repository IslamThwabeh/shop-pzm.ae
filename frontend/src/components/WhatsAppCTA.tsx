import { MessageCircle, Phone } from 'lucide-react'
import { siteContact } from '../content/siteData'
import { buildWhatsAppHref } from '../utils/contact'
import { useLanguage } from '../context/LanguageContext'

interface WhatsAppCTAProps {
  title?: string
  description?: string
  prefilledMessage: string
}

export default function WhatsAppCTA({
  title,
  description,
  prefilledMessage,
}: WhatsAppCTAProps) {
  const { t } = useLanguage()
  const displayTitle = title ?? t('whatsappCtaDefaultTitle')
  const displayDesc = description ?? t('whatsappCtaDefaultDesc')
  return (
    <div className="rounded-[28px] border border-brandBorder bg-white p-6 text-start shadow-sm md:p-8">
      <h2 className="text-2xl font-bold text-slate-900">{displayTitle}</h2>
      <p className="mt-3 text-sm leading-7 text-brandTextMedium">{displayDesc}</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href={buildWhatsAppHref(prefilledMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-brandBorder px-5 py-3 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary"
        >
          <MessageCircle size={16} className="text-[#25D366]" />
          {t('whatsappCtaButtonLabel')}
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
