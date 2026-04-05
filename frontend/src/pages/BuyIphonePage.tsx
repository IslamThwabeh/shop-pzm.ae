import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '@shared/types'
import Seo from '../components/Seo'
import ServiceRequestForm from '../components/ServiceRequestForm'
import { buyIphoneFamilies, getBuyIphoneFamilyGroups, getBuyIphoneProducts } from '../content/buyIphoneCatalog'
import { useCart } from '../context/CartContext'
import { resolveServiceSlug } from '../content/serviceCatalog'
import { buildSiteUrl, toAbsoluteSiteUrl } from '../utils/siteConfig'

const mapsLink = 'https://maps.app.goo.gl/e5Rhfo8YY3i8CatM7?g_st=ic'

interface BuyIphonePageProps {
  products: Product[]
  loading: boolean
}

function getVariantDescriptor(product: Product, familyTitle: string) {
  const familyPattern = new RegExp(familyTitle.replace(/\s+/g, '\\s+'), 'i')
  const descriptor = product.model.replace(familyPattern, '').replace(/\s+/g, ' ').trim()
  return descriptor || product.model
}

export default function BuyIphonePage({ products, loading }: BuyIphonePageProps) {
  const service = resolveServiceSlug('buy-iphone')
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

  const liveIphoneProducts = useMemo(
    () => getBuyIphoneProducts(products).filter((product) => (product.quantity ?? 0) > 0),
    [products]
  )
  const familyGroups = useMemo(() => getBuyIphoneFamilyGroups(products), [products])
  const availableFamilyCount = familyGroups.filter((group) => group.products.length > 0).length
  const missingFamilies = familyGroups.filter((group) => group.products.length === 0)
  const lowestPrice = liveIphoneProducts.length > 0 ? Math.min(...liveIphoneProducts.map((product) => product.price)) : null
  const heroImageUrl = toAbsoluteSiteUrl(buyIphoneFamilies[0].imageUrl)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Buy iPhone in Dubai | PZM',
    url: buildSiteUrl('/services/buy-iphone'),
    description:
      'Buy iPhone in Dubai with live stock, direct checkout, and fast availability support for missing configurations from PZM.',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: liveIphoneProducts.slice(0, 16).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: `${product.model} ${product.storage}`.trim(),
          url: buildSiteUrl(`/product/${product.id}`),
          image: [toAbsoluteSiteUrl(product.image_url || product.images?.[0] || buyIphoneFamilies[0].imageUrl)],
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
        title="Buy iPhone 17 Pro Max, Pro, Air & iPhone 17 in Dubai | PZM"
        description="Buy iPhone in Dubai with live stock, direct checkout, and availability support for missing models from the PZM team."
        canonicalPath="/services/buy-iphone"
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
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">New iPhone collection</p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Buy iPhone in Dubai with live stock and direct checkout</h1>
            <p className="text-lg text-brandTextMedium max-w-3xl mb-6">
              Browse current iPhone 17 Pro Max, Pro, Air, and iPhone 17 models on this page, then move into product details or checkout when you are ready. If a configuration is missing, the request form keeps the conversation on-site.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="rounded-2xl border border-brandBorder bg-slate-50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brandTextMedium">Live variants</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{liveIphoneProducts.length}</p>
              </div>
              <div className="rounded-2xl border border-brandBorder bg-slate-50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brandTextMedium">Families live</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{availableFamilyCount}/{buyIphoneFamilies.length}</p>
              </div>
              <div className="rounded-2xl border border-brandBorder bg-slate-50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brandTextMedium">Starting price</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{lowestPrice ? `AED ${lowestPrice.toFixed(0)}` : 'Request'}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              <a
                href="#iphone-live-stock"
                className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-white font-semibold hover:bg-brandGreenDark transition-colors"
              >
                Browse Live iPhone Stock
              </a>
              <a
                href="#buy-iphone-request-form"
                className="inline-flex items-center rounded-xl border border-brandBorder px-5 py-3 text-brandTextDark font-semibold hover:border-primary hover:text-primary transition-colors"
              >
                Request Missing Model
              </a>
              <Link
                to="/services"
                className="inline-flex items-center rounded-xl border border-brandBorder px-5 py-3 text-brandTextDark font-semibold hover:border-primary hover:text-primary transition-colors"
              >
                View All Service Pages
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {buyIphoneFamilies.map((family) => (
                <a
                  key={family.key}
                  href={`#${family.key}`}
                  className="rounded-2xl border border-brandBorder px-4 py-3 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary"
                >
                  {family.title}
                </a>
              ))}
            </div>
          </div>

          <div className="min-h-[220px] md:min-h-[260px] bg-slate-100">
            <img src={buyIphoneFamilies[0].imageUrl} alt={buyIphoneFamilies[0].imageAlt} className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-brandBorder bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-950">Why this page works</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3 text-brandTextDark">
          <p>• Live iPhone stock is visible directly on the page so buyers do not have to guess what is listed.</p>
          <p>• Families, prices, and configurations are easier to compare before you open the product detail page.</p>
          <p>• Missing models can still convert through an availability request when the exact configuration is not listed yet.</p>
        </div>
      </section>

      <section id="iphone-live-stock" className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Live stock</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">Current iPhone inventory on the site</h2>
            <p className="mt-3 max-w-3xl text-brandTextMedium">
              This section is driven by the live product catalog so pricing, stock, and product actions stay aligned with the storefront.
            </p>
          </div>
          <Link to="/services" className="text-sm font-semibold text-primary hover:underline">
            View all service pages
          </Link>
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-brandBorder bg-white p-8 shadow-sm text-brandTextMedium">
            Loading live iPhone inventory...
          </div>
        ) : (
          <div className="space-y-8">
            {familyGroups.map((group) => (
              <section key={group.family.key} id={group.family.key} className="rounded-[28px] border border-brandBorder bg-white shadow-sm p-6 md:p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[20px] bg-slate-100 md:h-28 md:w-28">
                      <img src={group.family.imageUrl} alt={group.family.imageAlt} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{group.family.shortTitle}</p>
                      <h3 className="mt-2 text-2xl font-bold text-slate-950">{group.family.title}</h3>
                      <p className="mt-3 max-w-2xl text-brandTextMedium">{group.family.description}</p>
                    </div>
                  </div>

                  <span className="self-start rounded-full bg-brandLight px-4 py-2 text-sm font-semibold text-primary">
                    {group.products.length > 0 ? `${group.products.length} live variants` : 'Not yet in live catalog'}
                  </span>
                </div>

                {group.products.length > 0 ? (
                  <div className="mt-6 overflow-hidden rounded-[24px] border border-brandBorder">
                    {group.products.map((product) => (
                      <article
                        key={product.id}
                        className="flex flex-col gap-4 border-t border-brandBorder/70 p-5 first:border-t-0 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brandTextDark">
                              {product.storage}
                            </span>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brandTextDark">
                              {product.color}
                            </span>
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                              {(product.quantity ?? 0) > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                            </span>
                          </div>
                          <h4 className="mt-3 text-lg font-bold text-slate-950">{getVariantDescriptor(product, group.family.title)}</h4>
                          <p className="mt-2 text-sm leading-7 text-brandTextMedium">{product.description || product.model}</p>
                        </div>

                        <div className="flex flex-col gap-4 md:min-w-[220px] md:items-end">
                          <div className="text-left md:text-right">
                            <p className="text-2xl font-bold text-primary">AED {product.price.toFixed(0)}</p>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-brandTextMedium">Cash on delivery</p>
                          </div>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:w-full">
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
                ) : (
                  <div className="mt-6 rounded-[24px] border border-dashed border-brandBorder bg-slate-50 p-6">
                    <p className="text-lg font-semibold text-slate-950">This family is not listed in the live catalog right now.</p>
                    <p className="mt-2 text-brandTextMedium">
                      Ask the team about availability and the closest configuration while this family is still being added to the storefront.
                    </p>
                    <a
                      href="#buy-iphone-request-form"
                      className="mt-4 inline-flex items-center rounded-xl bg-primary px-5 py-3 text-white font-semibold hover:bg-brandGreenDark transition-colors"
                    >
                      Request {group.family.title}
                    </a>
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </section>

      {missingFamilies.length > 0 && (
        <section className="rounded-[28px] border border-brandBorder bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950">More iPhone families you can ask about</h2>
          <p className="mt-3 max-w-3xl text-brandTextMedium">
            If a family is not listed yet, use the request form and the team can confirm availability or suggest the closest current option.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {missingFamilies.map((group) => (
              <article key={group.family.key} className="overflow-hidden rounded-[24px] border border-brandBorder bg-slate-50">
                <div className="h-32 bg-slate-100">
                  <img src={group.family.imageUrl} alt={group.family.imageAlt} className="h-full w-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-950">{group.family.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-brandTextMedium">{group.family.description}</p>
                  <a
                    href="#buy-iphone-request-form"
                    className="mt-5 inline-flex items-center rounded-xl border border-brandBorder px-4 py-3 text-sm font-semibold text-brandTextDark hover:border-primary hover:text-primary transition-colors"
                  >
                    Request availability
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr,0.9fr] gap-8 items-start">
        <section className="bg-white rounded-2xl border border-brandBorder shadow-sm p-8 text-left">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What happens next</h2>
          <div className="space-y-4 text-brandTextDark">
            <p><span className="font-semibold text-primary">1.</span> Browse the live iPhone variants directly on this page.</p>
            <p><span className="font-semibold text-primary">2.</span> Open product details or add in-stock devices straight to the cart.</p>
            <p><span className="font-semibold text-primary">3.</span> If the model you want is missing, send an availability request and the team will follow up.</p>
          </div>
        </section>

        <div id="buy-iphone-request-form">
          <ServiceRequestForm
            serviceSlug={service.slug}
            serviceTitle={service.title}
            sourcePath="/services/buy-iphone"
            requestKinds={service.requestKinds}
          />
        </div>
      </div>
    </div>
  )
}