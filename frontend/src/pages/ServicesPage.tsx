import { Link } from 'react-router-dom'
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
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Our Services</h1>
        <p className="text-brandTextMedium max-w-xl mx-auto">
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
                  className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="w-full h-48 flex items-center justify-center rounded-lg bg-slate-50 mb-4 text-5xl">
                🌐
              </div>
            )}
            <h2 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
              {service.title}
            </h2>
            <p className="text-sm text-brandTextMedium mb-3">
              {service.cardDescription || service.description}
            </p>
            <span className="mt-auto text-sm font-medium text-primary">Learn more</span>
          </Link>
        ))}
      </section>
    </div>
  )
}