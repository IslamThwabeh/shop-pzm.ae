import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, CreditCard, Gamepad2, Laptop, MessageCircle, ShieldCheck, Smartphone, Truck } from 'lucide-react'
import type { Product } from '@shared/types'
import HomeAppointmentPanel from '../components/HomeAppointmentPanel'
import RetailImage from '../components/RetailImage'
import Seo from '../components/Seo'
import WhatsAppCTA from '../components/WhatsAppCTA'
import { brandNewCategories, brandNewHero, getBrandNewCategoryGroups, getBrandNewProducts } from '../content/brandNewCatalog'
import { getPrimaryProductImage } from '../utils/productPresentation'
import { openWhatsAppLead } from '../utils/whatsappLead'
import { resolveServiceSlug } from '../content/serviceCatalog'
import { buildSiteUrl, toAbsoluteSiteUrl } from '../utils/siteConfig'

const mapsLink = 'https://maps.app.goo.gl/e5Rhfo8YY3i8CatM7?g_st=ic'

interface BrandNewPageProps {
  products: Product[]
  loading: boolean
}

function getCategoryIcon(categoryKey: typeof brandNewCategories[number]['key']) {
  switch (categoryKey) {
    case 'phones-tablets':
      return Smartphone
    case 'laptops-computers':
      return Laptop
    case 'gaming-systems':
      return Gamepad2
    case 'professional-equipment':
      return Briefcase
    default:
      return Smartphone
  }
}

export default function BrandNewPage({ products, loading }: BrandNewPageProps) {
  const service = resolveServiceSlug('brand-new')

  if (!service) {
    return null
  }

  const handleWhatsApp = (product: Product) => {
    openWhatsAppLead({
      leadType: 'product',
      referenceId: product.id,
      referenceLabel: `${product.model} ${product.storage} ${product.color}`,
      referencePrice: product.price,
      sourcePage: '/services/brand-new',
    })
  }

  const liveBrandNewProducts = useMemo(() => getBrandNewProducts(products), [products])
  const categoryGroups = useMemo(() => getBrandNewCategoryGroups(products), [products])
  const liveCategoryGroups = categoryGroups.filter((group) => group.products.length > 0)
  const requestCategoryGroups = categoryGroups.filter((group) => group.products.length === 0)
  const lowestPrice = liveBrandNewProducts.length > 0 ? Math.min(...liveBrandNewProducts.map((product) => product.price)) : null
  const heroImageUrl = toAbsoluteSiteUrl(brandNewHero.imageUrl)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Brand New Devices in Dubai | PZM',
    url: buildSiteUrl('/services/brand-new'),
    description: 'Browse brand-new devices in Dubai from PZM, including phones, laptops, consoles, and more.',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: liveBrandNewProducts.slice(0, 16).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: `${product.model} ${product.storage}`.trim(),
          url: buildSiteUrl(`/product/${product.id}`),
          image: [toAbsoluteSiteUrl(product.image_url || product.images?.[0] || brandNewHero.imageUrl)],
          offers: {
            '@type': 'Offer',
            priceCurrency: 'AED',
            price: product.price,
            itemCondition: 'https://schema.org/NewCondition',
          },
        },
      })),
    },
  }

  return (
    <div className="space-y-10">
      <Seo
        title="Brand New Devices in Dubai | PZM Dubai"
        description="Browse brand-new devices in Dubai from PZM, including phones, laptops, consoles, and more."
        canonicalPath="/services/brand-new"
        imageUrl={heroImageUrl}
        jsonLd={jsonLd}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
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

      <section className="rounded-[32px] border border-brandBorder bg-white px-5 py-8 shadow-sm md:px-8 md:py-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Brand-new retail</p>
          <h1 className="mt-4 text-[1.9rem] font-bold text-slate-950 md:text-[2.25rem]">Brand New Devices in Dubai</h1>
          <p className="mt-4 text-sm leading-7 text-brandTextMedium md:text-[0.98rem]">
            Latest iPhones, Samsung phones, MacBooks, gaming consoles, and more with official warranty.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-semibold text-brandTextMedium">
          <span>{liveBrandNewProducts.length} devices listed</span>
          <span>{liveCategoryGroups.length} categories</span>
          <span>{lowestPrice ? `From AED ${lowestPrice.toFixed(0)}` : 'Request pricing'}</span>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="#brand-new-devices"
            className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-white font-semibold transition-colors hover:bg-brandGreenDark"
          >
            Browse Devices
          </a>
          <Link
            to="/services/buy-iphone/"
            className="inline-flex items-center rounded-xl border border-brandBorder px-5 py-3 text-brandTextDark font-semibold transition-colors hover:border-primary hover:text-primary"
          >
            View iPhone Collection
          </Link>
          <a
            href="#brand-new-contact"
            className="inline-flex items-center rounded-xl border border-brandBorder px-5 py-3 text-brandTextDark font-semibold transition-colors hover:border-primary hover:text-primary"
          >
            Ask About a Model
          </a>
        </div>
      </section>

      <section className="space-y-4">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Browse by category</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">Choose the device type</h2>
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
                  {group.products.length > 0 ? 'Listed now' : 'Message us'}
                </p>
                <h2 className="mt-2 text-xl font-bold text-slate-950">{group.category.title}</h2>
                <p className="mt-3 text-sm leading-7 text-brandTextMedium">{group.category.description}</p>

                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {group.category.examples.slice(0, 4).map((example) => (
                    <span key={example} className="rounded-full border border-brandBorder bg-slate-50 px-3 py-1 text-xs font-semibold text-brandTextDark">
                      {example}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex flex-col items-center gap-3">
                  <a
                    href={group.products.length > 0 ? `#${group.category.key}-live` : '#brand-new-contact'}
                    className={`inline-flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                      group.products.length > 0
                        ? 'bg-primary text-white hover:bg-brandGreenDark'
                        : 'border border-brandBorder text-brandTextDark hover:border-primary hover:text-primary'
                    }`}
                  >
                    {group.products.length > 0 ? 'Browse devices' : 'Ask about this category'}
                  </a>
                  {group.category.key === 'phones-tablets' && (
                    <Link to="/services/buy-iphone/" className="text-sm font-semibold text-primary hover:underline">
                      Open iPhone page
                    </Link>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section id="brand-new-devices" className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Current devices</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">Brand-new devices listed on the site</h2>
            <p className="mt-3 max-w-3xl text-brandTextMedium">
              Browse the devices listed now and message us for model details.
            </p>
          </div>
          <Link to="/services/" className="text-sm font-semibold text-primary hover:underline">
            View all service pages
          </Link>
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-brandBorder bg-white p-8 shadow-sm text-brandTextMedium">
            Loading brand-new inventory...
          </div>
        ) : liveCategoryGroups.length > 0 ? (
          <div className="space-y-8">
            {liveCategoryGroups.map((group) => {
              const Icon = getCategoryIcon(group.category.key)

              return (
                <section key={group.category.key} id={`${group.category.key}-live`} className="rounded-[28px] border border-brandBorder bg-white shadow-sm p-6 md:p-8">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-4">
                      <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brandLight text-primary">
                        <Icon size={24} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{group.category.shortTitle}</p>
                        <h3 className="mt-2 text-xl font-bold text-slate-950">{group.category.title}</h3>
                        <p className="mt-3 max-w-3xl text-brandTextMedium">{group.category.description}</p>
                      </div>
                    </div>

                    <span className="self-start rounded-full border border-brandBorder bg-slate-50 px-4 py-2 text-sm font-semibold text-brandTextDark">
                      Current selection
                    </span>
                  </div>

                  <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {group.products.map((product) => (
                      <article key={product.id} className="overflow-hidden rounded-[24px] border border-brandBorder bg-white shadow-sm">
                        <div className="retail-card-media retail-card-media--contain border-b border-brandBorder bg-white">
                          <RetailImage
                            src={getPrimaryProductImage(product)}
                            alt={`${product.model} ${product.storage} ${product.color}`.trim()}
                            name={product.model}
                            variant="card"
                          />
                        </div>

                        <div className="p-5">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brandTextMedium">
                            Brand new • {product.storage} • {product.color}
                          </p>

                          <h4 className="mt-3 text-base font-bold text-slate-950">{product.model}</h4>
                          <p className="mt-2 text-sm leading-7 text-brandTextMedium">{product.description || `${product.color} ${product.model}`}</p>

                          <div className="mt-4">
                            <p className="text-xl font-bold text-slate-950">AED {product.price.toFixed(0)}</p>
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

                  {group.category.key === 'phones-tablets' && (
                    <div className="mt-6 rounded-[24px] border border-brandBorder bg-slate-50 p-5 text-left">
                      <p className="text-lg font-semibold text-slate-950">Need the iPhone family view instead?</p>
                      <p className="mt-2 text-brandTextMedium">
                        Open the dedicated iPhone page for a family-by-family layout across Pro Max, Pro, Air, and standard iPhone models.
                      </p>
                      <Link
                        to="/services/buy-iphone/"
                        className="mt-4 inline-flex items-center rounded-xl bg-primary px-5 py-3 text-white font-semibold hover:bg-brandGreenDark transition-colors"
                      >
                        Go to Buy iPhone
                      </Link>
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        ) : (
          <div className="rounded-[28px] border border-brandBorder bg-white p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-950">The brand-new catalog is empty right now.</h3>
            <p className="mt-3 max-w-3xl text-brandTextMedium">
              Use the contact form below and the team can help you with the model you want.
            </p>
            <a
              href="#brand-new-contact"
              className="mt-5 inline-flex items-center rounded-xl bg-primary px-5 py-3 text-white font-semibold hover:bg-brandGreenDark transition-colors"
            >
              Request a device
            </a>
          </div>
        )}
      </section>

      {requestCategoryGroups.length > 0 && (
        <section className="rounded-[28px] border border-brandBorder bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold text-slate-950">More categories at PZM</h2>
          <p className="mt-3 max-w-3xl text-brandTextMedium">
            If the category you want is not listed yet, message the team and they can help you source the right device.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {requestCategoryGroups.map((group) => {
              const Icon = getCategoryIcon(group.category.key)

              return (
                <article key={group.category.key} className="rounded-[24px] border border-brandBorder bg-white p-6 shadow-sm">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-primary">
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-5 text-xl font-bold text-slate-950">{group.category.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-brandTextMedium">{group.category.description}</p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {group.category.examples.map((example) => (
                      <span key={example} className="rounded-full border border-brandBorder bg-slate-50 px-3 py-1 text-xs font-semibold text-brandTextDark">
                        {example}
                      </span>
                    ))}
                  </div>

                  <a
                    href="#brand-new-contact"
                    className="mt-6 inline-flex items-center rounded-xl border border-brandBorder px-4 py-3 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary"
                  >
                    Ask about {group.category.shortTitle}
                  </a>
                </article>
              )
            })}
          </div>
        </section>
      )}

      <section className="grid gap-5 md:grid-cols-3">
        <article className="rounded-[28px] border border-brandBorder bg-white p-6 shadow-sm">
          <ShieldCheck className="text-primary" size={22} />
          <h2 className="mt-5 text-xl font-bold text-slate-950">Official warranty coverage</h2>
          <p className="mt-3 text-sm leading-7 text-brandTextMedium">
            Every brand-new device sold by PZM includes official manufacturer warranty.
          </p>
        </article>
        <article className="rounded-[28px] border border-brandBorder bg-white p-6 shadow-sm">
          <Truck className="text-primary" size={22} />
          <h2 className="mt-5 text-xl font-bold text-slate-950">Same-day pickup or delivery</h2>
          <p className="mt-3 text-sm leading-7 text-brandTextMedium">
            Pick up from our Hessa Street store in Al Barsha, or get same-day delivery across Dubai.
          </p>
        </article>
        <article className="rounded-[28px] border border-brandBorder bg-white p-6 shadow-sm">
          <CreditCard className="text-primary" size={22} />
          <h2 className="mt-5 text-xl font-bold text-slate-950">Setup assistance included</h2>
          <p className="mt-3 text-sm leading-7 text-brandTextMedium">
            We offer device setup, data transfer, and accessory guidance.
          </p>
        </article>
      </section>

      <section id="appointment" className="rounded-[28px] border border-brandBorder bg-[linear-gradient(180deg,#f0f7ff_0%,#e8f4fd_100%)] p-6 shadow-sm md:p-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr,0.9fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Book Appointment</p>
            <h2 className="mt-3 text-2xl font-bold text-slate-950">Need help choosing a brand-new device?</h2>
            <p className="mt-4 text-brandTextMedium leading-7">
              Book a quick store or pickup consultation and tell us the model you want.
            </p>
            <div className="mt-5 space-y-2 text-sm text-brandTextDark">
              <p><span className="font-semibold text-primary">1.</span> Tell us the model or budget you need.</p>
              <p><span className="font-semibold text-primary">2.</span> We suggest the right options and pricing.</p>
              <p><span className="font-semibold text-primary">3.</span> Confirm drop-off, pickup, or store visit.</p>
            </div>
          </div>

          <HomeAppointmentPanel sourcePage="/services/brand-new#appointment" defaultServiceType="other-inquiry" />
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr,0.9fr] gap-8 items-start">
        <section className="bg-white rounded-2xl border border-brandBorder shadow-sm p-8 text-left">
          <h2 className="text-xl font-bold text-gray-900 mb-4">How to order</h2>
          <div className="space-y-4 text-brandTextDark">
            <p><span className="font-semibold text-primary">1.</span> Browse the brand-new devices listed above.</p>
            <p><span className="font-semibold text-primary">2.</span> Tap <strong>Contact us</strong> on any product to lock model, color, and price.</p>
            <p><span className="font-semibold text-primary">3.</span> Use appointment booking for guided selection, delivery, or pickup planning.</p>
          </div>
        </section>

        <div id="brand-new-contact">
          <WhatsAppCTA
            title="Looking for a specific device?"
            description="Tell us the model, storage, and color and the team will reply with pricing."
            prefilledMessage="Hi, I'm looking for a specific brand-new device. Can you help me find it? (via pzm.ae/services/brand-new)"
          />
        </div>
      </div>
    </div>
  )
}