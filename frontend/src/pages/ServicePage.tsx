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
        <p className="text-brandTextMedium mb-6">The service page you requested is not available right now. You can browse the current services below.</p>
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

      <section className="overflow-hidden rounded-3xl border border-brandBorder bg-white shadow-md text-left">
        <div className={`grid grid-cols-1 ${service.imageUrl ? 'lg:grid-cols-[1.05fr,0.95fr] lg:items-stretch' : ''}`}>
          <div className="p-8 md:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">PZM Dubai service</p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{service.heroTitle}</h1>
            <p className="text-lg text-brandTextMedium max-w-3xl mb-6">{service.heroDescription}</p>

            <div className="flex flex-wrap gap-3">
              <a
                href="#service-request-form"
                className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-white font-semibold hover:bg-brandGreenDark transition-colors"
              >
                Start Request
              </a>
            </div>
          </div>

          {service.imageUrl && (
            <div className="min-h-[280px] bg-slate-100">
              <img src={service.imageUrl} alt={service.imageAlt || service.title} className="h-full w-full object-cover" />
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr,0.9fr] gap-8 items-start">
        <div className="space-y-8">
          <section className="bg-white rounded-2xl border border-brandBorder shadow-sm p-8 text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What we can help with</h2>
            <div className="space-y-3 text-brandTextDark">
              {service.highlights.map((highlight) => (
                <p key={highlight}>• {highlight}</p>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-brandBorder shadow-sm p-8 text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What happens next</h2>
            <div className="space-y-4 text-brandTextDark">
              <p><span className="font-semibold text-primary">1.</span> Submit the form with the details the team needs to review your request.</p>
              <p><span className="font-semibold text-primary">2.</span> PZM checks the service, stock, pricing, or consultation details for your request.</p>
              <p><span className="font-semibold text-primary">3.</span> The team contacts you using your preferred method to confirm the next step.</p>
            </div>
          </section>

          {service.detailSections && service.detailSections.length > 0 && (
            <section className="bg-white rounded-2xl border border-brandBorder shadow-sm p-8 text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {service.detailSections.map((section) => (
                  <div key={section.title}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{section.title}</h3>
                    <ul className="space-y-1.5 text-brandTextDark text-sm">
                      {section.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="text-primary mt-1 shrink-0">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}
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