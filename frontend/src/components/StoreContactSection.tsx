import StoreHoursPanel from './StoreHoursPanel'
import { siteContact, siteIdentity } from '../content/siteData'

export default function StoreContactSection() {
  return (
    <section className="border-t border-brandBorder bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-3xl border border-brandBorder bg-white p-6 shadow-sm md:p-8">
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
    </section>
  )
}
