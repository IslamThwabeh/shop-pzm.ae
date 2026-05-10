import { Link, Navigate, useParams } from 'react-router-dom'
import Seo from '../components/Seo'
import HomeAppointmentPanel from '../components/HomeAppointmentPanel'
import RetailImage from '../components/RetailImage'
import WhatsAppCTA from '../components/WhatsAppCTA'
import { resolveServiceSlug } from '../content/serviceCatalog'
import { buildBreadcrumbJsonLd } from '../utils/breadcrumbs'
import { buildWhatsAppHref } from '../utils/contact'
import { useLanguage } from '../context/LanguageContext'

const appointmentServiceTypes: Partial<Record<string, string>> = {
  repair: 'repair-mobile',
  'gaming-pc': 'gaming-pc',
  'sell-gadgets': 'sell-gadgets',
}

export default function ServicePage() {
  const { slug } = useParams()
  const { lang, t } = useLanguage()
  const service = resolveServiceSlug(slug)
  const supportsArabicRoute = Boolean(service?.ar)
  const isArabicRoute = lang === 'ar'
  const canonicalBasePath = isArabicRoute && supportsArabicRoute ? '/ar/services' : '/services'

  if (service && slug && slug.toLowerCase() !== service.slug) {
    return <Navigate replace to={`${canonicalBasePath}/${service.slug}/`} />
  }

  if (isArabicRoute && service && !supportsArabicRoute) {
    return <Navigate replace to={`/services/${service.slug}/`} />
  }

  if (!service) {
    return (
      <div className="bg-white rounded-3xl border border-brandBorder shadow-md p-10 text-center">
        <Seo
          title="Service Not Found | PZM Computers & Phones"
          description="The requested service page could not be found."
          canonicalPath="/services"
          noindex={true}
        />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('serviceNotFoundHeading')}</h1>
        <p className="text-brandTextMedium mb-6">{t('serviceNotFoundBody')}</p>
        <Link
          to="/services/"
          className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-white font-semibold hover:bg-brandGreenDark transition-colors"
        >
          {t('serviceBackToServices')}
        </Link>
      </div>
    )
  }

  const hasAppointment = Boolean(appointmentServiceTypes[service.slug])
  const hasLocalSupport = Boolean(service.localSupportTitle || service.localSupportDescription || service.localSupportPoints?.length)

  // Resolve localized content for Arabic routes.
  const isAr = isArabicRoute && supportsArabicRoute
  const heroTitle = isAr ? service.ar!.heroTitle : service.heroTitle
  const heroDescription = isAr ? service.ar!.heroDescription : service.heroDescription
  const highlights = isAr ? service.ar!.highlights : service.highlights
  const localSupportTitle = isAr && service.ar?.localSupportTitle ? service.ar.localSupportTitle : service.localSupportTitle
  const localSupportDescription = isAr && service.ar?.localSupportDescription ? service.ar.localSupportDescription : service.localSupportDescription
  const localSupportPoints = isAr && service.ar?.localSupportPoints ? service.ar.localSupportPoints : service.localSupportPoints
  const seoTitle = isAr && service.ar ? service.ar.title : `${service.title} in Dubai | PZM Computers & Phones`
  const seoDescription = isAr ? heroDescription : service.description
  const canonicalPath = isAr ? `/ar/services/${service.slug}` : `/services/${service.slug}`
  const ctaServiceName = isAr && service.ar ? service.ar.title : service.title.toLowerCase()
  const detailSections = isAr ? [] : service.detailSections
  const relatedLinks = isAr ? [] : (service.relatedLinks || [])
  const hasRelatedLinks = relatedLinks.length > 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <Seo
        title={seoTitle}
        description={seoDescription}
        canonicalPath={canonicalPath}
        hreflangPath={service.ar ? `/services/${service.slug}` : undefined}
        jsonLd={buildBreadcrumbJsonLd([
          { name: isAr ? 'الرئيسية' : 'Home', path: '/' },
          { name: isAr ? 'الخدمات' : 'Services', path: '/services' },
          { name: isAr && service.ar ? service.ar.title : service.title, path: `/services/${service.slug}` },
        ])}
      />

      <section className="overflow-hidden rounded-3xl border border-brandBorder bg-white text-start shadow-md">
        <div className={`grid grid-cols-1 ${service.imageUrl || service.cardImageUrl ? 'lg:grid-cols-[1.05fr,0.95fr] lg:items-stretch' : ''}`}>
          <div className="p-6 md:p-10">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary">{t('serviceEyebrow')}</p>
            <h1 className="mb-4 text-[2rem] font-bold text-gray-900 md:text-[2.5rem]">{heroTitle}</h1>
            <p className="mb-6 max-w-3xl text-[0.98rem] text-brandTextMedium md:text-base">{heroDescription}</p>

            <div className="flex flex-wrap gap-3">
              <a
                href={hasAppointment ? '#appointment' : '#service-contact'}
                className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-white font-semibold hover:bg-brandGreenDark transition-colors"
              >
                {hasAppointment ? t('serviceBookAppointment') : t('serviceContactUs')}
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

      <section className="rounded-2xl border border-brandBorder bg-white p-6 text-start shadow-sm md:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('serviceWhatWeDoHeading')}</h2>
        <ul className="space-y-2 text-brandTextDark">
          {highlights.map((highlight) => (
            <li key={highlight} className="flex items-start gap-2">
              <span className="text-primary mt-1 shrink-0">✓</span>
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      </section>

      {detailSections && detailSections.length > 0 && (
        <section className="rounded-2xl border border-brandBorder bg-white p-6 text-start shadow-sm md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{t('serviceDetailsHeading')}</h2>
          <div className="space-y-4">
            {detailSections.map((section, index) => (
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
                    <li className="ps-5 text-xs font-medium text-brandTextMedium">
                      {t('serviceMorePoints', { n: String(section.items.length - 4) })}
                    </li>
                  )}
                </ul>
              </details>
            ))}
          </div>
        </section>
      )}

      {(hasLocalSupport || hasRelatedLinks) && (
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr),minmax(280px,0.9fr)]">
          {hasLocalSupport && (
            <article className="rounded-2xl border border-brandBorder bg-white p-6 text-start shadow-sm md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t('serviceLocalSupportEyebrow')}</p>
              <h2 className="mt-2 text-xl font-bold text-slate-950 md:text-2xl">{localSupportTitle}</h2>
              {localSupportDescription && (
                <p className="mt-4 text-sm leading-7 text-brandTextMedium md:text-[0.98rem]">
                  {localSupportDescription}
                </p>
              )}
              {localSupportPoints && localSupportPoints.length > 0 && (
                <ul className="mt-4 space-y-3 text-sm leading-6 text-brandTextDark">
                  {localSupportPoints.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <span className="mt-1 shrink-0 text-primary">✓</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          )}

          {hasRelatedLinks && (
            <aside className="rounded-2xl border border-brandBorder bg-white p-6 text-start shadow-sm md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t('serviceRelatedEyebrow')}</p>
              <h2 className="mt-2 text-xl font-bold text-slate-950 md:text-2xl">{t('serviceRelatedHeading')}</h2>
              <div className="mt-4 space-y-3">
                {relatedLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="block rounded-xl border border-brandBorder bg-slate-50/70 px-4 py-4 transition-colors hover:border-slate-300 hover:bg-slate-50"
                  >
                    <span className="block text-base font-semibold text-slate-950">{link.label}</span>
                    <span className="mt-1.5 block text-sm leading-6 text-brandTextMedium">{link.description}</span>
                  </Link>
                ))}
              </div>
            </aside>
          )}
        </section>
      )}

      {hasAppointment && (
        <section id="appointment" className="rounded-3xl border border-brandBorder bg-[linear-gradient(180deg,#f0f7ff_0%,#e8f4fd_100%)] p-5 md:p-6">
          <div className="mb-4 text-start">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t('serviceAppointmentEyebrow')}</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">{t('serviceAppointmentHeading')}</h2>
            <p className="mt-2 text-sm text-brandTextMedium md:text-[0.95rem]">{t('serviceAppointmentBody')}</p>
          </div>
          <HomeAppointmentPanel
            sourcePage={`${canonicalPath}#appointment`}
            defaultServiceType={appointmentServiceTypes[service.slug]}
            density="compact"
            quickContactHref={buildWhatsAppHref(isAr ? `مرحباً، أود حجز موعد لخدمة ${service.ar?.title || service.title}. (via pzm.ae${canonicalPath})` : `Hi, I'd like to book a ${service.title} appointment. (via pzm.ae/services/${service.slug})`)}
          />
        </section>
      )}

      <div id="service-contact">
        <WhatsAppCTA
          title={t('serviceNeedHelp', { service: ctaServiceName })}
          description={isAr ? 'أرسل لنا رسالة وسيتابع فريق PZM معك بخصوص الأسعار والخطوة التالية.' : 'Send us a message and the PZM team will follow up with pricing and next steps.'}
          prefilledMessage={isAr ? `مرحباً، أنا مهتم بخدمة ${service.ar?.title || service.title} من موقعكم. هل يمكنكم المساعدة؟ (via pzm.ae${canonicalPath})` : `Hi, I'm interested in ${service.title} from your website. Can you help? (via pzm.ae/services/${service.slug})`}
        />
      </div>
    </div>
  )
}