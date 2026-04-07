import { MapPin, MessageCircle, Phone } from 'lucide-react'
import StoreHoursPanel from './StoreHoursPanel'
import { siteContact, siteIdentity } from '../content/siteData'

export default function StoreContactSection() {
  return (
    <section id="contact" className="border-t border-brandBorder bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Contact Us</p>
            <h2 className="mt-3 text-[1.9rem] font-bold tracking-tight text-slate-950 md:text-[2.25rem]">Need help with our services or products?</h2>
            <p className="mt-4 text-sm leading-7 text-brandTextMedium md:text-[0.98rem]">
              Visit our store inside Hessa Union Coop Hypermarket or reach out for pricing, repairs, and pickup support.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <a
              href={siteContact.phoneHref}
              className="rounded-[24px] border border-brandBorder bg-white p-5 shadow-sm transition-colors hover:border-primary"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brandLight text-primary">
                <Phone size={20} />
              </span>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-brandTextMedium">Call Us</p>
              <p className="mt-2 text-lg font-bold text-slate-950">{siteContact.phoneDisplay}</p>
            </a>

            <a
              href={siteContact.whatsappSupportHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-[24px] border border-brandBorder bg-white p-5 shadow-sm transition-colors hover:border-primary"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brandLight text-primary">
                <MessageCircle size={20} className="text-[#25D366]" />
              </span>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-brandTextMedium">WhatsApp</p>
              <p className="mt-2 text-lg font-bold text-slate-950">Chat with us instantly</p>
            </a>

            <a
              href={siteContact.mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-[24px] border border-brandBorder bg-white p-5 shadow-sm transition-colors hover:border-primary"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brandLight text-primary">
                <MapPin size={20} />
              </span>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-brandTextMedium">Visit Our Store</p>
              <p className="mt-2 text-lg font-bold text-slate-950">Hessa Union Coop Hypermarket</p>
              <p className="mt-1 text-sm text-brandTextMedium">Ground Floor, Al Barsha, Dubai</p>
            </a>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-brandBorder bg-white p-6 shadow-sm md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Visit Our Store</p>
              <h3 className="mt-3 text-3xl font-bold text-brandTextDark">{siteIdentity.name}</h3>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-brandTextMedium">{siteIdentity.tagline}</p>
              <div className="mt-5 space-y-2 text-brandTextMedium">
                <p>{siteContact.addressLine1}</p>
                <p>{siteContact.addressLine2}</p>
                <p>{siteContact.cityLine}</p>
              </div>
            </div>

            <StoreHoursPanel />

            <div className="min-h-[320px] overflow-hidden rounded-3xl border border-brandBorder bg-gray-100 shadow-sm">
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
