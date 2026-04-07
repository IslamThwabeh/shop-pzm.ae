import { useMemo } from 'react'
import type { Product } from '@shared/types'
import IphoneFamilyCard from '../components/IphoneFamilyCard'
import Seo from '../components/Seo'
import WhatsAppCTA from '../components/WhatsAppCTA'
import { buyIphoneFamilies, getBuyIphoneFamilyGroups, getBuyIphoneProducts } from '../content/buyIphoneCatalog'
import { buildSiteUrl, toAbsoluteSiteUrl } from '../utils/siteConfig'

interface BuyIphonePageProps {
  products: Product[]
  loading: boolean
}

export default function BuyIphonePage({ products, loading }: BuyIphonePageProps) {

  const liveIphoneProducts = useMemo(() => getBuyIphoneProducts(products), [products])
  const familyGroups = useMemo(() => getBuyIphoneFamilyGroups(products), [products])
  const availableFamilyCount = familyGroups.filter((group) => group.products.length > 0).length
  const lowestPrice = liveIphoneProducts.length > 0 ? Math.min(...liveIphoneProducts.map((product) => product.price)) : null
  const heroImageUrl = toAbsoluteSiteUrl(buyIphoneFamilies[0].imageUrl)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Buy iPhone in Dubai | PZM',
    url: buildSiteUrl('/services/buy-iphone'),
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
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <Seo
        title="Buy iPhone 17 Pro Max, Pro, Air & iPhone 17 in Dubai | PZM"
        description="Buy iPhone in Dubai from PZM with direct WhatsApp ordering and local support."
        canonicalPath="/services/buy-iphone"
        imageUrl={heroImageUrl}
        jsonLd={jsonLd}
      />

      {/* Compact heading row */}
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Buy iPhone in Dubai</h1>
        <div className="flex flex-wrap gap-3 text-sm text-slate-500">
          <span>{liveIphoneProducts.length} models</span>
          <span>{availableFamilyCount}/{buyIphoneFamilies.length} families</span>
          {lowestPrice && <span>From AED {lowestPrice.toFixed(0)}</span>}
        </div>
      </div>

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