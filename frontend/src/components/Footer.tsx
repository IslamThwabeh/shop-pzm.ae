import { MessageCircle, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { footerQuickLinks, siteContact } from '../content/siteData'
import { toSupportedLocalizedPath, useLanguage } from '../context/LanguageContext'

export default function Footer() {
  const { lang, t } = useLanguage()
  const footerLabels = new Map([
    ['/', lang === 'ar' ? 'الرئيسية' : 'Home'],
    ['/services/repair/', t('navRepair')],
    ['/services/brand-new/', lang === 'ar' ? 'المتجر' : 'Shop'],
    ['/services/gaming-pc/', lang === 'ar' ? 'تجميع كمبيوتر' : 'PC Build'],
    ['/blog/', lang === 'ar' ? 'المدونة' : 'Blog'],
    ['/areas/', lang === 'ar' ? 'المناطق' : 'Areas'],
    ['/return-policy/', lang === 'ar' ? 'سياسة الإرجاع' : 'Return Policy'],
    ['/terms/', lang === 'ar' ? 'الشروط' : 'Terms'],
  ])

  return (
    <footer className="border-t border-[#eee] bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 text-sm text-slate-500 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col items-center gap-3 lg:items-start">
            <img
              src="/images/brand/pzm-footer-logo.png"
              alt="PZM Computers & Phones Trading"
              width={632}
              height={332}
              className="h-11 w-auto object-contain"
            />
            <p className="text-center lg:text-start">{t('footerCopyright', { year: String(new Date().getFullYear()) })}</p>
          </div>

          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          {footerQuickLinks.map((link) => (
            <Link
              key={link.to}
              to={toSupportedLocalizedPath(link.to, lang)}
              className="transition-colors hover:text-slate-900"
            >
              {footerLabels.get(link.to) || link.label}
            </Link>
          ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={siteContact.phoneHref}
              aria-label={t('navCallAriaLabel')}
              className="transition-colors hover:text-slate-900"
            >
              <Phone size={16} />
            </a>
            <a
              href={siteContact.whatsappSupportHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('navWhatsAppAriaLabel')}
              className="transition-colors hover:text-[#25D366]"
            >
              <MessageCircle size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
