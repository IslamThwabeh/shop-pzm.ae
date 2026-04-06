import { Link } from 'react-router-dom'
import HomeAppointmentPanel from '../components/HomeAppointmentPanel'
import Seo from '../components/Seo'
import { serviceCatalogList } from '../content/serviceCatalog'

export default function ServicesPage() {
  return (
    <div className="space-y-12">
      <Seo
        title="Services in Dubai | PZM Computers & Phones"
        description="Explore repair, trade-in, gaming PC, accessories, iPhone, and device support pages from PZM Computers & Phones in Dubai."
        canonicalPath="/services"
      />

      <section className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">PZM Service Hub</p>
        <h1 className="mt-3 text-2xl md:text-3xl font-bold text-gray-900">Our Services</h1>
        <p className="mt-3 text-sm text-brandTextMedium max-w-xl mx-auto">
          Everything you need for phones, laptops &amp; PCs — all under one roof at our Al Barsha store on Hessa Street, Dubai.
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceCatalogList.map((service) => (
          <Link
            key={service.slug}
            to={`/services/${service.slug}`}
            className="group flex flex-col items-center rounded-xl border border-brandBorder bg-white p-5 text-center shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
          >
            {service.cardImageUrl ? (
              <div className="w-full overflow-hidden rounded-lg mb-4">
                <img
                  src={service.cardImageUrl}
                  alt={service.title}
                  className="w-full h-36 object-cover transition-transform group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="w-full h-36 flex items-center justify-center rounded-lg bg-slate-50 mb-4 text-5xl">
                🌐
              </div>
            )}
            <h2 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
              {service.title}
            </h2>
            <p className="text-sm text-brandTextMedium mb-3 min-h-[44px]">
              {service.cardDescription || service.description}
            </p>
            <span className="mt-auto text-sm font-medium text-primary">Learn more</span>
          </Link>
        ))}
      </section>

      <section id="appointment" className="rounded-[28px] border border-brandBorder bg-[linear-gradient(180deg,#f0f7ff_0%,#e8f4fd_100%)] p-6 shadow-sm md:p-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr,0.9fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Book Appointment</p>
            <h2 className="mt-3 text-2xl font-bold text-slate-950">Need help choosing the right service?</h2>
            <p className="mt-4 text-brandTextMedium leading-7">
              Book a quick drop-off, pickup, or consultation slot and the team will guide you to the right service page and next step.
            </p>
            <div className="mt-5 space-y-2 text-sm text-brandTextDark">
              <p><span className="font-semibold text-primary">1.</span> Select your service type and preferred timing.</p>
              <p><span className="font-semibold text-primary">2.</span> Share device details or request summary.</p>
              <p><span className="font-semibold text-primary">3.</span> Get a tracked follow-up from the store team.</p>
            </div>
          </div>

          <HomeAppointmentPanel sourcePage="/services#appointment" defaultServiceType="other-inquiry" />
        </div>
      </section>
    </div>
  )
}