import { Link } from 'react-router-dom'
import HomeAppointmentPanel from '../components/HomeAppointmentPanel'
import RetailMediaPlaceholder from '../components/RetailMediaPlaceholder'
import Seo from '../components/Seo'
import { serviceCatalogList } from '../content/serviceCatalog'

export default function ServicesPage() {
  return (
    <div className="space-y-10">
      <Seo
        title="Services in Dubai | PZM Computers & Phones"
        description="Explore repair, trade-in, gaming PC, accessories, iPhone, and device support pages from PZM Computers & Phones in Dubai."
        canonicalPath="/services"
      />

      <section className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">PZM Service Hub</p>
        <h1 className="mt-3 text-[1.9rem] font-bold text-gray-900 md:text-[2.25rem]">Our Services</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-brandTextMedium md:text-[0.95rem]">
          Everything you need for phones, laptops &amp; PCs — all under one roof at our Al Barsha store on Hessa Street, Dubai.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {serviceCatalogList.map((service) => (
          <Link
            key={service.slug}
            to={`/services/${service.slug}`}
            className="group flex flex-col items-center rounded-[24px] border border-brandBorder bg-white p-5 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
          >
            <div className="retail-card-media mb-4 w-full overflow-hidden rounded-[16px]">
              <RetailMediaPlaceholder
                name={service.title}
                variant="card"
                className="transition-transform group-hover:scale-[1.02]"
              />
            </div>
            <h2 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
              {service.title}
            </h2>
            <p className="mb-3 text-sm text-brandTextMedium min-h-[44px]">
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