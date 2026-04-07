import { MessageCircle, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { footerQuickLinks, siteContact, siteIdentity } from '../content/siteData'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-brandBorder bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-[28px] border border-brandBorder bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Additional Links</p>
              <h3 className="mt-3 text-2xl font-bold text-slate-950">{siteIdentity.name}</h3>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-brandTextMedium">{siteIdentity.tagline}</p>
              <p className="mt-4 text-sm leading-7 text-brandTextMedium">{siteIdentity.summary}</p>
            </div>

            <div className="lg:max-w-xl lg:text-right">
              <div className="flex flex-wrap gap-3 lg:justify-end">
                {footerQuickLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="rounded-full border border-brandBorder bg-white px-4 py-2 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3 lg:justify-end">
                <a
                  href={siteContact.phoneHref}
                  className="inline-flex items-center gap-2 rounded-full border border-brandBorder px-4 py-2 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary"
                >
                  <Phone size={16} />
                  Call Us
                </a>
                <a
                  href={siteContact.whatsappSupportHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-brandBorder px-4 py-2 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary"
                >
                  <MessageCircle size={16} className="text-[#25D366]" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-brandBorder pt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-sm text-brandTextMedium">
            <p>{siteIdentity.name} - {siteIdentity.tagline}</p>
            <p>&copy; {currentYear} All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
