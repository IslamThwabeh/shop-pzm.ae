import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { areaCatalogList } from '../content/areaCatalog'
import { siteContact } from '../content/siteData'

export default function AreasPage() {
  return (
    <div className="space-y-8 sm:space-y-10">
      <Seo
        title="Areas We Serve in Dubai | PZM Computers & Phones"
        description="Explore the Dubai communities served by PZM, including Barsha 1-3, Dubai Science Park, JVC, JLT, Springs, Meadows Village, Barsha Heights, Tecom, and Al Sufouh."
        canonicalPath="/areas"
      />

      <section className="border-b border-[#eee] pb-8 text-left sm:pb-9">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Local coverage</p>
        <h1 className="max-w-4xl text-3xl font-bold leading-tight text-gray-900 sm:text-4xl md:text-[2.75rem]">Areas We Serve in Dubai</h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-brandTextMedium sm:text-lg">
          We&apos;re based in Al Barsha on Hessa Street and serve customers across Dubai. Open your area for local links, directions, and the fastest route to the right service.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
        {areaCatalogList.map((area) => (
          <article key={area.slug} className="flex h-full flex-col rounded-[16px] border border-[#eee] bg-white p-5 text-left shadow-[0_10px_30px_rgba(15,23,42,0.035)] sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{area.badge}</p>
            <h2 className="mt-3 text-[1.35rem] font-bold leading-[1.1] text-gray-900 sm:text-[1.65rem]">{area.name}</h2>
            <p className="mt-2 text-base font-semibold leading-6 text-brandTextDark sm:text-[1.125rem]">{area.serviceTitle}</p>
            <p className="mt-3 line-clamp-3 text-[15px] leading-6 text-brandTextMedium">{area.heroDescription}</p>

            <div className="mt-5 space-y-3 border-t border-[#f3f4f6] pt-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Travel note</p>
                <p className="mt-1.5 text-[13px] leading-5 text-brandTextMedium">{area.travelNote}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {area.nearbyCommunities.slice(0, 3).map((community) => (
                  <span key={community} className="rounded-full border border-[#eef1f3] bg-[#fafbfb] px-3 py-1.5 text-[12px] font-medium text-brandTextMedium">
                    {community}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-1">
              <Link
                to={`/areas/${area.slug}/`}
                className="inline-flex w-full items-center justify-center rounded-[10px] bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brandGreenDark sm:w-auto"
              >
                Open area page
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="border-t border-[#eee] pt-6 text-center sm:pt-7">
        <p className="text-sm leading-7 text-brandTextDark sm:text-base">
          <span className="font-semibold">Don&apos;t see your area?</span> We still serve you.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2.5">
          <a
            href={siteContact.whatsappSupportHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-[10px] bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brandGreenDark"
          >
            WhatsApp Us
          </a>
          <a
            href={siteContact.phoneHref}
            className="inline-flex items-center rounded-[10px] border border-[#eee] px-4 py-2.5 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary"
          >
            {siteContact.phoneDisplay}
          </a>
        </div>
      </section>
    </div>
  )
}