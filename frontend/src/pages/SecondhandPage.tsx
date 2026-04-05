import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BatteryCharging, Gamepad2, Laptop, RefreshCcw, ShieldCheck, Smartphone, Tablet } from 'lucide-react'
import type { Product } from '@shared/types'
import Seo from '../components/Seo'
import ServiceRequestForm from '../components/ServiceRequestForm'
import { getSecondhandCategoryGroups, getSecondhandProducts, secondhandCategories, secondhandHero } from '../content/secondhandCatalog'
import { useCart } from '../context/CartContext'
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
  const { addItem } = useCart()

  if (!service) {
    return null
  }

  const handleAddToCart = (product: Product) => {
    if ((product.quantity ?? 0) <= 0) {
      return
    }

    addItem({
      id: product.id,
      model: product.model,
      price: product.price,
      quantity: 1,
      color: product.color,
      storage: product.storage,
      condition: product.condition,
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
  const primaryCtaHref = liveSecondhandProducts.length > 0 ? '#secondhand-live-stock' : '#secondhand-request-form'
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

      <section className="overflow-hidden rounded-[32px] border border-brandBorder bg-white shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr,0.95fr] lg:items-stretch">
          <div className="p-8 md:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">Certified pre-owned</p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Used devices with clear condition guidance and real next steps</h1>
            <p className="text-lg text-brandTextMedium max-w-3xl mb-6">
              Use this page for certified pre-owned iPhones, phones, laptops, tablets, and gaming devices. When live used stock is listed, it appears here directly. When it is not, you can still ask about model, storage, condition, battery health, and pricing before you visit.
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="rounded-2xl border border-brandBorder bg-slate-50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brandTextMedium">Live used SKUs</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{liveSecondhandProducts.length}</p>
              </div>
              <div className="rounded-2xl border border-brandBorder bg-slate-50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brandTextMedium">Categories covered</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{secondhandCategories.length}</p>
              </div>
              <div className="rounded-2xl border border-brandBorder bg-slate-50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brandTextMedium">Currently listed</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{liveCategoryGroups.length}/{secondhandCategories.length}</p>
              </div>
              <div className="rounded-2xl border border-brandBorder bg-slate-50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brandTextMedium">Starting from</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{lowestPrice ? `AED ${lowestPrice.toFixed(0)}` : 'Ask us'}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              <a
                href={primaryCtaHref}
                className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-white font-semibold hover:bg-brandGreenDark transition-colors"
              >
                {primaryCtaLabel}
              </a>
              <Link
                to="/services/sell-gadgets"
                className="inline-flex items-center rounded-xl border border-brandBorder px-5 py-3 text-brandTextDark font-semibold hover:border-primary hover:text-primary transition-colors"
              >
                Trade In Your Device
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center rounded-xl border border-brandBorder px-5 py-3 text-brandTextDark font-semibold hover:border-primary hover:text-primary transition-colors"
              >
                Browse Full Shop
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {secondhandCategories.map((category) => (
                <a
                  key={category.key}
                  href={`#${category.key}`}
                  className="rounded-2xl border border-brandBorder px-4 py-3 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary"
                >
                  {category.shortTitle}
                </a>
              ))}
            </div>
          </div>

          <div className="min-h-[220px] md:min-h-[280px] bg-slate-100">
            <img src={secondhandHero.imageUrl} alt={secondhandHero.imageAlt} className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {categoryGroups.map((group) => {
          const Icon = getCategoryIcon(group.category.key)

          return (
            <article
              key={group.category.key}
              id={group.category.key}
              className={`rounded-[28px] border border-brandBorder bg-gradient-to-br ${group.category.accentClassName} p-6 shadow-sm`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-primary shadow-sm">
                  <Icon size={22} />
                </span>
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brandTextDark">
                  {group.products.length > 0 ? `${group.products.length} live` : 'Request now'}
                </span>
              </div>

              <h2 className="mt-5 text-2xl font-bold text-slate-950">{group.category.title}</h2>
              <p className="mt-3 text-sm leading-7 text-brandTextDark">{group.category.description}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {group.category.examples.map((example) => (
                  <span key={example} className="rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold text-brandTextDark">
                    {example}
                  </span>
                ))}
              </div>

              <a
                href={group.products.length > 0 ? '#secondhand-live-stock' : '#secondhand-request-form'}
                className="mt-6 inline-flex items-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-brandTextDark transition-colors hover:text-primary"
              >
                {group.products.length > 0 ? 'See live stock' : 'Request availability'}
              </a>
            </article>
          )
        })}
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
          <Link to="/shop" className="text-sm font-semibold text-primary hover:underline">
            Browse full shop
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

                    <span className="self-start rounded-full bg-brandLight px-4 py-2 text-sm font-semibold text-primary">
                      {group.products.length} live products
                    </span>
                  </div>

                  <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {group.products.map((product) => (
                      <article key={product.id} className="overflow-hidden rounded-[24px] border border-brandBorder bg-slate-50">
                        <div className="aspect-[4/3] bg-white p-4">
                          <img
                            src={product.image_url || product.images?.[0] || secondhandHero.imageUrl}
                            alt={product.model}
                            className="h-full w-full object-contain"
                          />
                        </div>

                        <div className="p-5">
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brandTextDark">
                              Used
                            </span>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brandTextDark">
                              {product.storage}
                            </span>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brandTextDark">
                              {product.color}
                            </span>
                          </div>

                          <h4 className="mt-4 text-lg font-bold text-slate-950">{product.model}</h4>
                          <p className="mt-2 text-sm leading-7 text-brandTextMedium">{product.description || `${product.color} ${product.model}`}</p>

                          <div className="mt-4 flex items-end justify-between gap-4">
                            <div>
                              <p className="text-2xl font-bold text-primary">AED {product.price.toFixed(0)}</p>
                              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-brandTextMedium">Cash on delivery</p>
                            </div>
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                              {(product.quantity ?? 0) > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                            </span>
                          </div>

                          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <Link
                              to={`/product/${product.id}`}
                              className="inline-flex items-center justify-center rounded-xl border border-brandBorder px-4 py-3 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary"
                            >
                              View details
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleAddToCart(product)}
                              disabled={(product.quantity ?? 0) <= 0}
                              className={`inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                                (product.quantity ?? 0) > 0
                                  ? 'bg-primary text-white hover:bg-brandGreenDark'
                                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              {(product.quantity ?? 0) > 0 ? 'Add to cart' : 'Out of stock'}
                            </button>
                          </div>
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
                href="#secondhand-request-form"
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

      <section className="grid gap-5 md:grid-cols-3">
        <article className="rounded-[28px] border border-brandBorder bg-white p-6 shadow-sm">
          <ShieldCheck className="text-primary" size={22} />
          <h2 className="mt-5 text-xl font-bold text-slate-950">Condition and testing guidance</h2>
          <p className="mt-3 text-sm leading-7 text-brandTextMedium">
            Ask about cosmetic wear, battery health, charging, cameras, screen condition, and any other checks you want confirmed before you buy.
          </p>
        </article>
        <article className="rounded-[28px] border border-brandBorder bg-white p-6 shadow-sm">
          <BatteryCharging className="text-primary" size={22} />
          <h2 className="mt-5 text-xl font-bold text-slate-950">Warranty and setup support</h2>
          <p className="mt-3 text-sm leading-7 text-brandTextMedium">
            Many used devices include short warranty support and setup guidance. Ask the team for the exact warranty and support path for the model you want.
          </p>
        </article>
        <article className="rounded-[28px] border border-brandBorder bg-white p-6 shadow-sm">
          <RefreshCcw className="text-primary" size={22} />
          <h2 className="mt-5 text-xl font-bold text-slate-950">Trade-in and upgrade path</h2>
          <p className="mt-3 text-sm leading-7 text-brandTextMedium">
            If you are upgrading from an older phone or laptop, use the sell-device route to check trade-in value before you commit to the replacement.
          </p>
        </article>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr,0.9fr] gap-8 items-start">
        <section className="bg-white rounded-2xl border border-brandBorder shadow-sm p-8 text-left">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What happens next</h2>
          <div className="space-y-4 text-brandTextDark">
            <p><span className="font-semibold text-primary">1.</span> Tell us the model, budget, storage, and condition level you want.</p>
            <p><span className="font-semibold text-primary">2.</span> The team checks current used options, pricing, and condition details for the closest match.</p>
            <p><span className="font-semibold text-primary">3.</span> You get a follow-up with the next step, whether that is visiting the store, confirming availability, or comparing alternatives.</p>
          </div>
        </section>

        <div id="secondhand-request-form">
          <ServiceRequestForm
            serviceSlug={service.slug}
            serviceTitle={service.title}
            sourcePath="/services/secondhand"
            requestKinds={service.requestKinds}
          />
        </div>
      </div>
    </div>
  )
}