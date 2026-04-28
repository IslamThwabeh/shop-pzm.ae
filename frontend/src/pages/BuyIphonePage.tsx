import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Product } from '@shared/types'
import IphoneFamilyCard from '../components/IphoneFamilyCard'
import Seo from '../components/Seo'
import WhatsAppCTA from '../components/WhatsAppCTA'
import { buyIphoneFamilies, getBuyIphoneFamilyGroups, getBuyIphoneProducts } from '../content/buyIphoneCatalog'
import { buildProductRichDescription } from '../utils/productPresentation'
import { buildSiteUrl, toAbsoluteSiteUrl } from '../utils/siteConfig'

import { sharedReturnPolicy, sharedShippingDetails } from '../utils/seoConfig'

interface BuyIphonePageProps {
  products: Product[]
  loading: boolean
}

export default function BuyIphonePage({ products, loading }: BuyIphonePageProps) {
  const liveIphoneProducts = useMemo(() => getBuyIphoneProducts(products), [products])
  const familyGroups = useMemo(() => getBuyIphoneFamilyGroups(products), [products])
  const availableFamilyCount = familyGroups.filter((group) => group.products.length > 0).length
  const lowestPrice = liveIphoneProducts.length > 0 ? Math.min(...liveIphoneProducts.map((product) => product.price)) : null

  const [searchParams, setSearchParams] = useSearchParams()
  const queryTerm = (searchParams.get('q') ?? '').trim()
  const familyParam = searchParams.get('family')
  const validFamilyKey = useMemo(
    () => (familyParam && buyIphoneFamilies.some((f) => f.key === familyParam) ? familyParam : null),
    [familyParam],
  )
  const [highlightKey, setHighlightKey] = useState<string | null>(null)

  useEffect(() => {
    if (!validFamilyKey) {
      setHighlightKey(null)
      return undefined
    }
    setHighlightKey(validFamilyKey)
    if (typeof window !== 'undefined') {
      const target = document.getElementById(`family-${validFamilyKey}`)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    const timer = window.setTimeout(() => setHighlightKey(null), 2400)
    return () => window.clearTimeout(timer)
  }, [validFamilyKey])

  const clearSearchContext = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('q')
    next.delete('family')
    setSearchParams(next, { replace: true })
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Buy iPhone in Dubai | PZM',
    url: buildSiteUrl('/services/buy-iphone'),
    description: 'Browse iPhone 16 and 17 families in Dubai with direct WhatsApp ordering and local support from PZM.',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: liveIphoneProducts.slice(0, 16).map((product, index) => {
        const productImage = product.image_url || product.images?.[0] || '/images/Catigories/mini_buy_iphone.webp'
        const productName = `${product.model} ${product.storage}`.trim()

        return {
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            name: productName,
            description: buildProductRichDescription(product),
            url: buildSiteUrl(`/product/${product.id}`),
            brand: {
              '@type': 'Brand',
              name: 'Apple',
            },
            image: [toAbsoluteSiteUrl(productImage)],
            offers: {
              '@type': 'Offer',
              priceCurrency: 'AED',
              price: product.price,
              availability: (product.quantity ?? 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              itemCondition: 'https://schema.org/NewCondition',
              url: buildSiteUrl(`/product/${product.id}`),
              hasMerchantReturnPolicy: sharedReturnPolicy,
              shippingDetails: sharedShippingDetails,
            },
          },
        }
      }),
    },
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <Seo
        title="Buy iPhone 16 and 17 in Dubai | PZM Dubai"
        description="Browse iPhone 16 and 17 families in Dubai with direct WhatsApp ordering and local support from PZM."
        canonicalPath="/services/buy-iphone"
        jsonLd={jsonLd}
      />

      <section className="rounded-3xl border border-brandBorder bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Apple lineup</p>
        <h1 className="mt-3 text-[1.9rem] font-bold text-slate-950 md:text-[2.4rem]">Buy iPhone in Dubai</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-brandTextMedium md:text-base">
          Browse iPhone 16 and 17 families with direct WhatsApp ordering, storage guidance, and local pickup or delivery support from PZM.
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
      </section>

      {/* Family cards grid */}
      {queryTerm && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#eee] bg-slate-50 px-4 py-3">
          <p className="text-sm text-slate-600">
            Showing results for <span className="font-semibold text-slate-900">“{queryTerm}”</span>.
          </p>
          <button
            type="button"
            onClick={clearSearchContext}
            className="text-sm font-semibold text-slate-700 underline-offset-2 hover:text-slate-900 hover:underline"
          >
            Clear
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-[#eee] bg-white p-8 text-sm text-slate-400">
          Loading iPhone models…
        </div>
      ) : (
        <section id="iphone-models" className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {familyGroups.map((group) => (
            <IphoneFamilyCard
              key={group.family.key}
              id={`family-${group.family.key}`}
              family={group.family}
              products={group.products}
              highlighted={highlightKey === group.family.key}
            />
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