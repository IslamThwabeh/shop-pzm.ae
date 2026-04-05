import { Link } from 'react-router-dom'
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import StoreHoursPanel from './StoreHoursPanel'
import { siteContact, siteIdentity } from '../content/siteData'

export default function StoreContactSection() {
  return (
    <section className="border-t border-brandBorder bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 xl:grid-cols-[0.95fr,1.05fr] gap-10 items-start">
          <div className="space-y-8 text-left">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Visit or Contact PZM</p>
              <h2 className="mt-3 text-4xl font-bold text-brandTextDark">One Dubai storefront for sales, repairs, and support</h2>
              <p className="mt-4 max-w-2xl text-lg text-brandTextMedium">
                {siteIdentity.summary} Start with the right product or service page, or contact the team directly by phone, maps, or WhatsApp when you need help.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href={siteContact.phoneHref}
                className="rounded-2xl border border-brandBorder p-5 hover:border-primary hover:bg-green-50 transition-colors"
              >
                <Phone size={22} className="text-primary" />
                <p className="mt-4 text-lg font-semibold text-brandTextDark">Call the store</p>
                <p className="mt-2 text-sm text-brandTextMedium">{siteContact.phoneDisplay}</p>
              </a>
              <a
                href={siteContact.mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-brandBorder p-5 hover:border-primary hover:bg-green-50 transition-colors"
              >
                <MapPin size={22} className="text-primary" />
                <p className="mt-4 text-lg font-semibold text-brandTextDark">Get directions</p>
                <p className="mt-2 text-sm text-brandTextMedium">{siteContact.addressLine1}, {siteContact.cityLine}</p>
              </a>
              <a
                href={siteContact.whatsappSupportHref}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-brandBorder p-5 hover:border-primary hover:bg-green-50 transition-colors"
              >
                <MessageCircle size={22} className="text-primary" />
                <p className="mt-4 text-lg font-semibold text-brandTextDark">Support on WhatsApp</p>
                <p className="mt-2 text-sm text-brandTextMedium">Use WhatsApp for quick support questions, follow-up, and store guidance.</p>
              </a>
              <a
                href={siteContact.phoneHref}
                className="rounded-2xl border border-brandBorder p-5 hover:border-primary hover:bg-green-50 transition-colors"
              >
                <Mail size={22} className="text-primary" />
                <p className="mt-4 text-lg font-semibold text-brandTextDark">Email notifications only</p>
                <p className="mt-2 text-sm text-brandTextMedium">{siteContact.noReplyEmail} is unmonitored. Use phone or WhatsApp for support.</p>
              </a>
            </div>

            <div className="rounded-2xl border border-brandBorder bg-brandLight p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Quick paths</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to="/shop"
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brandGreenDark transition-colors"
                >
                  Browse the shop
                </Link>
                <Link
                  to="/services"
                  className="rounded-full border border-brandBorder px-4 py-2 text-sm font-semibold text-brandTextDark hover:border-primary hover:text-primary transition-colors"
                >
                  View services
                </Link>
                <Link
                  to="/areas"
                  className="rounded-full border border-brandBorder px-4 py-2 text-sm font-semibold text-brandTextDark hover:border-primary hover:text-primary transition-colors"
                >
                  Areas we serve
                </Link>
                <Link
                  to="/return-policy"
                  className="rounded-full border border-brandBorder px-4 py-2 text-sm font-semibold text-brandTextDark hover:border-primary hover:text-primary transition-colors"
                >
                  Return policy
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-brandBorder bg-white shadow-sm p-6 md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Store Details</p>
              <h3 className="mt-3 text-3xl font-bold text-brandTextDark">{siteIdentity.name}</h3>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-brandTextMedium">{siteIdentity.tagline}</p>
              <div className="mt-5 space-y-2 text-brandTextMedium">
                <p>{siteContact.addressLine1}</p>
                <p>{siteContact.addressLine2}</p>
                <p>{siteContact.cityLine}</p>
              </div>
            </div>

            <StoreHoursPanel />

            <div className="overflow-hidden rounded-3xl border border-brandBorder shadow-sm h-[320px] bg-gray-100">
              <iframe
                src={siteContact.mapEmbedUrl}
                title="PZM store location map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}