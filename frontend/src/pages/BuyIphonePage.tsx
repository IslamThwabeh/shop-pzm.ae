import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import type { Product } from '@shared/types'
import RetailImage from '../components/RetailImage'
import Seo from '../components/Seo'
import WhatsAppCTA from '../components/WhatsAppCTA'
import { buyIphoneFamilies, getBuyIphoneFamilyGroups, getBuyIphoneProducts } from '../content/buyIphoneCatalog'
import { getPrimaryProductImage } from '../utils/productPresentation'
import { openWhatsAppLead } from '../utils/whatsappLead'
import { resolveServiceSlug } from '../content/serviceCatalog'
import { buildCanonicalUrl, buildSiteUrl, toAbsoluteSiteUrl } from '../utils/siteConfig'

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

function getFamilyDisplayImage(family: typeof buyIphoneFamilies[number], products: Product[]) {
  return getPrimaryProductImage(products[0]) || family.imageUrl
}

export default function BuyIphonePage({ products, loading }: BuyIphonePageProps) {
  const service = resolveServiceSlug('buy-iphone')

  if (!service) {
    return null
  }

  const handleWhatsApp = (product: Product) => {
    openWhatsAppLead({
      leadType: 'product',
      referenceId: product.id,
      referenceLabel: `${product.model} ${product.storage} ${product.color}`,
      referencePrice: product.price,
      sourcePage: '/services/buy-iphone',
    })
  }

  const liveIphoneProducts = useMemo(() => getBuyIphoneProducts(products), [products])
  const familyGroups = useMemo(() => getBuyIphoneFamilyGroups(products), [products])
  const availableFamilyCount = familyGroups.filter((group) => group.products.length > 0).length
  const missingFamilies = familyGroups.filter((group) => group.products.length === 0)
  const lowestPrice = liveIphoneProducts.length > 0 ? Math.min(...liveIphoneProducts.map((product) => product.price)) : null
  const heroImageUrl = toAbsoluteSiteUrl(buyIphoneFamilies[0].imageUrl)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Buy iPhone in Dubai | PZM',
    url: buildCanonicalUrl('/services/buy-iphone'),
    description: 'Buy iPhone in Dubai from PZM with direct WhatsApp ordering and local support.',
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
        description="Buy iPhone in Dubai from PZM with direct WhatsApp ordering and local support."
        canonicalPath="/services/buy-iphone"
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
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Apple retail</p>
          <h1 className="mt-4 text-[2rem] font-bold text-slate-950 md:text-[2.45rem]">Buy iPhone 17 Pro Max, Pro, Air &amp; iPhone 17 in Dubai</h1>
          <p className="mt-4 text-[0.98rem] leading-7 text-brandTextMedium md:text-base">
            Latest iPhone 17 Pro Max, iPhone 17 Pro, iPhone 17 Air, and iPhone 17 in Dubai. Browse the lineup, then message us for the exact storage and color you want.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-semibold text-brandTextMedium">
          <span>{liveIphoneProducts.length} models listed</span>
          <span>{availableFamilyCount}/{buyIphoneFamilies.length} families listed</span>
          <span>{lowestPrice ? `From AED ${lowestPrice.toFixed(0)}` : 'Request pricing'}</span>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="#iphone-models"
            className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-white font-semibold transition-colors hover:bg-brandGreenDark"
          >
            Browse iPhone Models
          </a>
          <a
            href="#buy-iphone-contact"
            className="inline-flex items-center rounded-xl border border-brandBorder px-5 py-3 text-brandTextDark font-semibold transition-colors hover:border-primary hover:text-primary"
          >
            Ask About a Model
          </a>
        </div>
      </section>

      <section className="space-y-4">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Shop by family</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">Start with the iPhone family</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {buyIphoneFamilies.map((family) => {
            const familyGroup = familyGroups.find((group) => group.family.key === family.key)
            const liveCount = familyGroup?.products.length ?? 0
            const familyImage = getFamilyDisplayImage(family, familyGroup?.products || [])

            return (
              <a
                key={family.key}
                href={`#${family.key}`}
                className="group rounded-[28px] border border-brandBorder bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary"
              >
                <div className="retail-card-media retail-card-media--contain rounded-[24px]">
                  <RetailImage
                    src={familyImage}
                    alt={family.imageAlt}
                    name={family.title}
                    variant="card"
                    className="transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-brandTextMedium">{family.shortTitle}</p>
                <h3 className="mt-2 text-xl font-bold text-slate-950">{family.title}</h3>
                <p className="mt-3 text-sm leading-7 text-brandTextMedium">{family.description}</p>
                <span
                  className={`mt-5 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                    liveCount > 0
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-brandBorder bg-slate-50 text-brandTextMedium'
                  }`}
                >
                  {liveCount > 0 ? 'Listed now' : 'Message us'}
                </span>
              </a>
            )
          })}
        </div>
      </section>

      <section id="iphone-models" className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Current lineup</p>
            <h2 className="mt-2 text-[2rem] font-bold text-slate-950 md:text-[2.25rem]">Current iPhone models on the site</h2>
            <p className="mt-3 max-w-3xl text-brandTextMedium">
              Browse the iPhone models listed now and message us for the one you want.
            </p>
          </div>
          <Link to="/services/" className="text-sm font-semibold text-primary hover:underline">
            View all service pages
          </Link>
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-brandBorder bg-white p-8 shadow-sm text-brandTextMedium">
            Loading iPhone models...
          </div>
        ) : (
          <div className="space-y-8">
            {familyGroups.map((group) => (
              <section key={group.family.key} id={group.family.key} className="rounded-[28px] border border-brandBorder bg-white shadow-sm p-6 md:p-8">
                {/** Display the live family image when it exists, otherwise fall back to the catalog family artwork. */}
                {(() => {
                  const familyImage = getFamilyDisplayImage(group.family, group.products)

                  return (
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[20px] bg-slate-100 md:h-28 md:w-28">
                      <RetailImage
                        src={familyImage}
                        alt={group.family.imageAlt}
                        name={group.family.title}
                        variant="thumb"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{group.family.shortTitle}</p>
                      <h3 className="mt-2 text-2xl font-bold text-slate-950">{group.family.title}</h3>
                      <p className="mt-3 max-w-2xl text-brandTextMedium">{group.family.description}</p>
                    </div>
                  </div>

                  <span className="self-start rounded-full border border-brandBorder bg-slate-50 px-4 py-2 text-sm font-semibold text-brandTextDark">
                    {group.products.length > 0 ? 'Listed now' : 'Ask us'}
                  </span>
                </div>
                  )
                })()}

                {group.products.length > 0 ? (
                  <div className="mt-6 overflow-hidden rounded-[24px] border border-brandBorder">
                    {group.products.map((product) => (
                      <article key={product.id} className="flex flex-col gap-4 border-t border-brandBorder/70 p-5 first:border-t-0 md:flex-row md:items-center md:justify-between">
                        <div className="flex min-w-0 flex-1 items-start gap-4">
                          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[20px] border border-brandBorder bg-white">
                            <RetailImage
                              src={getPrimaryProductImage(product) || group.family.imageUrl}
                              alt={`${product.model} ${product.storage} ${product.color}`.trim()}
                              name={product.model}
                              variant="thumb"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brandTextMedium">
                              {product.storage} • {product.color}
                            </p>
                            <h4 className="mt-3 text-lg font-bold text-slate-950">{getVariantDescriptor(product, group.family.title)}</h4>
                            <p className="mt-2 text-sm leading-7 text-brandTextMedium">{product.description || product.model}</p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-4 md:min-w-[220px] md:items-end">
                          <div className="text-left md:text-right">
                            <p className="text-2xl font-bold text-slate-950">AED {product.price.toFixed(0)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleWhatsApp(product)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-brandBorder px-4 py-3 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary md:w-full"
                          >
                            <MessageCircle size={16} className="text-[#25D366]" />
                            Contact us
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-[24px] border border-dashed border-brandBorder bg-slate-50 p-6">
                    <p className="text-lg font-semibold text-slate-950">This family is not listed right now.</p>
                    <p className="mt-2 text-brandTextMedium">
                      Ask the team about the closest configuration while this family is still being added to the storefront.
                    </p>
                    <a
                      href="#buy-iphone-contact"
                      className="mt-4 inline-flex items-center rounded-xl bg-primary px-5 py-3 text-white font-semibold hover:bg-brandGreenDark transition-colors"
                    >
                      Ask about {group.family.title}
                    </a>
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </section>

      {missingFamilies.length > 0 && (
        <section className="rounded-[28px] border border-brandBorder bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold text-slate-950">More iPhone families at PZM</h2>
          <p className="mt-3 max-w-3xl text-brandTextMedium">
            If a family is not listed yet, message the team and they can suggest the closest current option.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {missingFamilies.map((group) => (
              <article key={group.family.key} className="rounded-[24px] border border-brandBorder bg-white p-6 shadow-sm">
                <div className="retail-card-media retail-card-media--contain rounded-[20px] border border-brandBorder">
                  <RetailImage
                    src={group.family.imageUrl}
                    alt={group.family.imageAlt}
                    name={group.family.title}
                    variant="card"
                  />
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-950">{group.family.title}</h3>
                <p className="mt-3 text-sm leading-7 text-brandTextMedium">{group.family.description}</p>
                <a
                  href="#buy-iphone-contact"
                  className="mt-5 inline-flex items-center rounded-xl border border-brandBorder px-4 py-3 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary"
                >
                  Ask about this family
                </a>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr,0.9fr] gap-8 items-start">
        <section className="bg-white rounded-2xl border border-brandBorder shadow-sm p-8 text-left">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How to order</h2>
          <div className="space-y-4 text-brandTextDark">
            <p><span className="font-semibold text-primary">1.</span> Browse the iPhone models directly on this page.</p>
            <p><span className="font-semibold text-primary">2.</span> Tap <strong>Contact us</strong> on any product to start a WhatsApp conversation.</p>
            <p><span className="font-semibold text-primary">3.</span> If the model you want is missing, message us and the team will follow up.</p>
          </div>
        </section>

        <div id="buy-iphone-contact">
          <WhatsAppCTA
            title="Can't find your iPhone model?"
            description="Tell us the model, storage, and color you want and the team will reply directly."
            prefilledMessage="Hi, I'm looking for a specific iPhone model. Can you help me find it? (via pzm.ae/services/buy-iphone)"
          />
        </div>
      </div>
    </div>
  )
}