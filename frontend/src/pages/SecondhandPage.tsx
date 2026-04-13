import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BatteryCharging, ChevronDown, RefreshCcw, ShieldCheck } from 'lucide-react'
import type { Product } from '@shared/types'
import CatalogFilter from '../components/BrandFilterChips'
import FeaturedProductsSection from '../components/FeaturedProductsSection'
import HomeAppointmentPanel from '../components/HomeAppointmentPanel'
import ProductCard from '../components/ProductCard'
import ProductDetailDrawer from '../components/ProductDetailDrawer'
import ProductGrid from '../components/ProductGrid'
import Seo from '../components/Seo'
import WhatsAppCTA from '../components/WhatsAppCTA'
import { getSecondhandCategoryGroups, getSecondhandProducts, secondhandCategories, secondhandHero } from '../content/secondhandCatalog'
import { resolveServiceSlug } from '../content/serviceCatalog'
import { getDeviceFinderLabel, matchesDeviceFinderProduct, normalizeDeviceFinderKey } from '../utils/deviceFinder'
import { selectFeaturedProducts } from '../utils/featuredProducts'
import { buildSiteUrl, toAbsoluteSiteUrl } from '../utils/siteConfig'
import { resolveProductBrand } from '../utils/productPresentation'

interface SecondhandPageProps {
  products: Product[]
  loading: boolean
}

export default function SecondhandPage({ products, loading }: SecondhandPageProps) {
  const service = resolveServiceSlug('secondhand')
  const [drawerProduct, setDrawerProduct] = useState<Product | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const [appointmentOpen, setAppointmentOpen] = useState(false)
  const validCategoryKeys = useMemo(
    () => new Set<string>(secondhandCategories.map((category) => category.key)),
    [],
  )
  const activeCategories = useMemo(
    () => new Set<string>(
      (searchParams.get('category') ?? '')
        .split(',')
        .map((value) => value.trim())
        .filter((value) => value.length > 0 && validCategoryKeys.has(value)),
    ),
    [searchParams, validCategoryKeys],
  )
  const activeBrands = useMemo(
    () => {
      if (activeCategories.size === 0) {
        return new Set<string>()
      }

      return new Set<string>(
        (searchParams.get('brand') ?? '')
          .split(',')
          .map((value) => value.trim())
          .filter((value) => value.length > 0),
      )
    },
    [searchParams, activeCategories],
  )
  const activeFinder = useMemo(() => normalizeDeviceFinderKey(searchParams.get('finder')), [searchParams])

  if (!service) {
    return null
  }

  const allSecondhandProducts = useMemo(() => getSecondhandProducts(products), [products])

  const filteredProducts = useMemo(() => {
    let result = products
    if (activeCategories.size > 0) {
      const activeCats = secondhandCategories.filter((c) => activeCategories.has(c.key))
      result = result.filter((p) => {
        const norm = p.model.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
        return activeCats.some((cat) => cat.matcher.test(norm))
      })
    }
    if (activeFinder && activeFinder !== 'all') {
      result = result.filter((product) => matchesDeviceFinderProduct(product, activeFinder))
    }
    if (activeBrands.size > 0) {
      result = result.filter((p) => activeBrands.has(resolveProductBrand(p)))
    }
    return result
  }, [products, activeCategories, activeFinder, activeBrands])

  const liveSecondhandProducts = useMemo(() => getSecondhandProducts(filteredProducts), [filteredProducts])
  const featuredProducts = useMemo(() => selectFeaturedProducts(allSecondhandProducts, { condition: 'used', limit: 6 }), [allSecondhandProducts])
  const categoryGroups = useMemo(() => getSecondhandCategoryGroups(filteredProducts), [filteredProducts])
  const liveCategoryGroups = categoryGroups.filter((group) => group.products.length > 0)

  const toggleCategory = (key: string) => {
    if (!validCategoryKeys.has(key)) {
      return
    }

    const nextCategories = new Set(activeCategories)
    if (nextCategories.has(key)) nextCategories.delete(key)
    else nextCategories.add(key)

    const nextParams = new URLSearchParams(searchParams)

    if (nextCategories.size > 0) {
      nextParams.set('category', Array.from(nextCategories).sort().join(','))
    } else {
      nextParams.delete('category')
    }

    nextParams.delete('brand')
    nextParams.delete('finder')
    setSearchParams(nextParams, { replace: true })
  }

  const toggleBrand = (brand: string) => {
    if (activeCategories.size === 0) {
      return
    }

    const nextBrands = new Set(activeBrands)
    if (nextBrands.has(brand)) nextBrands.delete(brand)
    else nextBrands.add(brand)

    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('category', Array.from(activeCategories).sort().join(','))

    if (nextBrands.size > 0) {
      nextParams.set('brand', Array.from(nextBrands).sort().join(','))
    } else {
      nextParams.delete('brand')
    }

    nextParams.delete('finder')
    setSearchParams(nextParams, { replace: true })
  }

  const clearFinder = () => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('finder')
    setSearchParams(nextParams, { replace: true })
  }
  const lowestPrice = liveSecondhandProducts.length > 0 ? Math.min(...liveSecondhandProducts.map((product) => product.price)) : null
  const heroImageUrl = toAbsoluteSiteUrl(secondhandHero.imageUrl)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Used Devices in Dubai | PZM',
    url: buildSiteUrl('/services/secondhand'),
    description: 'Browse certified pre-owned devices in Dubai from PZM, including phones, laptops, tablets, and gaming hardware.',
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
            itemCondition: 'https://schema.org/UsedCondition',
          },
        },
      })),
    },
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <Seo
        title="Buy Used iPhones, Laptops & Gaming PCs | PZM Dubai"
        description="Browse certified pre-owned devices in Dubai from PZM, including phones, laptops, tablets, and gaming hardware."
        canonicalPath="/services/secondhand"
        imageUrl={heroImageUrl}
        jsonLd={jsonLd}
      />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.8rem] font-bold text-slate-950 sm:text-[2.1rem]">Pre-Owned Devices</h1>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-400">
            <span>{liveSecondhandProducts.length} devices</span>
            <span>{liveCategoryGroups.length} categories</span>
            <span>{lowestPrice ? `From AED ${lowestPrice.toFixed(0)}` : 'Ask for pricing'}</span>
          </div>
        </div>
        <Link to="/services/sell-gadgets/" className="text-sm font-semibold text-primary hover:underline">
          Trade In →
        </Link>
      </div>

      {/* Collapsible appointment panel */}
      <div className="rounded-2xl border border-brandBorder bg-slate-50">
        <button
          type="button"
          onClick={() => setAppointmentOpen((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-3.5 text-sm font-semibold text-slate-700"
        >
          <span>📅 Book an Appointment</span>
          <ChevronDown size={16} className={`transition-transform ${appointmentOpen ? 'rotate-180' : ''}`} />
        </button>
        {appointmentOpen && (
          <div className="border-t border-brandBorder px-5 py-5">
            <HomeAppointmentPanel sourcePage="/services/secondhand#appointment" defaultServiceType="other-inquiry" />
          </div>
        )}
      </div>

      <CatalogFilter
        categories={secondhandCategories}
        products={allSecondhandProducts}
        activeCategories={activeCategories}
        activeBrands={activeBrands}
        onToggleCategory={toggleCategory}
        onToggleBrand={toggleBrand}
      />

      {activeCategories.size === 0 && activeBrands.size === 0 && !activeFinder && (
        <FeaturedProductsSection
          eyebrow="Pre-owned picks"
          title="Certified used devices with enough context to compare quickly"
          description="These listings surface the strongest in-stock options first, then the rest of the catalog stays one click away through category filtering."
          products={featuredProducts}
        />
      )}

      {activeFinder && activeFinder !== 'all' && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#eee] bg-slate-50 px-4 py-3">
          <p className="text-sm text-slate-600">
            Showing focused matches for <span className="font-semibold text-slate-900">{getDeviceFinderLabel(activeFinder)}</span>.
          </p>
          <button
            type="button"
            onClick={clearFinder}
            className="text-sm font-semibold text-slate-700 underline-offset-2 hover:text-slate-900 hover:underline"
          >
            Show full category
          </button>
        </div>
      )}

      <section id="secondhand-devices" className="space-y-8">
        {loading ? (
          <div className="rounded-[28px] border border-brandBorder bg-white p-8 shadow-sm text-brandTextMedium">
            Loading used inventory...
          </div>
        ) : liveCategoryGroups.length > 0 ? (
          <div className="space-y-8">
            {liveCategoryGroups.map((group) => (
                <section key={group.category.key} className="rounded-2xl border border-brandBorder bg-white shadow-sm p-5 md:p-6">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-950">{group.category.title}</h2>
                      <p className="mt-1 text-sm text-brandTextMedium">{group.category.description}</p>
                    </div>
                  </div>

                  <ProductGrid className="mt-5">
                    {group.products.map((product) => (
                      <ProductCard key={product.id} product={product} onViewDetails={setDrawerProduct} />
                    ))}
                  </ProductGrid>
                </section>
              ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-brandBorder bg-white p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-950">No used devices are currently listed on the storefront.</h3>
            <p className="mt-3 max-w-3xl text-brandTextMedium">
              If you want a used iPhone, laptop, tablet, or gaming device, send the model, budget, or preferred specs and the team can reply with options.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="#secondhand-contact"
                className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-white font-semibold hover:bg-brandGreenDark transition-colors"
              >
                Ask About a Device
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

      <section className="rounded-[28px] border border-brandBorder bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-bold text-slate-950 mb-2">Used device grades</h2>
        <p className="text-brandTextMedium mb-6">Every used device at PZM is checked before sale.</p>
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-brandBorder bg-white p-6 shadow-sm">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold text-lg">A</span>
            <h3 className="mt-4 text-lg font-bold text-slate-950">Grade A — Like New</h3>
            <p className="mt-2 text-sm leading-7 text-brandTextDark">
              Very light use with clean screen, body, and strong battery health.
            </p>
          </div>
          <div className="rounded-2xl border border-brandBorder bg-white p-6 shadow-sm">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500 text-white font-bold text-lg">B</span>
            <h3 className="mt-4 text-lg font-bold text-slate-950">Grade B — Good Condition</h3>
            <p className="mt-2 text-sm leading-7 text-brandTextDark">
              Light cosmetic wear with all key functions working properly.
            </p>
          </div>
          <div className="rounded-2xl border border-brandBorder bg-white p-6 shadow-sm">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white font-bold text-lg">C</span>
            <h3 className="mt-4 text-lg font-bold text-slate-950">Grade C — Fair Condition</h3>
            <p className="mt-2 text-sm leading-7 text-brandTextDark">
              Visible wear, fully functional, and priced for value.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-brandBorder bg-white p-5 shadow-sm">
          <ShieldCheck className="text-primary" size={20} />
          <h2 className="mt-4 text-base font-bold text-slate-950">30-day warranty</h2>
          <p className="mt-2 text-sm text-brandTextMedium">All certified pre-owned devices include hardware warranty.</p>
        </article>
        <article className="rounded-2xl border border-brandBorder bg-white p-5 shadow-sm">
          <BatteryCharging className="text-primary" size={20} />
          <h2 className="mt-4 text-base font-bold text-slate-950">Full testing</h2>
          <p className="mt-2 text-sm text-brandTextMedium">Battery, screen, cameras, and core features checked.</p>
        </article>
        <article className="rounded-2xl border border-brandBorder bg-white p-5 shadow-sm">
          <RefreshCcw className="text-primary" size={20} />
          <h2 className="mt-4 text-base font-bold text-slate-950">Trade-in path</h2>
          <p className="mt-2 text-sm text-brandTextMedium">Trade in your old device toward your next upgrade.</p>
        </article>
      </section>

      <div id="secondhand-contact">
        <WhatsAppCTA
          title="Looking for a specific used device?"
          description="Tell us the model, budget, and condition preference and the team will check current options."
          prefilledMessage="Hi, I'm looking for a specific used device. Can you help me find one? (via pzm.ae/services/secondhand)"
        />
      </div>

      <ProductDetailDrawer product={drawerProduct} onClose={() => setDrawerProduct(null)} />
    </div>
  )
}