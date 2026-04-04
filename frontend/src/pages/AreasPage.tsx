import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { areaCatalogList } from '../content/areaCatalog'

export default function AreasPage() {
  return (
    <div className="space-y-10">
      <Seo
        title="Areas We Serve in Dubai | PZM Computers & Phones"
        description="Explore the Dubai communities served by PZM, including Al Barsha, JVC, JBR, Dubai Marina, Tecom, and more."
        canonicalPath="/areas"
      />

      <section className="bg-white rounded-3xl border border-brandBorder shadow-md p-8 md:p-12 text-left">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">Local coverage</p>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Areas we serve from Al Barsha across Dubai</h1>
        <p className="text-lg text-brandTextMedium max-w-3xl">
          PZM operates from Hessa Street in Al Barsha and serves nearby residential, office, and waterfront communities across Dubai.
          Use the area pages to understand travel time, common request patterns, and the best route into the new tracked service and shop flows.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {areaCatalogList.map((area) => (
          <article key={area.slug} className="bg-white rounded-2xl border border-brandBorder shadow-sm p-6 text-left">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">{area.badge}</p>
              <span className="rounded-full bg-brandLight px-3 py-1 text-xs font-semibold text-primary">{area.name}</span>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">{area.title}</h2>
            <p className="mt-3 text-brandTextMedium">{area.heroDescription}</p>
            <p className="mt-4 text-sm font-medium text-brandTextDark">{area.travelNote}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {area.nearbyCommunities.slice(0, 3).map((community) => (
                <span key={community} className="rounded-full border border-brandBorder px-3 py-1 text-xs font-semibold text-brandTextMedium">
                  {community}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={`/areas/${area.slug}`}
                className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-white font-semibold hover:bg-brandGreenDark transition-colors"
              >
                Open area page
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center rounded-xl border border-brandBorder px-5 py-3 text-brandTextDark font-semibold hover:border-primary hover:text-primary transition-colors"
              >
                View services
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}