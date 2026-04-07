import { Link } from 'react-router-dom'
import RetailImage from '../components/RetailImage'
import Seo from '../components/Seo'
import { serviceCatalogList } from '../content/serviceCatalog'

export default function ServicesPage() {
  return (
    <div className="space-y-10">
      <Seo
        title="Our Services | PZM Computers & Phones Store"
        description="Explore repair, trade-in, gaming PC, accessories, iPhone, and device support pages from PZM Computers & Phones in Dubai."
        canonicalPath="/services"
      />

      <section className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">PZM Service Hub</p>
        <h1 className="mt-3 text-[1.9rem] font-bold text-gray-900 md:text-[2.25rem]">Our Services</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-brandTextMedium md:text-[0.95rem]">
          Everything you need for phones, laptops, and PCs from our Al Barsha store on Hessa Street.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {serviceCatalogList.map((service) => (
          <Link
            key={service.slug}
            to={`/services/${service.slug}/`}
            className="group flex flex-col items-center rounded-[24px] border border-brandBorder bg-white p-5 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
          >
            <div className="retail-card-media mb-4 w-full overflow-hidden rounded-[16px]">
              <RetailImage
                src={service.imageUrl || service.cardImageUrl}
                alt={service.imageAlt || service.title}
                name={service.title}
                variant="card"
                className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
              />
            </div>
            <h2 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
              {service.title}
            </h2>
            <p className="mb-3 text-sm text-brandTextMedium min-h-[44px]">
              {service.cardDescription || service.description}
            </p>
            <span className="mt-auto text-sm font-medium text-primary">Open service</span>
          </Link>
        ))}
      </section>
    </div>
  )
}