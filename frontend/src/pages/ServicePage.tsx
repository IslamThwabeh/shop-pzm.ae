import { Link, useParams } from 'react-router-dom'
import Seo from '../components/Seo'
import ServiceRequestForm from '../components/ServiceRequestForm'
import { resolveServiceSlug } from '../content/serviceCatalog'

const mapsLink = 'https://maps.app.goo.gl/e5Rhfo8YY3i8CatM7?g_st=ic'

export default function ServicePage() {
  const { slug } = useParams()
  const service = resolveServiceSlug(slug)

  if (!service) {
    return (
      <div className="bg-white rounded-3xl border border-brandBorder shadow-md p-10 text-center">
        <Seo
          title="Service Not Found | PZM Computers & Phones"
          description="The requested service page could not be found."
          canonicalPath="/services"
          noindex={true}
        />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Service page not found</h1>
        <p className="text-brandTextMedium mb-6">This route is not mapped yet in the parity migration.</p>
        <Link
          to="/services"
          className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-white font-semibold hover:bg-brandGreenDark transition-colors"
        >
          Back to Services
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <Seo
        title={`${service.title} in Dubai | PZM Computers & Phones`}
        description={service.description}
        canonicalPath={`/services/${service.slug}`}
      />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link to="/services" className="text-primary font-semibold hover:underline">
          ← Back to services
        </Link>
        <div className="flex gap-3 flex-wrap">
          <a
            href="tel:+971528026677"
            className="inline-flex items-center rounded-xl border border-brandBorder px-4 py-2 text-brandTextDark font-semibold hover:border-primary hover:text-primary transition-colors"
          >
            Call Us
          </a>
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-xl border border-brandBorder px-4 py-2 text-brandTextDark font-semibold hover:border-primary hover:text-primary transition-colors"
          >
            Visit Store
          </a>
        </div>
      </div>

      <section className="bg-white rounded-3xl border border-brandBorder shadow-md p-8 md:p-12 text-left">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">Attribution-first service flow</p>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{service.heroTitle}</h1>
        <p className="text-lg text-brandTextMedium max-w-3xl mb-6">{service.heroDescription}</p>

        <div className="flex flex-wrap gap-3">
          {service.shopPath && (
            <Link
              to={service.shopPath}
              className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-white font-semibold hover:bg-brandGreenDark transition-colors"
            >
              Browse Live Shop
            </Link>
          )}
          <a
            href="#service-request-form"
            className="inline-flex items-center rounded-xl border border-brandBorder px-5 py-3 text-brandTextDark font-semibold hover:border-primary hover:text-primary transition-colors"
          >
            Start Request
          </a>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr,0.9fr] gap-8 items-start">
        <div className="space-y-8">
          <section className="bg-white rounded-2xl border border-brandBorder shadow-sm p-8 text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What this page does now</h2>
            <div className="space-y-3 text-brandTextDark">
              {service.highlights.map((highlight) => (
                <p key={highlight}>• {highlight}</p>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-brandBorder shadow-sm p-8 text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What happens next</h2>
            <div className="space-y-4 text-brandTextDark">
              <p><span className="font-semibold text-primary">1.</span> Submit the form with enough detail for the team to act.</p>
              <p><span className="font-semibold text-primary">2.</span> The request is stored with its own reference ID inside the new site backend.</p>
              <p><span className="font-semibold text-primary">3.</span> The team follows up using the preferred contact method instead of starting from an untracked chat thread.</p>
            </div>
          </section>
        </div>

        <div id="service-request-form">
          <ServiceRequestForm
            serviceSlug={service.slug}
            serviceTitle={service.title}
            sourcePath={`/services/${service.slug}`}
            requestKinds={service.requestKinds}
          />
        </div>
      </div>
    </div>
  )
}