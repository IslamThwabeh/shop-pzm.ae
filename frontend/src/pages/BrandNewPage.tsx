import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, CreditCard, Gamepad2, Laptop, ShieldCheck, Smartphone, Truck } from 'lucide-react'
import type { Product } from '@shared/types'
import Seo from '../components/Seo'
import ServiceRequestForm from '../components/ServiceRequestForm'
import { brandNewCategories, brandNewHero, getBrandNewCategoryGroups, getBrandNewProducts } from '../content/brandNewCatalog'
import { useCart } from '../context/CartContext'
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

  const liveBrandNewProducts = useMemo(
    () => getBrandNewProducts(products).filter((product) => (product.quantity ?? 0) > 0),
    [products]
  )
  const categoryGroups = useMemo(() => getBrandNewCategoryGroups(products), [products])
  const liveCategoryGroups = categoryGroups.filter((group) => group.products.length > 0)
  const requestCategoryGroups = categoryGroups.filter((group) => group.products.length === 0)
  const totalUnits = liveBrandNewProducts.reduce((sum, product) => sum + (product.quantity ?? 0), 0)
  const lowestPrice = liveBrandNewProducts.length > 0 ? Math.min(...liveBrandNewProducts.map((product) => product.price)) : null
  const heroImageUrl = toAbsoluteSiteUrl(brandNewHero.imageUrl)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Brand New Devices in Dubai | PZM',
    url: buildSiteUrl('/services/brand-new'),
    description:
      'Browse brand-new devices in Dubai with live iPhone stock, direct checkout, and availability requests for categories that are not yet listed in the storefront.',
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
            availability: product.quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
          },
        },
      })),
    },
  }

  return (
    <div className="space-y-10">
      <Seo
        title="Brand New Devices in Dubai | PZM"
        description="Browse brand-new devices in Dubai with live iPhone stock, direct checkout, and availability requests for laptops, gaming hardware, and other new arrivals."
        canonicalPath="/services/brand-new"
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
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">Brand-new retail</p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Brand-new devices with live stock where it matters most</h1>
            <p className="text-lg text-brandTextMedium max-w-3xl mb-6">
              This page covers the same new-device intent as the legacy brand-new route: phones, tablets, laptops, gaming hardware, and business setups.
              Today the live storefront is strongest in the iPhone lineup, and the rest can still convert through quick availability requests.
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="rounded-2xl border border-brandBorder bg-slate-50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brandTextMedium">Live SKUs</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{liveBrandNewProducts.length}</p>
              </div>
              <div className="rounded-2xl border border-brandBorder bg-slate-50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brandTextMedium">Units in stock</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{totalUnits}</p>
              </div>
              <div className="rounded-2xl border border-brandBorder bg-slate-50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brandTextMedium">Categories live</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{liveCategoryGroups.length}/{brandNewCategories.length}</p>
              </div>
              <div className="rounded-2xl border border-brandBorder bg-slate-50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brandTextMedium">Starting from</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{lowestPrice ? `AED ${lowestPrice.toFixed(0)}` : 'Request'}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              <a
                href="#brand-new-live-stock"
                className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-white font-semibold hover:bg-brandGreenDark transition-colors"
              >
                Browse Brand-New Stock
              </a>
              <Link
                to="/services/buy-iphone"
                className="inline-flex items-center rounded-xl border border-brandBorder px-5 py-3 text-brandTextDark font-semibold hover:border-primary hover:text-primary transition-colors"
              >
                View iPhone Collection
              </Link>
              <a
                href="#brand-new-request-form"
                className="inline-flex items-center rounded-xl border border-brandBorder px-5 py-3 text-brandTextDark font-semibold hover:border-primary hover:text-primary transition-colors"
              >
                Ask About a Model
              </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {brandNewCategories.map((category) => (
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
            <img src={brandNewHero.imageUrl} alt={brandNewHero.imageAlt} className="h-full w-full object-cover" />
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
                  {group.products.length > 0 ? `${group.products.length} live` : 'Request'}
                </span>
              </div>

              <h2 className="mt-5 text-2xl font-bold text-slate-950">{group.category.title}</h2>
              <p className="mt-3 text-sm leading-7 text-brandTextDark">{group.category.description}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {group.category.examples.slice(0, 4).map((example) => (
                  <span key={example} className="rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold text-brandTextDark">
                    {example}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={group.products.length > 0 ? `#${group.category.key}-live` : '#brand-new-request-form'}
                  className="inline-flex items-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-brandTextDark transition-colors hover:text-primary"
                >
                  {group.products.length > 0 ? 'See live stock' : 'Request availability'}
                </a>
                {group.category.key === 'phones-tablets' && (
                  <Link
                    to="/services/buy-iphone"
                    className="inline-flex items-center rounded-xl border border-white/80 px-4 py-3 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary"
                  >
                    Open iPhone page
                  </Link>
                )}
              </div>
            </article>
          )
        })}
      </section>

      <section id="brand-new-live-stock" className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Live stock</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">Current brand-new devices on the site</h2>
            <p className="mt-3 max-w-3xl text-brandTextMedium">
              This section is powered by the live storefront catalog so price, stock, and product actions stay aligned with the actual checkout flow.
            </p>
          </div>
          <Link to="/services" className="text-sm font-semibold text-primary hover:underline">
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
                            src={product.image_url || product.images?.[0] || brandNewHero.imageUrl}
                            alt={product.model}
                            className="h-full w-full object-contain"
                          />
                        </div>

                        <div className="p-5">
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brandTextDark">
                              Brand New
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

                  {group.category.key === 'phones-tablets' && (
                    <div className="mt-6 rounded-[24px] border border-brandBorder bg-brandLight p-5 text-left">
                      <p className="text-lg font-semibold text-slate-950">Need the iPhone family view instead?</p>
                      <p className="mt-2 text-brandTextMedium">
                        Open the dedicated iPhone page for a family-by-family layout across Pro Max, Pro, Air, and standard iPhone models.
                      </p>
                      <Link
                        to="/services/buy-iphone"
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
            <h3 className="text-2xl font-bold text-slate-950">The live brand-new catalog is empty right now.</h3>
            <p className="mt-3 max-w-3xl text-brandTextMedium">
              Use the request form below and the team can confirm stock, pricing, or the closest available alternative for the model you want.
            </p>
            <a
              href="#brand-new-request-form"
              className="mt-5 inline-flex items-center rounded-xl bg-primary px-5 py-3 text-white font-semibold hover:bg-brandGreenDark transition-colors"
            >
              Request a brand-new device
            </a>
          </div>
        )}
      </section>

      {requestCategoryGroups.length > 0 && (
        <section className="rounded-[28px] border border-brandBorder bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950">More brand-new categories you can request now</h2>
          <p className="mt-3 max-w-3xl text-brandTextMedium">
            The broader brand-new route covers more than the current live listings. If the category you want is not on the storefront yet, send an availability request and the team can confirm stock, pricing, or the closest option.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {requestCategoryGroups.map((group) => {
              const Icon = getCategoryIcon(group.category.key)

              return (
                <article key={group.category.key} className={`rounded-[24px] border border-brandBorder bg-gradient-to-br ${group.category.accentClassName} p-6`}>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-primary shadow-sm">
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-5 text-xl font-bold text-slate-950">{group.category.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-brandTextDark">{group.category.description}</p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {group.category.examples.map((example) => (
                      <span key={example} className="rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold text-brandTextDark">
                        {example}
                      </span>
                    ))}
                  </div>

                  <a
                    href="#brand-new-request-form"
                    className="mt-6 inline-flex items-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-brandTextDark transition-colors hover:text-primary"
                  >
                    Request {group.category.shortTitle}
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
          <h2 className="mt-5 text-xl font-bold text-slate-950">Stock and version checks</h2>
          <p className="mt-3 text-sm leading-7 text-brandTextMedium">
            Ask the team about color, storage, region version, and warranty guidance before you place the order.
          </p>
        </article>
        <article className="rounded-[28px] border border-brandBorder bg-white p-6 shadow-sm">
          <Truck className="text-primary" size={22} />
          <h2 className="mt-5 text-xl font-bold text-slate-950">Pickup or delivery support</h2>
          <p className="mt-3 text-sm leading-7 text-brandTextMedium">
            Use the live storefront for direct checkout, then confirm pickup at the Hessa Street branch or delivery details for Dubai.
          </p>
        </article>
        <article className="rounded-[28px] border border-brandBorder bg-white p-6 shadow-sm">
          <CreditCard className="text-primary" size={22} />
          <h2 className="mt-5 text-xl font-bold text-slate-950">Payment and setup help</h2>
          <p className="mt-3 text-sm leading-7 text-brandTextMedium">
            Compare models, ask about accessories, and confirm the right configuration before you commit to the purchase.
          </p>
        </article>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr,0.9fr] gap-8 items-start">
        <section className="bg-white rounded-2xl border border-brandBorder shadow-sm p-8 text-left">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What happens next</h2>
          <div className="space-y-4 text-brandTextDark">
            <p><span className="font-semibold text-primary">1.</span> Browse the live brand-new products listed on this page.</p>
            <p><span className="font-semibold text-primary">2.</span> Open product details or add in-stock devices straight to the cart.</p>
            <p><span className="font-semibold text-primary">3.</span> If your category or model is missing, send an availability request and the team will follow up.</p>
          </div>
        </section>

        <div id="brand-new-request-form">
          <ServiceRequestForm
            serviceSlug={service.slug}
            serviceTitle={service.title}
            sourcePath="/services/brand-new"
            requestKinds={service.requestKinds}
          />
        </div>
      </div>
    </div>
  )
}