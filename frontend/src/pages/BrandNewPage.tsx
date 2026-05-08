import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronDown, CreditCard, ShieldCheck, Truck } from 'lucide-react'
import type { Product } from '@shared/types'
import CatalogFilter from '../components/BrandFilterChips'
import FeaturedProductsSection from '../components/FeaturedProductsSection'
import HomeAppointmentPanel from '../components/HomeAppointmentPanel'
import ProductGrid from '../components/ProductGrid'
import VariantCard from '../components/VariantCard'
import Seo from '../components/Seo'
import WhatsAppCTA from '../components/WhatsAppCTA'
import { brandNewCategories, brandNewHero, getBrandNewCategoryGroups, getBrandNewProducts } from '../content/brandNewCatalog'
import { resolveServiceSlug } from '../content/serviceCatalog'
import { buildBreadcrumbJsonLd } from '../utils/breadcrumbs'
import { getDeviceFinderLabel, matchesDeviceFinderProduct, normalizeDeviceFinderKey } from '../utils/deviceFinder'
import { selectFeaturedProducts } from '../utils/featuredProducts'
import { matchesStorefrontFamily, normalizeStorefrontFamilyKey } from '../utils/storefrontSearch'
import { buildSiteUrl, toAbsoluteSiteUrl } from '../utils/siteConfig'
import { buildProductRichDescription, groupProductsByModelFamily, resolveProductBrand } from '../utils/productPresentation'
import { extractBrandFromName, sharedReturnPolicy, sharedShippingDetails } from '../utils/seoConfig'

interface BrandNewPageProps {
  products: Product[]
  loading: boolean
}

export default function BrandNewPage({ products, loading }: BrandNewPageProps) {
  const service = resolveServiceSlug('brand-new')
  const [searchParams, setSearchParams] = useSearchParams()
  const [appointmentOpen, setAppointmentOpen] = useState(false)
  const validCategoryKeys = useMemo(
    () => new Set<string>(brandNewCategories.map((category) => category.key)),
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

  const allBrandNewProducts = useMemo(() => getBrandNewProducts(products), [products])

  const filteredProducts = useMemo(() => {
    let result = products
    if (activeCategories.size > 0) {
      const activeCats = brandNewCategories.filter((c) => activeCategories.has(c.key))
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

  const liveBrandNewProducts = useMemo(() => getBrandNewProducts(filteredProducts), [filteredProducts])
  const featuredProducts = useMemo(() => selectFeaturedProducts(allBrandNewProducts, { condition: 'new', limit: 6 }), [allBrandNewProducts])
  const categoryGroups = useMemo(() => getBrandNewCategoryGroups(filteredProducts), [filteredProducts])
  const liveCategoryGroups = categoryGroups.filter((group) => group.products.length > 0)
  const requestCategoryGroups = categoryGroups.filter((group) => group.products.length === 0)

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
  const lowestPrice = liveBrandNewProducts.length > 0 ? Math.min(...liveBrandNewProducts.map((product) => product.price)) : null
  const heroImageUrl = toAbsoluteSiteUrl(brandNewHero.imageUrl)
  const localSupportPoints = [
    'Use this page to compare laptops, computers, phones, and gaming hardware before visiting the Al Barsha branch.',
    'Pick up from Hessa Street or confirm Dubai delivery after the team verifies the exact model and configuration.',
    'If you are replacing an older machine, move straight into repair, trade-in, or pre-owned routes from the same storefront.',
  ]
  const relatedLinks = [
    {
      label: 'Laptop Shop',
      to: '/services/laptop-shop/',
      description: 'Open the narrower laptop route if you only want MacBooks, Windows laptops, and gaming laptops.',
    },
    {
      label: 'Computer Shop',
      to: '/services/computer-shop/',
      description: 'Move into desktops, monitors, and workstation-focused shopping instead of the broader catalog.',
    },
    {
      label: 'Al Barsha store coverage',
      to: '/areas/al-barsha/',
      description: 'Open directions, nearby communities, and the fastest route to the branch.',
    },
    {
      label: 'Gaming PC Builds',
      to: '/services/gaming-pc/',
      description: 'Move into custom builds if you need a stronger gaming or workstation setup.',
    },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Brand New Devices in Dubai | PZM',
    url: buildSiteUrl('/services/brand-new'),
    description: 'Browse brand-new devices in Dubai from PZM, including phones, laptops, consoles, and more.',
    mainEntity: {
      '@type': 'ItemList',
        itemListElement: liveBrandNewProducts.slice(0, 16).map((product, index) => {
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
              image: [toAbsoluteSiteUrl(product.image_url || product.images?.[0] || brandNewHero.imageUrl)],
              offers: {
                '@type': 'Offer',
                priceCurrency: 'AED',
                price: product.price,
                availability: (product.quantity ?? 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                itemCondition: 'https://schema.org/NewCondition',
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
          title="Buy Brand New Devices in Dubai | PZM Computers & Phones"
          description="Looking for brand-new devices? PZM offers phones, laptops, consoles, and more in Dubai. Top specs, guaranteed."
          canonicalPath="/services/brand-new"
          imageUrl={heroImageUrl}
          jsonLd={[
            jsonLd,
            buildBreadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Services', path: '/services' },
              { name: 'Brand New Devices', path: '/services/brand-new' },
            ]),
          ]}
        />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.8rem] font-bold text-slate-950 sm:text-[2.1rem]">Brand New Devices</h1>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-400">
            <span>{liveBrandNewProducts.length} devices</span>
            <span>{liveCategoryGroups.length} categories</span>
            <span>{lowestPrice ? `From AED ${lowestPrice.toFixed(0)}` : 'Request pricing'}</span>
          </div>
        </div>
        <Link to="/services/buy-iphone/" className="text-sm font-semibold text-primary hover:underline">
          iPhone Collection →
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
            <HomeAppointmentPanel sourcePage="/services/brand-new#appointment" defaultServiceType="other-inquiry" />
          </div>
        )}
      </div>

      <CatalogFilter
        categories={brandNewCategories}
        products={allBrandNewProducts}
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

      {activeCategories.size === 0 && activeBrands.size === 0 && !activeFinder && !activeFamilyKey && !queryTerm && (
        <FeaturedProductsSection
          eyebrow="Brand-new picks"
          title="Popular brand-new devices with complete listing details"
          description="Start with the clearest, in-stock listings, then move into the wider catalog once you know the device family you want."
          products={featuredProducts}
          collectionHref="#brand-new-devices"
          collectionLabel="See all devices"
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

      <section id="brand-new-devices" className="scroll-mt-28 space-y-8">
        {loading ? (
          <div className="rounded-[28px] border border-brandBorder bg-white p-8 shadow-sm text-brandTextMedium">
            Loading brand-new inventory...
          </div>
        ) : liveCategoryGroups.length > 0 ? (
          <div className="space-y-8">
            {liveCategoryGroups.map((group) => (
                <section key={group.category.key} id={`${group.category.key}-live`} className="rounded-2xl border border-brandBorder bg-white shadow-sm p-5 md:p-6">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-950">{group.category.title}</h2>
                      <p className="mt-1 text-sm text-brandTextMedium">{group.category.description}</p>
                    </div>
                  </div>

                  <ProductGrid className="mt-5">
                    {groupProductsByModelFamily(group.products).map((family) => (
                      <VariantCard key={family.title} title={family.title} products={family.products} condition="new" />
                    ))}
                  </ProductGrid>

                  {group.category.key === 'phones-tablets' && (
                    <div className="mt-5 rounded-xl border border-brandBorder bg-slate-50 p-4 text-left">
                      <p className="text-sm font-semibold text-slate-950">Need the iPhone family view?</p>
                      <Link
                        to="/services/buy-iphone/"
                        className="mt-2 inline-flex items-center text-sm font-semibold text-primary hover:underline"
                      >
                        Go to Buy iPhone →
                      </Link>
                    </div>
                  )}
                </section>
              ))}
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
        <section className="rounded-2xl border border-brandBorder bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-bold text-slate-950">More categories at PZM</h2>
          <p className="mt-2 text-sm text-brandTextMedium">
            Message the team if the category you want is not listed yet.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {requestCategoryGroups.map((group) => (
                <article key={group.category.key} className="rounded-xl border border-brandBorder bg-white p-4 shadow-sm">
                  <h3 className="text-base font-bold text-slate-950">{group.category.title}</h3>
                  <p className="mt-2 text-sm text-brandTextMedium">{group.category.description}</p>
                  <a
                    href="#brand-new-contact"
                    className="mt-3 inline-flex items-center text-sm font-semibold text-primary hover:underline"
                  >
                    Ask about {group.category.shortTitle}
                  </a>
                </article>
              ))}
          </div>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-brandBorder bg-white p-5 shadow-sm">
          <ShieldCheck className="text-primary" size={20} />
          <h2 className="mt-4 text-base font-bold text-slate-950">Official warranty</h2>
          <p className="mt-2 text-sm text-brandTextMedium">All brand-new devices include manufacturer warranty.</p>
        </article>
        <article className="rounded-2xl border border-brandBorder bg-white p-5 shadow-sm">
          <Truck className="text-primary" size={20} />
          <h2 className="mt-4 text-base font-bold text-slate-950">Same-day delivery</h2>
          <p className="mt-2 text-sm text-brandTextMedium">Pick up in Al Barsha or get same-day delivery in Dubai.</p>
        </article>
        <article className="rounded-2xl border border-brandBorder bg-white p-5 shadow-sm">
          <CreditCard className="text-primary" size={20} />
          <h2 className="mt-4 text-base font-bold text-slate-950">Setup included</h2>
          <p className="mt-2 text-sm text-brandTextMedium">Device setup, data transfer, and accessory guidance.</p>
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.08fr),minmax(280px,0.92fr)]">
        <article className="rounded-2xl border border-brandBorder bg-white p-6 text-left shadow-sm md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Local device shopping</p>
          <h2 className="mt-2 text-xl font-bold text-slate-950 md:text-2xl">Laptop and computer shopping from Al Barsha</h2>
          <p className="mt-4 text-sm leading-7 text-brandTextMedium md:text-[0.98rem]">
            If you are searching for a laptop shop in Al Barsha or a computer shop in Dubai, this page is the clearest route to current new-device stock, fast model checks, and store pickup support from the Hessa Street branch.
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
          <h2 className="mt-2 text-xl font-bold text-slate-950 md:text-2xl">Compare new, used, and upgrade paths</h2>
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

      <div id="brand-new-contact">
        <WhatsAppCTA
          title="Looking for a specific device?"
          description="Tell us the model, storage, and color and the team will reply with pricing."
          prefilledMessage="Hi, I'm looking for a specific brand-new device. Can you help me find it? (via pzm.ae/services/brand-new)"
        />
      </div>
    </div>
  )
}