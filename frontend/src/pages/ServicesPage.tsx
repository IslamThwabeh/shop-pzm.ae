import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { serviceCatalogList } from '../content/serviceCatalog'

export default function ServicesPage() {
  return (
    <div className="space-y-10">
      <Seo
        title="Services in Dubai | PZM Computers & Phones"
        description="Explore repair, trade-in, gaming PC, accessories, and device service pages with tracked request forms on shop.pzm.ae."
        canonicalPath="/services"
      />

      <section className="bg-white rounded-3xl border border-brandBorder shadow-md p-8 md:p-12 text-left">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">Migration foundation</p>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Service funnels are moving on-site</h1>
        <p className="text-lg text-brandTextMedium max-w-3xl">
          This is the first implementation slice for replacing WhatsApp-first service funnels with trackable website requests.
          The layout will keep evolving toward full parity with pzm.ae, but the conversion layer now starts inside shop.pzm.ae.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {serviceCatalogList.map((service) => (
          <article key={service.slug} className="bg-white rounded-2xl border border-brandBorder shadow-sm p-6 text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary mb-3">{service.title}</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{service.heroTitle}</h2>
            <p className="text-brandTextMedium mb-5">{service.heroDescription}</p>

            <div className="space-y-2 mb-6">
              {service.highlights.slice(0, 2).map((highlight) => (
                <p key={highlight} className="text-sm text-brandTextDark">• {highlight}</p>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to={`/services/${service.slug}`}
                className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-white font-semibold hover:bg-brandGreenDark transition-colors"
              >
                Open Service Page
              </Link>
              {service.shopPath && (
                <Link
                  to={service.shopPath}
                  className="inline-flex items-center rounded-xl border border-brandBorder px-5 py-3 text-brandTextDark font-semibold hover:border-primary hover:text-primary transition-colors"
                >
                  Browse Live Shop
                </Link>
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}