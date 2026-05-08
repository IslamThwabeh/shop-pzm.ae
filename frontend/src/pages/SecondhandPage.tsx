import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BatteryCharging, ChevronDown, RefreshCcw, ShieldCheck } from 'lucide-react'
import type { Product } from '@shared/types'
import CatalogFilter from '../components/BrandFilterChips'
import HomeAppointmentPanel from '../components/HomeAppointmentPanel'
import ProductCard from '../components/ProductCard'
import ProductDetailDrawer from '../components/ProductDetailDrawer'
import ProductGrid from '../components/ProductGrid'
import Seo from '../components/Seo'
import WhatsAppCTA from '../components/WhatsAppCTA'
import { getSecondhandCategoryGroups, getSecondhandProducts, secondhandCategories, secondhandHero } from '../content/secondhandCatalog'
import { resolveServiceSlug } from '../content/serviceCatalog'
import { buildBreadcrumbJsonLd } from '../utils/breadcrumbs'
import { getDeviceFinderLabel, matchesDeviceFinderProduct, normalizeDeviceFinderKey } from '../utils/deviceFinder'
import { matchesStorefrontFamily, normalizeStorefrontFamilyKey } from '../utils/storefrontSearch'
import { buildSiteUrl, toAbsoluteSiteUrl } from '../utils/siteConfig'
import { buildProductRichDescription, resolveProductBrand } from '../utils/productPresentation'
import { extractBrandFromName, sharedReturnPolicy, sharedShippingDetails } from '../utils/seoConfig'

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
  const activeFamilyKey = useMemo(() => normalizeStorefrontFamilyKey(searchParams.get('family')), [searchParams])

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
    if (activeFamilyKey) {
      result = result.filter((product) => matchesStorefrontFamily(product, activeFamilyKey))
    }
    return result
  }, [products, activeCategories, activeFinder, activeBrands, activeFamilyKey])

  const liveSecondhandProducts = useMemo(() => getSecondhandProducts(filteredProducts), [filteredProducts])
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

  const queryTerm = (searchParams.get('q') ?? '').trim()
  const clearSearchTerm = () => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('q')
    nextParams.delete('family')
    setSearchParams(nextParams, { replace: true })
  }
  const lowestPrice = liveSecondhandProducts.length > 0 ? Math.min(...liveSecondhandProducts.map((product) => product.price)) : null
  const heroImageUrl = toAbsoluteSiteUrl(secondhandHero.imageUrl)
  const localSupportPoints = [
    'Use this page to compare currently listed used phones, laptops, monitors, and gaming systems before you visit the store.',
    'Ask about the exact grade, battery condition, and stock availability before driving to the Al Barsha branch.',
    'If you are upgrading, move between trade-in, repair, and new-device pages without leaving the same buying flow.',
  ]
  const relatedLinks = [
    {
      label: 'Al Barsha store coverage',
      to: '/areas/al-barsha/',
      description: 'Open directions, nearby communities, and local store access on Hessa Street.',
    },
    {
      label: 'Sell Your Device',
      to: '/services/sell-gadgets/',
      description: 'Trade in your current phone, laptop, or console before moving into another device.',
    },
    {
      label: 'Buy iPhone',
      to: '/services/buy-iphone/',
      description: 'Compare the current iPhone lineup if you want a new Apple option alongside used stock.',
    },
    {
      label: 'Repair Services',
      to: '/services/repair/',
      description: 'Check whether repair or upgrade is the better route before replacing a device.',
    },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Used Devices in Dubai | PZM',
    url: buildSiteUrl('/services/secondhand'),
    description: 'Browse certified pre-owned devices in Dubai from PZM, including phones, laptops, tablets, and gaming hardware.',
    mainEntity: {
      '@type': 'ItemList',
        itemListElement: liveSecondhandProducts.slice(0, 16).map((product, index) => {
          const productName = `${product.model} ${product.storage}`.trim()
          return {
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'Product',
              name: productName,
              description: buildProductRichDescription(product),
              brand: {
                '@type': 'Brand',
                name: resolveProductBrand(product) || extractBrandFromName(productName),
              },
              url: buildSiteUrl(`/product/${product.id}`),
              image: [toAbsoluteSiteUrl(product.image_url || product.images?.[0] || secondhandHero.imageUrl)],
              offers: {
                '@type': 'Offer',
                priceCurrency: 'AED',
                price: product.price,
                availability: (product.quantity ?? 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                itemCondition: 'https://schema.org/UsedCondition',
                hasMerchantReturnPolicy: sharedReturnPolicy,
                shippingDetails: sharedShippingDetails,
              },
            },
          }
        }),
        
      },
    }

    return (
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <Seo
          title="Buy Used Phones & Laptops in Dubai | Pre-owned by PZM"
          description="Shop certified pre-owned devices at PZM. Phones, laptops, and tablets inspected for quality and sold with warranty."
          canonicalPath="/services/secondhand"
          imageUrl={heroImageUrl}
          jsonLd={[
            jsonLd,
            buildBreadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Services', path: '/services' },
              { name: 'Pre-Owned Devices', path: '/services/secondhand' },
            ]),
          ]}
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

      {(queryTerm || activeFamilyKey) && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#eee] bg-slate-50 px-4 py-3">
          <p className="text-sm text-slate-600">
            Showing results for <span className="font-semibold text-slate-900">“{queryTerm || 'your search'}”</span>.
          </p>
          <button
            type="button"
            onClick={clearSearchTerm}
            className="text-sm font-semibold text-slate-700 underline-offset-2 hover:text-slate-900 hover:underline"
          >
            Clear search
          </button>
        </div>
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

      <section id="secondhand-devices" className="scroll-mt-28 space-y-8">
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
          <h2 className="mt-4 text-base font-bold text-slate-950">6-month warranty</h2>
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

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.08fr),minmax(280px,0.92fr)]">
        <article className="rounded-2xl border border-brandBorder bg-white p-6 text-left shadow-sm md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Local used-device support</p>
          <h2 className="mt-2 text-xl font-bold text-slate-950 md:text-2xl">Used phones and laptops from Al Barsha</h2>
          <p className="mt-4 text-sm leading-7 text-brandTextMedium md:text-[0.98rem]">
            If you are searching for used phones in Dubai or a value-focused laptop upgrade near Al Barsha, this page keeps the current certified stock, grading context, and next-step routes in one place.
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-brandTextDark">
            {localSupportPoints.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-1 shrink-0 text-primary">✓</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </article>

        <aside className="rounded-2xl border border-brandBorder bg-white p-6 text-left shadow-sm md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Related routes</p>
          <h2 className="mt-2 text-xl font-bold text-slate-950 md:text-2xl">Check the other value paths</h2>
          <div className="mt-4 space-y-3">
            {relatedLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block rounded-xl border border-brandBorder bg-slate-50/70 px-4 py-4 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <span className="block text-base font-semibold text-slate-950">{link.label}</span>
                <span className="mt-1.5 block text-sm leading-6 text-brandTextMedium">{link.description}</span>
              </Link>
            ))}
          </div>
        </aside>
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