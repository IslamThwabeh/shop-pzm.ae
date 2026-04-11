import { useMemo } from 'react'
import type { Product } from '@shared/types'
import IphoneFamilyCard from '../components/IphoneFamilyCard'
import RetailImage from '../components/RetailImage'
import Seo from '../components/Seo'
import WhatsAppCTA from '../components/WhatsAppCTA'
import { buyIphoneFamilies, getBuyIphoneFamilyGroups, getBuyIphoneProducts } from '../content/buyIphoneCatalog'
import { buildSiteUrl, toAbsoluteSiteUrl } from '../utils/siteConfig'

interface BuyIphonePageProps {
  products: Product[]
  loading: boolean
}

export default function BuyIphonePage({ products, loading }: BuyIphonePageProps) {
  const heroImagePath = '/api/media/generated/buy-iphone/iphone-17-pro-max-family.webp'

  const liveIphoneProducts = useMemo(() => getBuyIphoneProducts(products), [products])
  const familyGroups = useMemo(() => getBuyIphoneFamilyGroups(products), [products])
  const availableFamilyCount = familyGroups.filter((group) => group.products.length > 0).length
  const lowestPrice = liveIphoneProducts.length > 0 ? Math.min(...liveIphoneProducts.map((product) => product.price)) : null
  const heroImageUrl = toAbsoluteSiteUrl(heroImagePath)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Buy iPhone in Dubai | PZM',
    url: buildSiteUrl('/services/buy-iphone'),
    description: 'Browse iPhone 15, 16, and 17 families in Dubai with direct WhatsApp ordering and local support from PZM.',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: liveIphoneProducts.slice(0, 16).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: `${product.model} ${product.storage}`.trim(),
          url: buildSiteUrl(`/product/${product.id}`),
          image: [toAbsoluteSiteUrl(product.image_url || product.images?.[0] || heroImagePath)],
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
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <Seo
        title="Buy iPhone 15, 16 and 17 in Dubai | PZM Dubai"
        description="Browse iPhone 15, 16, and 17 families in Dubai with direct WhatsApp ordering and local support from PZM."
        canonicalPath="/services/buy-iphone"
        imageUrl={heroImageUrl}
        jsonLd={jsonLd}
      />

      <section className="overflow-hidden rounded-3xl border border-brandBorder bg-white shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr,0.95fr] lg:items-stretch">
          <div className="p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Apple lineup</p>
            <h1 className="mt-3 text-[1.9rem] font-bold text-slate-950 md:text-[2.4rem]">Buy iPhone in Dubai</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-brandTextMedium md:text-base">
              Browse iPhone 15, 16, and 17 families with direct WhatsApp ordering, storage guidance, and local pickup or delivery support from PZM.
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5 text-xs font-medium text-slate-500">
              <span className="rounded-full border border-brandBorder bg-slate-50 px-3 py-1.5">{liveIphoneProducts.length} models</span>
              <span className="rounded-full border border-brandBorder bg-slate-50 px-3 py-1.5">{availableFamilyCount}/{buyIphoneFamilies.length} families</span>
              <span className="rounded-full border border-brandBorder bg-slate-50 px-3 py-1.5">{lowestPrice ? `From AED ${lowestPrice.toFixed(0)}` : 'Request pricing'}</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#iphone-models"
                className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brandGreenDark"
              >
                Browse families
              </a>
              <a
                href="#buy-iphone-contact"
                className="inline-flex items-center rounded-xl border border-brandBorder px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
              >
                Ask on WhatsApp
              </a>
            </div>
          </div>

          <div className="retail-panel-media min-h-0 bg-slate-100">
            <RetailImage
              src={heroImageUrl}
              alt="iPhone 17 Pro Max family image"
              name="Buy iPhone"
              variant="panel"
              className="h-full w-full object-cover"
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </div>
      </section>

      {/* Family cards grid */}
      {loading ? (
        <div className="rounded-2xl border border-[#eee] bg-white p-8 text-sm text-slate-400">
          Loading iPhone models…
        </div>
      ) : (
        <section id="iphone-models" className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {familyGroups.map((group) => (
            <IphoneFamilyCard key={group.family.key} family={group.family} products={group.products} />
          ))}
        </section>
      )}

      {/* How to order + CTA */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr,0.9fr] items-start">
        <section className="rounded-2xl border border-[#eee] bg-white p-6 text-left">
          <h2 className="text-lg font-bold text-gray-900 mb-3">How to order</h2>
          <div className="space-y-2 text-sm text-slate-700">
            <p><span className="font-semibold text-primary">1.</span> Pick a family card above.</p>
            <p><span className="font-semibold text-primary">2.</span> Choose color &amp; storage, then tap <strong>Inquire</strong>.</p>
            <p><span className="font-semibold text-primary">3.</span> If a combo is missing, message us directly.</p>
          </div>
        </section>

        <div id="buy-iphone-contact">
          <WhatsAppCTA
            title="Can't find your model?"
            description="Tell us the model, storage, and color and we'll reply directly."
            prefilledMessage="Hi, I'm looking for a specific iPhone model. Can you help me find it? (via pzm.ae/services/buy-iphone)"
          />
        </div>
      </div>
    </div>
  )
}