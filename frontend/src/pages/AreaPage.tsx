import { Link, useParams } from 'react-router-dom'
import Seo from '../components/Seo'
import { resolveAreaSlug } from '../content/areaCatalog'
import { siteContact, siteIdentity } from '../content/siteData'
import { buildSiteUrl, toAbsoluteSiteUrl } from '../utils/siteConfig'

const geoCoordinates = {
  latitude: 25.0848627,
  longitude: 55.1992671,
}

export default function AreaPage() {
  const { slug } = useParams()
  const area = resolveAreaSlug(slug)

  if (!area) {
    return (
      <div className="bg-white rounded-3xl border border-brandBorder shadow-md p-10 text-center">
        <Seo
          title="Area Not Found | PZM Computers & Phones"
          description="The requested area page could not be found."
          canonicalPath="/areas"
          noindex={true}
        />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Area page not found</h1>
        <p className="text-brandTextMedium mb-6">The area page you requested is not available right now. You can browse the current Dubai service areas below.</p>
        <Link
          to="/areas"
          className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-white font-semibold hover:bg-brandGreenDark transition-colors"
        >
          Back to areas
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <Seo
        title={area.metaTitle}
        description={area.description}
        canonicalPath={`/areas/${area.slug}`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'ComputerStore',
          name: `${siteIdentity.name} - ${area.name}, Dubai`,
          description: area.description,
          url: buildSiteUrl(`/areas/${area.slug}`),
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

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link to="/areas" className="text-primary font-semibold hover:underline">
          Back to areas
        </Link>
        <div className="flex gap-3 flex-wrap">
          <a
            href={siteContact.phoneHref}
            className="inline-flex items-center rounded-xl border border-brandBorder px-4 py-2 text-brandTextDark font-semibold hover:border-primary hover:text-primary transition-colors"
          >
            Call Us
          </a>
          <a
            href={siteContact.mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-xl border border-brandBorder px-4 py-2 text-brandTextDark font-semibold hover:border-primary hover:text-primary transition-colors"
          >
            Get Directions
          </a>
        </div>
      </div>

      <section className="bg-white rounded-3xl border border-brandBorder shadow-md p-8 md:p-12 text-left">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-brandLight px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {area.badge}
          </span>
          <span className="text-sm font-semibold text-brandTextMedium">{area.travelNote}</span>
        </div>
        <h1 className="mt-5 text-4xl md:text-5xl font-bold text-gray-900">{area.heroTitle}</h1>
        <p className="mt-4 max-w-3xl text-lg text-brandTextMedium">{area.heroDescription}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/shop"
            className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-white font-semibold hover:bg-brandGreenDark transition-colors"
          >
            Browse live shop
          </Link>
          <Link
            to="/services"
            className="inline-flex items-center rounded-xl border border-brandBorder px-5 py-3 text-brandTextDark font-semibold hover:border-primary hover:text-primary transition-colors"
          >
            View services
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr,0.9fr] gap-8 items-start">
        <div className="space-y-8">
          <section className="bg-white rounded-2xl border border-brandBorder shadow-sm p-8 text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why customers from {area.name} use this page</h2>
            <p className="text-brandTextMedium mb-5">{area.localSummary}</p>
            <div className="space-y-3 text-brandTextDark">
              {area.advantages.map((item) => (
                <p key={item}>- {item}</p>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-brandBorder shadow-sm p-8 text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Nearby communities covered</h2>
            <div className="flex flex-wrap gap-3">
              {area.nearbyCommunities.map((community) => (
                <span
                  key={community}
                  className="rounded-full border border-brandBorder px-4 py-2 text-sm font-semibold text-brandTextDark"
                >
                  {community}
                </span>
              ))}
            </div>
          </section>
        </div>

        <section className="bg-white rounded-2xl border border-brandBorder shadow-sm p-8 text-left">
          <h2 className="text-2xl font-bold text-gray-900 mb-5">Popular next steps for {area.name}</h2>
          <div className="space-y-4">
            {area.featuredServices.map((service) => (
              <Link
                key={service.to}
                to={service.to}
                className="block rounded-2xl border border-brandBorder px-5 py-4 hover:border-primary hover:bg-green-50 transition-colors"
              >
                <span className="block text-lg font-semibold text-gray-900">{service.label}</span>
                <span className="mt-2 block text-sm text-brandTextMedium">{service.description}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}