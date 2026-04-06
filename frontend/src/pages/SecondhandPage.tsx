import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BatteryCharging, Gamepad2, Laptop, MessageCircle, RefreshCcw, ShieldCheck, Smartphone, Tablet } from 'lucide-react'
import type { Product } from '@shared/types'
import HomeAppointmentPanel from '../components/HomeAppointmentPanel'
import Seo from '../components/Seo'
import WhatsAppCTA from '../components/WhatsAppCTA'
import { getSecondhandCategoryGroups, getSecondhandProducts, secondhandCategories, secondhandHero } from '../content/secondhandCatalog'
import { openWhatsAppLead } from '../utils/whatsappLead'
import { resolveServiceSlug } from '../content/serviceCatalog'
import { buildSiteUrl, toAbsoluteSiteUrl } from '../utils/siteConfig'

const mapsLink = 'https://maps.app.goo.gl/e5Rhfo8YY3i8CatM7?g_st=ic'

interface SecondhandPageProps {
  products: Product[]
  loading: boolean
}

function getCategoryIcon(categoryKey: typeof secondhandCategories[number]['key']) {
  switch (categoryKey) {
    case 'used-phones':
      return Smartphone
    case 'used-laptops':
      return Laptop
    case 'used-tablets':
      return Tablet
    case 'used-gaming':
      return Gamepad2
    default:
      return Smartphone
  }
}

export default function SecondhandPage({ products, loading }: SecondhandPageProps) {
  const service = resolveServiceSlug('secondhand')
  if (!service) {
    return null
  }

  const handleWhatsApp = (product: Product) => {
    if ((product.quantity ?? 0) <= 0) return
    openWhatsAppLead({
      leadType: 'product',
      referenceId: product.id,
      referenceLabel: product.model,
      referencePrice: product.price,
      sourcePage: '/services/secondhand',
    })
  }

  const liveSecondhandProducts = useMemo(
    () => getSecondhandProducts(products).filter((product) => (product.quantity ?? 0) > 0),
    [products]
  )
  const categoryGroups = useMemo(() => getSecondhandCategoryGroups(products), [products])
  const liveCategoryGroups = categoryGroups.filter((group) => group.products.length > 0)
  const lowestPrice = liveSecondhandProducts.length > 0 ? Math.min(...liveSecondhandProducts.map((product) => product.price)) : null
  const heroImageUrl = toAbsoluteSiteUrl(secondhandHero.imageUrl)
  const primaryCtaHref = liveSecondhandProducts.length > 0 ? '#secondhand-live-stock' : '#secondhand-contact'
  const primaryCtaLabel = liveSecondhandProducts.length > 0 ? 'Browse Used Stock' : 'Request Used Stock'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Used Devices in Dubai | PZM',
    url: buildSiteUrl('/services/secondhand'),
    description:
      'Shop certified pre-owned devices in Dubai with live stock when available and request support for used phones, laptops, tablets, and gaming hardware from PZM.',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: liveSecondhandProducts.slice(0, 16).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: `${product.model} ${product.storage}`.trim(),
          url: buildSiteUrl(`/product/${product.id}`),
          image: [toAbsoluteSiteUrl(product.image_url || product.images?.[0] || secondhandHero.imageUrl)],
          offers: {
            '@type': 'Offer',
            priceCurrency: 'AED',
            price: product.price,
            availability: product.quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/UsedCondition',
          },
        },
      })),
    },
  }

  return (
    <div className="space-y-10">
      <Seo
        title="Used Devices in Dubai | PZM"
        description="Browse used devices in Dubai with live stock when available and request support for certified pre-owned phones, laptops, tablets, and gaming hardware from PZM."
        canonicalPath="/services/secondhand"
        imageUrl={heroImageUrl}
        jsonLd={jsonLd}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
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

      <section className="rounded-[32px] border border-brandBorder bg-white px-6 py-10 shadow-sm md:px-10 md:py-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Certified pre-owned</p>
          <h1 className="mt-4 text-3xl font-bold text-slate-950 md:text-4xl">Used devices in a calmer, easier-to-scan layout</h1>
          <p className="mt-4 text-base leading-8 text-brandTextMedium md:text-lg">
            Browse certified pre-owned devices with clearer category entry points, cleaner product tiles, and straightforward next steps when live used stock is low.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-semibold text-brandTextMedium">
          <span>{liveSecondhandProducts.length} live used products</span>
          <span>{liveCategoryGroups.length}/{secondhandCategories.length} categories listed</span>
          <span>{lowestPrice ? `From AED ${lowestPrice.toFixed(0)}` : 'Ask us for pricing'}</span>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={primaryCtaHref}
            className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-white font-semibold transition-colors hover:bg-brandGreenDark"
          >
            {primaryCtaLabel}
          </a>
          <Link
            to="/services/sell-gadgets"
            className="inline-flex items-center rounded-xl border border-brandBorder px-5 py-3 text-brandTextDark font-semibold transition-colors hover:border-primary hover:text-primary"
          >
            Trade In Your Device
          </Link>
          <Link
            to="/services"
            className="inline-flex items-center rounded-xl border border-brandBorder px-5 py-3 text-brandTextDark font-semibold transition-colors hover:border-primary hover:text-primary"
          >
            View All Service Pages
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Browse by category</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">Pick the used device type first</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {categoryGroups.map((group) => {
            const Icon = getCategoryIcon(group.category.key)

            return (
              <article key={group.category.key} className="flex h-full flex-col rounded-[28px] border border-brandBorder bg-white p-6 text-center shadow-sm">
                <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-primary">
                  <Icon size={24} />
                </span>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-brandTextMedium">
                  {group.products.length > 0 ? `${group.products.length} live products` : 'Request availability'}
                </p>
                <h2 className="mt-2 text-xl font-bold text-slate-950">{group.category.title}</h2>
                <p className="mt-3 text-sm leading-7 text-brandTextMedium">{group.category.description}</p>

                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {group.category.examples.map((example) => (
                    <span key={example} className="rounded-full border border-brandBorder bg-slate-50 px-3 py-1 text-xs font-semibold text-brandTextDark">
                      {example}
                    </span>
                  ))}
                </div>

                <a
                  href={group.products.length > 0 ? '#secondhand-live-stock' : '#secondhand-contact'}
                  className={`mt-6 inline-flex items-center self-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    group.products.length > 0
                      ? 'bg-primary text-white hover:bg-brandGreenDark'
                      : 'border border-brandBorder text-brandTextDark hover:border-primary hover:text-primary'
                  }`}
                >
                  {group.products.length > 0 ? 'See live stock' : 'Request availability'}
                </a>
              </article>
            )
          })}
        </div>
      </section>

      <section id="secondhand-live-stock" className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Live stock</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">Current used inventory on the site</h2>
            <p className="mt-3 max-w-3xl text-brandTextMedium">
              This section follows the live storefront catalog, so used listings only appear here when they are actually available on the site.
            </p>
          </div>
          <Link to="/services" className="text-sm font-semibold text-primary hover:underline">
            View all service pages
          </Link>
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-brandBorder bg-white p-8 shadow-sm text-brandTextMedium">
            Loading used inventory...
          </div>
        ) : liveCategoryGroups.length > 0 ? (
          <div className="space-y-8">
            {liveCategoryGroups.map((group) => {
              const Icon = getCategoryIcon(group.category.key)

              return (
                <section key={group.category.key} className="rounded-[28px] border border-brandBorder bg-white shadow-sm p-6 md:p-8">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-4">
                      <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brandLight text-primary">
                        <Icon size={24} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{group.category.shortTitle}</p>
                        <h3 className="mt-2 text-2xl font-bold text-slate-950">{group.category.title}</h3>
                        <p className="mt-3 max-w-3xl text-brandTextMedium">{group.category.description}</p>
                      </div>
                    </div>

                    <span className="self-start rounded-full border border-brandBorder bg-slate-50 px-4 py-2 text-sm font-semibold text-brandTextDark">
                      {group.products.length} live products
                    </span>
                  </div>

                  <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {group.products.map((product) => (
                      <article key={product.id} className="overflow-hidden rounded-[24px] border border-brandBorder bg-white shadow-sm">
                        <div className="aspect-[4/3] border-b border-brandBorder bg-white p-6">
                          <img
                            src={product.image_url || product.images?.[0] || secondhandHero.imageUrl}
                            alt={product.model}
                            className="h-full w-full object-contain"
                          />
                        </div>

                        <div className="p-5">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brandTextMedium">
                            Used • {product.storage} • {product.color}
                          </p>

                          <h4 className="mt-3 text-lg font-bold text-slate-950">{product.model}</h4>
                          <p className="mt-2 text-sm leading-7 text-brandTextMedium">{product.description || `${product.color} ${product.model}`}</p>

                          <div className="mt-4 flex items-end justify-between gap-4">
                            <div>
                              <p className="text-2xl font-bold text-slate-950">AED {product.price.toFixed(0)}</p>
                            </div>
                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                              {(product.quantity ?? 0) > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleWhatsApp(product)}
                            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brandBorder px-4 py-3 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary"
                          >
                            <MessageCircle size={16} className="text-[#25D366]" />
                            Contact us
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        ) : (
          <div className="rounded-[28px] border border-brandBorder bg-white p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-950">No used devices are currently listed on the storefront.</h3>
            <p className="mt-3 max-w-3xl text-brandTextMedium">
              If you want a used iPhone, laptop, tablet, or gaming device, send the model, budget, or preferred specs through the form below and the team can reply with current options.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="#secondhand-contact"
                className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-white font-semibold hover:bg-brandGreenDark transition-colors"
              >
                Request Used Stock
              </a>
              <a
                href="tel:+971528026677"
                className="inline-flex items-center rounded-xl border border-brandBorder px-5 py-3 text-brandTextDark font-semibold hover:border-primary hover:text-primary transition-colors"
              >
                Call the Store
              </a>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-[28px] border border-brandBorder bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-950 mb-2">Device Grading System</h2>
        <p className="text-brandTextMedium mb-6">Every used device at PZM is inspected and graded so you know exactly what you're getting.</p>
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-brandBorder bg-white p-6 shadow-sm">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold text-lg">A</span>
            <h3 className="mt-4 text-lg font-bold text-slate-950">Grade A — Like New</h3>
            <p className="mt-2 text-sm leading-7 text-brandTextDark">
              Minimal signs of use. Screen is flawless, body has no visible scratches or dents. Battery health 85%+. Looks and feels like a new device.
            </p>
          </div>
          <div className="rounded-2xl border border-brandBorder bg-white p-6 shadow-sm">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500 text-white font-bold text-lg">B</span>
            <h3 className="mt-4 text-lg font-bold text-slate-950">Grade B — Good Condition</h3>
            <p className="mt-2 text-sm leading-7 text-brandTextDark">
              Minor cosmetic wear — light scratches on screen or body. All functions work perfectly. Battery health 75%+. Great value for everyday use.
            </p>
          </div>
          <div className="rounded-2xl border border-brandBorder bg-white p-6 shadow-sm">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white font-bold text-lg">C</span>
            <h3 className="mt-4 text-lg font-bold text-slate-950">Grade C — Fair Condition</h3>
            <p className="mt-2 text-sm leading-7 text-brandTextDark">
              Noticeable wear — visible scratches, scuffs, or minor dents. Fully functional with all features working. Battery health 65%+. Best price point.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <article className="rounded-[28px] border border-brandBorder bg-white p-6 shadow-sm">
          <ShieldCheck className="text-primary" size={22} />
          <h2 className="mt-5 text-xl font-bold text-slate-950">30-day warranty included</h2>
          <p className="mt-3 text-sm leading-7 text-brandTextMedium">
            All certified pre-owned devices come with a 30-day warranty covering hardware defects. Battery health, screen, and all components are tested before sale.
          </p>
        </article>
        <article className="rounded-[28px] border border-brandBorder bg-white p-6 shadow-sm">
          <BatteryCharging className="text-primary" size={22} />
          <h2 className="mt-5 text-xl font-bold text-slate-950">Full testing & certification</h2>
          <p className="mt-3 text-sm leading-7 text-brandTextMedium">
            Every device passes a multi-point inspection: battery health, screen quality, cameras, speakers, charging, Face ID / Touch ID, and connectivity.
          </p>
        </article>
        <article className="rounded-[28px] border border-brandBorder bg-white p-6 shadow-sm">
          <RefreshCcw className="text-primary" size={22} />
          <h2 className="mt-5 text-xl font-bold text-slate-950">Trade-in and upgrade path</h2>
          <p className="mt-3 text-sm leading-7 text-brandTextMedium">
            Trade in your old device and get credit toward a certified used or brand-new upgrade. Visit us or use the sell-device page for an instant quote.
          </p>
        </article>
      </section>

      <section id="appointment" className="rounded-[28px] border border-brandBorder bg-[linear-gradient(180deg,#f0f7ff_0%,#e8f4fd_100%)] p-6 shadow-sm md:p-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr,0.9fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Book Appointment</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950">Need help finding the right used device?</h2>
            <p className="mt-4 text-brandTextMedium leading-7">
              Book a quick consultation for used phones, laptops, tablets, or gaming devices and get matched options by budget and condition.
            </p>
            <div className="mt-5 space-y-2 text-sm text-brandTextDark">
              <p><span className="font-semibold text-primary">1.</span> Share model, budget, and condition preference.</p>
              <p><span className="font-semibold text-primary">2.</span> We check tested inventory and best-fit options.</p>
              <p><span className="font-semibold text-primary">3.</span> Confirm store visit, pickup, or next step.</p>
            </div>
          </div>

          <HomeAppointmentPanel sourcePage="/services/secondhand#appointment" defaultServiceType="other-inquiry" />
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr,0.9fr] gap-8 items-start">
        <section className="bg-white rounded-2xl border border-brandBorder shadow-sm p-8 text-left">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Buying Flow</h2>
          <div className="space-y-4 text-brandTextDark">
            <p><span className="font-semibold text-primary">1.</span> Browse current used listings and condition details above.</p>
            <p><span className="font-semibold text-primary">2.</span> Tap <strong>Contact us</strong> on any matching device for availability confirmation.</p>
            <p><span className="font-semibold text-primary">3.</span> Use appointment booking if you want guided matching by budget and condition.</p>
          </div>
        </section>

        <div id="secondhand-contact">
          <WhatsAppCTA
            title="Looking for a specific used device?"
            description="Tell us the model, budget, and condition preference and the team will check current options."
            prefilledMessage="Hi, I'm looking for a specific used device. Can you check what's available? (via pzm.ae/services/secondhand)"
          />
        </div>
      </div>
    </div>
  )
}