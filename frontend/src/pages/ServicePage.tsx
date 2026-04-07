import { Link, useParams } from 'react-router-dom'
import Seo from '../components/Seo'
import HomeAppointmentPanel from '../components/HomeAppointmentPanel'
import RetailImage from '../components/RetailImage'
import WhatsAppCTA from '../components/WhatsAppCTA'
import { resolveServiceSlug } from '../content/serviceCatalog'

const mapsLink = 'https://maps.app.goo.gl/e5Rhfo8YY3i8CatM7?g_st=ic'

const appointmentServiceTypes: Partial<Record<string, string>> = {
  repair: 'repair-mobile',
  'gaming-pc': 'gaming-pc',
  'sell-gadgets': 'sell-gadgets',
}

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
          to="/services/"
          className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-white font-semibold hover:bg-brandGreenDark transition-colors"
        >
          Back to Services
        </Link>
      </div>
    )
  }

  const hasAppointment = Boolean(appointmentServiceTypes[service.slug])

  return (
    <div className="space-y-8">
      <Seo
        title={`${service.title} in Dubai | PZM Computers & Phones`}
        description={service.description}
        canonicalPath={`/services/${service.slug}`}
      />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link to="/services/" className="text-primary font-semibold hover:underline">
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

      <section className="overflow-hidden rounded-3xl border border-brandBorder bg-white text-left shadow-md">
        <div className={`grid grid-cols-1 ${service.imageUrl || service.cardImageUrl ? 'lg:grid-cols-[1.05fr,0.95fr] lg:items-stretch' : ''}`}>
          <div className="p-6 md:p-10">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary">PZM service</p>
            <h1 className="mb-4 text-[2rem] font-bold text-gray-900 md:text-[2.5rem]">{service.heroTitle}</h1>
            <p className="mb-6 max-w-3xl text-[0.98rem] text-brandTextMedium md:text-base">{service.heroDescription}</p>

            <div className="flex flex-wrap gap-3">
              <a
                href={hasAppointment ? '#appointment' : '#service-contact'}
                className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-white font-semibold hover:bg-brandGreenDark transition-colors"
              >
                {hasAppointment ? 'Book Appointment' : 'Contact Us'}
              </a>
            </div>
          </div>

          {(service.cardImageUrl || service.imageUrl) && (
            <div className="retail-panel-media min-h-0 bg-slate-100">
              <RetailImage
                src={service.imageUrl || service.cardImageUrl}
                alt={service.imageAlt || service.title}
                name={service.title}
                variant="panel"
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-brandBorder bg-white p-6 text-left shadow-sm md:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">What we do</h2>
        <ul className="space-y-2 text-brandTextDark">
          {service.highlights.map((highlight) => (
            <li key={highlight} className="flex items-start gap-2">
              <span className="text-primary mt-1 shrink-0">✓</span>
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      </section>

      {service.detailSections && service.detailSections.length > 0 && (
        <section className="rounded-2xl border border-brandBorder bg-white p-6 text-left shadow-sm md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Service Details</h2>
          <div className="space-y-4">
            {service.detailSections.map((section, index) => (
              <details
                key={section.title}
                open={index === 0}
                className="rounded-xl border border-brandBorder bg-slate-50/60 p-4"
              >
                <summary className="cursor-pointer text-base font-semibold text-gray-900">
                  {section.title}
                </summary>
                <ul className="mt-3 space-y-1.5 text-brandTextDark text-sm">
                  {section.items.slice(0, 4).map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-primary mt-1 shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                  {section.items.length > 4 && (
                    <li className="pl-5 text-xs font-medium text-brandTextMedium">
                      +{section.items.length - 4} more points
                    </li>
                  )}
                </ul>
              </details>
            ))}
          </div>
        </section>
      )}

      {hasAppointment && (
        <section id="appointment" className="rounded-3xl border border-brandBorder bg-[linear-gradient(180deg,#f0f7ff_0%,#e8f4fd_100%)] p-6 md:p-8">
          <div className="mb-6 text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Appointment</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Book a Service Appointment</h2>
            <p className="mt-3 text-brandTextMedium">Choose a preferred time and send your request to the store team.</p>
          </div>
          <HomeAppointmentPanel
            sourcePage={`/services/${service.slug}#appointment`}
            defaultServiceType={appointmentServiceTypes[service.slug]}
          />
        </section>
      )}

      <div id="service-contact">
        <WhatsAppCTA
          title={`Need help with ${service.title.toLowerCase()}?`}
          description="Send us a message and the PZM team will follow up with pricing and next steps."
          prefilledMessage={`Hi, I'm interested in ${service.title} from your website. Can you help? (via pzm.ae/services/${service.slug})`}
        />
      </div>
    </div>
  )
}