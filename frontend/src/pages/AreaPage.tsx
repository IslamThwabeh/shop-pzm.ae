import { Link, useParams } from 'react-router-dom'
import Seo from '../components/Seo'
import { resolveAreaSlug } from '../content/areaCatalog'
import { siteContact, siteIdentity } from '../content/siteData'
import { buildCanonicalUrl, toAbsoluteSiteUrl } from '../utils/siteConfig'

const geoCoordinates = {
  latitude: 25.0848627,
  longitude: 55.1992671,
}

export default function AreaPage() {
  const { slug } = useParams()
  const area = resolveAreaSlug(slug)

  if (!area) {
    return (
      <div className="rounded-[22px] border border-[#eee] bg-white p-8 text-center sm:p-10">
        <Seo
          title="Area Not Found | PZM Computers & Phones"
          description="The requested area page could not be found."
          canonicalPath="/areas"
          noindex={true}
        />
        <h1 className="mb-4 text-3xl font-bold text-gray-900">Area page not found</h1>
        <p className="mb-6 text-brandTextMedium">The area page you requested is not available right now. You can browse the current Dubai service areas below.</p>
        <Link
          to="/areas/"
          className="inline-flex items-center rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brandGreenDark"
        >
          Back to areas
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      <Seo
        title={area.metaTitle}
        description={area.description}
        canonicalPath={`/areas/${area.slug}`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'ComputerStore',
          name: `${siteIdentity.name} - ${area.name}, Dubai`,
          description: area.description,
          url: buildCanonicalUrl(`/areas/${area.slug}`),
          telephone: '+971528026677',
          address: {
            '@type': 'PostalAddress',
            streetAddress: `${siteContact.addressLine1}, ${siteContact.addressLine2}`,
            addressLocality: 'Dubai',
            addressCountry: 'AE',
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: geoCoordinates.latitude,
            longitude: geoCoordinates.longitude,
          },
          areaServed: area.areaServed.map((name) => ({ '@type': 'Place', name })),
          image: toAbsoluteSiteUrl('/images/mini_logo.png'),
          priceRange: 'AED 150 - AED 7,000',
        }}
      />

      <div>
        <Link to="/areas/" className="text-primary font-semibold hover:underline">
          ← Back to areas
        </Link>
      </div>

      <section className="rounded-[16px] border border-[#eee] bg-white p-5 text-left shadow-[0_10px_30px_rgba(15,23,42,0.03)] sm:p-7">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rounded-full bg-brandLight px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            {area.badge}
          </span>
          <span className="text-[12px] font-medium text-brandTextMedium">{area.travelNote}</span>
        </div>
        <h1 className="mt-4 text-[2rem] font-bold leading-[1.05] text-gray-900 sm:text-[2.75rem]">{area.name}</h1>
        <p className="mt-3 text-[1.05rem] font-semibold leading-7 text-brandTextDark sm:text-[1.25rem]">{area.serviceTitle}</p>
        <p className="mt-3 max-w-4xl text-[15px] leading-7 text-brandTextMedium sm:text-base">{area.heroDescription}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {area.nearbyCommunities.slice(0, 4).map((community) => (
            <span
              key={community}
              className="rounded-full border border-[#eef1f3] bg-[#fafbfb] px-3 py-1.5 text-[12px] font-medium text-brandTextMedium"
            >
              {community}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
          <Link
            to="/services/"
            className="inline-flex w-full items-center justify-center rounded-[10px] bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brandGreenDark sm:w-auto"
          >
            Browse services
          </Link>
          <a
            href={siteContact.mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center rounded-[10px] border border-[#eee] px-4 py-3 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary sm:w-auto"
          >
            Get directions
          </a>
        </div>
      </section>

      <div className="overflow-hidden rounded-[22px] border border-[#eee] bg-white xl:grid xl:grid-cols-[minmax(0,1.14fr),minmax(320px,0.86fr)]">
        <section className="p-6 text-left sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Services</p>
          <h2 className="mt-2 mb-4 text-xl font-bold text-gray-900 sm:text-2xl">Popular services in {area.name}</h2>
          <div className="overflow-hidden rounded-[18px] border border-[#eee] bg-white">
            {area.featuredServices.map((service) => (
              <Link
                key={service.to}
                to={service.to}
                className="block border-b border-[#eee] px-4 py-4 transition-colors last:border-b-0 hover:bg-[#fafafa]"
              >
                <span className="block text-base font-semibold text-gray-900 sm:text-lg">{service.label}</span>
                <span className="mt-1.5 block text-[14px] leading-6 text-brandTextMedium">{service.description}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-t border-[#eee] p-6 text-left sm:p-7 xl:border-l xl:border-t-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Coverage</p>
          <h2 className="mt-2 mb-3 text-xl font-bold text-gray-900 sm:text-2xl">Nearby communities</h2>
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-400">Travel note</p>
          <p className="mt-2 text-[14px] leading-6 text-brandTextMedium">{area.travelNote}</p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {area.nearbyCommunities.map((community) => (
              <span
                key={community}
                className="rounded-full border border-[#eef1f3] bg-[#fafbfb] px-3 py-1.5 text-[12px] font-medium text-brandTextDark sm:text-[13px]"
              >
                {community}
              </span>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            <a
              href={siteContact.phoneHref}
              className="inline-flex w-full items-center justify-center rounded-[10px] border border-[#eee] px-4 py-3 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary sm:w-auto"
            >
              Call Us
            </a>
            <a
              href={siteContact.whatsappSupportHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-[10px] border border-[#eee] px-4 py-3 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary sm:w-auto"
            >
              WhatsApp Us
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}