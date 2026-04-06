import { Link, useParams } from 'react-router-dom'
import Seo from '../components/Seo'
import HomeAppointmentPanel from '../components/HomeAppointmentPanel'
import WhatsAppCTA from '../components/WhatsAppCTA'
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
    <div className="space-y-8">
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
        <div className={`grid grid-cols-1 ${service.imageUrl || service.cardImageUrl ? 'lg:grid-cols-[1.05fr,0.95fr] lg:items-stretch' : ''}`}>
          <div className="p-8 md:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">PZM Dubai service</p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{service.heroTitle}</h1>
            <p className="text-lg text-brandTextMedium max-w-3xl mb-6">{service.heroDescription}</p>

            <div className="flex flex-wrap gap-3">
              <a
                href={service.slug === 'repair' ? '#appointment' : '#service-contact'}
                className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-white font-semibold hover:bg-brandGreenDark transition-colors"
              >
                {service.slug === 'repair' ? 'Book Appointment' : 'Get in Touch'}
              </a>
            </div>
          </div>

          {(service.cardImageUrl || service.imageUrl) && (
            <div className="min-h-[280px] bg-slate-100">
              <img src={service.cardImageUrl || service.imageUrl} alt={service.imageAlt || service.title} className="h-full w-full object-cover" />
            </div>
          )}
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-brandBorder shadow-sm p-8 text-left">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">What we can help with</h2>
        <ul className="space-y-2 text-brandTextDark">
          {service.highlights.map((highlight) => (
            <li key={highlight} className="flex items-start gap-2">
              <span className="text-primary mt-1 shrink-0">✓</span>
              <span>{highlight}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 border-t border-brandBorder pt-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">How it works</h3>
          <div className="grid gap-3 md:grid-cols-3 text-sm text-brandTextDark">
            <p><span className="font-semibold text-primary">1.</span> Share the device model and issue.</p>
            <p><span className="font-semibold text-primary">2.</span> We review and confirm timing and estimate.</p>
            <p><span className="font-semibold text-primary">3.</span> Visit, drop off, or schedule pickup.</p>
          </div>
        </div>
      </section>

      {service.detailSections && service.detailSections.length > 0 && (
        <section className="bg-white rounded-2xl border border-brandBorder shadow-sm p-8 text-left">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Details</h2>
          <div className="space-y-4">
            {service.detailSections.map((section, index) => (
              <details
                key={section.title}
                open={index === 0}
                className="rounded-xl border border-brandBorder bg-slate-50/60 p-4"
              >
                <summary className="cursor-pointer text-lg font-semibold text-gray-900">
                  {section.title}
                </summary>
                <ul className="mt-3 space-y-1.5 text-brandTextDark text-sm">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-primary mt-1 shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </section>
      )}

      {service.slug === 'repair' && (
        <section id="appointment" className="bg-[linear-gradient(180deg,#f0f7ff_0%,#e8f4fd_100%)] rounded-3xl border border-brandBorder p-6 md:p-8">
          <div className="mb-6 text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Appointment</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Book Repair Drop-Off or Pickup</h2>
            <p className="mt-3 text-brandTextMedium">Choose a preferred time in Dubai and submit a tracked repair booking request.</p>
          </div>
          <HomeAppointmentPanel
            sourcePage={`/services/${service.slug}#appointment`}
            defaultServiceType="repair-mobile"
          />
        </section>
      )}

      <div id="service-contact">
        <WhatsAppCTA
          title={`Need help with ${service.title.toLowerCase()}?`}
          description="Send us a message and the PZM team will follow up with pricing, availability, or next steps."
          prefilledMessage={`Hi, I'm interested in ${service.title} from your website. Can you help? (via pzm.ae/services/${service.slug})`}
        />
      </div>
    </div>
  )
}