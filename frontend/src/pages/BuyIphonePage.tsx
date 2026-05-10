import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { Product } from '@shared/types'
import IphoneFamilyCard from '../components/IphoneFamilyCard'
import Seo from '../components/Seo'
import WhatsAppCTA from '../components/WhatsAppCTA'
import { buyIphoneFamilies, getBuyIphoneFamilyGroups, getBuyIphoneProducts } from '../content/buyIphoneCatalog'
import { useLanguage } from '../context/LanguageContext'
import { buildBreadcrumbJsonLd } from '../utils/breadcrumbs'
import { buildProductRichDescription } from '../utils/productPresentation'
import { buildCanonicalUrl, buildSiteUrl, toAbsoluteSiteUrl } from '../utils/siteConfig'

import { sharedReturnPolicy, sharedShippingDetails } from '../utils/seoConfig'

interface BuyIphonePageProps {
  products: Product[]
  loading: boolean
}

const buyIphoneFamilyTranslations = {
  'iphone-17-pro-max': {
    title: 'آيفون 17 برو ماكس',
    shortTitle: 'برو ماكس',
    description: 'الفئة الأعلى بمقاس كبير وألوان متعددة وخيارات آيفون الرائدة.',
    imageAlt: 'تشكيلة ألوان آيفون 17 برو ماكس',
  },
  'iphone-17-pro': {
    title: 'آيفون 17 برو',
    shortTitle: 'برو',
    description: 'أداء رائد في حجم برو الأصغر.',
    imageAlt: 'تشكيلة ألوان آيفون 17 برو',
  },
  'iphone-17-air': {
    title: 'آيفون 17 Air',
    shortTitle: 'Air',
    description: 'خيارات آيفون النحيفة والخفيفة ضمن سلسلة Air.',
    imageAlt: 'تشكيلة ألوان آيفون 17 Air',
  },
  'iphone-17': {
    title: 'آيفون 17',
    shortTitle: 'العادي',
    description: 'خيارات الجيل الحالي خارج فئة Pro.',
    imageAlt: 'تشكيلة ألوان آيفون 17',
  },
  'iphone-16': {
    title: 'آيفون 16',
    shortTitle: '16',
    description: 'خيارات آيفون عملية بقيمة قوية للاستخدام اليومي.',
    imageAlt: 'تشكيلة ألوان آيفون 16',
  },
} as const

export default function BuyIphonePage({ products, loading }: BuyIphonePageProps) {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'
  const liveIphoneProducts = useMemo(() => getBuyIphoneProducts(products), [products])
  const familyGroups = useMemo(() => getBuyIphoneFamilyGroups(products), [products])
  const localizedFamilyGroups = useMemo(
    () => (isAr
      ? familyGroups.map((group) => ({
          ...group,
          family: {
            ...group.family,
            ...(buyIphoneFamilyTranslations[group.family.key] ?? {}),
          },
        }))
      : familyGroups),
    [familyGroups, isAr],
  )
  const availableFamilyCount = familyGroups.filter((group) => group.products.length > 0).length
  const lowestPrice = liveIphoneProducts.length > 0 ? Math.min(...liveIphoneProducts.map((product) => product.price)) : null
  const seoTitle = isAr ? 'شراء آيفون في دبي | PZM للحواسيب والهواتف' : 'Buy iPhone 16 and 17 in Dubai | PZM Dubai'
  const seoDescription = isAr
    ? 'اشترِ آيفون 16 و17 في دبي مع الطلب المباشر عبر واتساب والدعم المحلي من PZM.'
    : 'Browse iPhone 16 and 17 families in Dubai with direct WhatsApp ordering and local support from PZM.'
  const heroEyebrow = isAr ? 'تشكيلة آيفون' : 'Apple lineup'
  const heroTitle = isAr ? 'اشترِ آيفون في دبي' : 'Buy iPhone in Dubai'
  const heroDescription = isAr
    ? 'تصفح موديلات آيفون 16 و17 مع الطلب المباشر عبر واتساب، وإرشادات التخزين، وخيارات الاستلام أو التوصيل من PZM.'
    : 'Browse iPhone 16 and 17 families with direct WhatsApp ordering, storage guidance, and local pickup or delivery support from PZM.'
  const browseFamiliesLabel = isAr ? 'تصفح الفئات' : 'Browse families'
  const askWhatsappLabel = isAr ? 'اسأل عبر واتساب' : 'Ask on WhatsApp'
  const howToOrderHeading = isAr ? 'طريقة الطلب' : 'How to order'
  const howToOrderSteps = isAr
    ? [
        'اختر فئة آيفون من البطاقات أعلاه.',
        'اختر اللون والسعة ثم اضغط زر الاستفسار.',
        'إذا لم تجد التركيبة المناسبة، راسلنا مباشرة.',
      ]
    : [
        'Pick a family card above.',
        'Choose color & storage, then tap Inquire.',
        'If a combo is missing, message us directly.',
      ]
  const localSupportEyebrow = isAr ? 'دعم آيفون محلي' : 'Local iPhone support'
  const localSupportHeading = isAr ? 'شراء آيفون من فرع البرشاء دبي' : 'iPhone buying from Al Barsha, Dubai'
  const localSupportDescription = isAr
    ? 'إذا كنت تبحث عن محل آيفون في دبي، فهذه الصفحة هي أسرع طريق لمعرفة التشكيلة الحالية، والتأكد من الموديل المناسب، وترتيب الاستلام من فرع البرشاء.'
    : 'If you are searching for an iPhone shop in Dubai, this page is the clearest path to the current Apple lineup, exact model checks, and store pickup support from the Al Barsha branch.'
  const localSupportPoints = isAr
    ? [
        'استخدم هذه الصفحة لتأكيد الفئة والسعة واللون قبل زيارة فرع البرشاء.',
        'يمكنك الاستلام من شارع حصة أو الطلب مباشرة عبر واتساب إذا كنت تحتاج التوصيل داخل دبي.',
        'قارن بين خيارات المقايضة والأجهزة المستعملة المعتمدة إذا كنت تريد آيفون بسعر أقل أولاً.',
      ]
    : [
        'Use this page to confirm the exact family, storage, and color before visiting the Al Barsha store.',
        'Pick up from Hessa Street or move into direct WhatsApp ordering if you want delivery support in Dubai.',
        'Compare trade-in and certified pre-owned routes if you want a lower-price iPhone option first.',
      ]
  const relatedSectionEyebrow = isAr ? 'روابط ذات صلة' : 'Related routes'
  const relatedSectionHeading = isAr ? 'قارن قبل اتخاذ القرار' : 'Compare before you commit'

  const [searchParams, setSearchParams] = useSearchParams()
  const queryTerm = (searchParams.get('q') ?? '').trim()
  const familyParam = searchParams.get('family')
  const validFamilyKey = useMemo(
    () => (familyParam && buyIphoneFamilies.some((f) => f.key === familyParam) ? familyParam : null),
    [familyParam],
  )
  const [highlightKey, setHighlightKey] = useState<string | null>(null)
  const relatedLinks = [
    {
      label: isAr ? 'تغطية فرع البرشاء' : 'Al Barsha store coverage',
      to: '/areas/al-barsha/',
      description: isAr
        ? 'اعرض الاتجاهات والمناطق القريبة وأسرع طريق إلى الفرع.'
        : 'Open directions, nearby communities, and the quickest route to the branch.',
    },
    {
      label: isAr ? 'آيفونات مستعملة معتمدة' : 'Pre-Owned iPhones',
      to: '/services/secondhand/',
      description: isAr
        ? 'اطّلع على أجهزة آيفون المستعملة المعتمدة إذا كنت تريد قيمة أفضل.'
        : 'Check certified used iPhones if you want a stronger value option.',
    },
    {
      label: isAr ? 'بع جهازك' : 'Sell Your Device',
      to: '/services/sell-gadgets/',
      description: isAr
        ? 'قايض هاتفك الحالي قبل الانتقال إلى شراء آيفون جديد.'
        : 'Trade in your current phone before moving into a new iPhone purchase.',
    },
  ]

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
    name: isAr ? 'شراء آيفون في دبي | PZM' : 'Buy iPhone in Dubai | PZM',
    url: buildCanonicalUrl(isAr ? '/ar/services/buy-iphone/' : '/services/buy-iphone/'),
    description: seoDescription,
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
        title={seoTitle}
        description={seoDescription}
        canonicalPath="/services/buy-iphone"
        hreflangPath="/services/buy-iphone"
        jsonLd={[
          jsonLd,
          buildBreadcrumbJsonLd([
            { name: isAr ? 'الرئيسية' : 'Home', path: '/' },
            { name: isAr ? 'الخدمات' : 'Services', path: '/services' },
            { name: isAr ? 'شراء آيفون' : 'Buy iPhone', path: '/services/buy-iphone' },
          ]),
        ]}
      />

      <section className="rounded-3xl border border-brandBorder bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{heroEyebrow}</p>
        <h1 className="mt-3 text-[1.9rem] font-bold text-slate-950 md:text-[2.4rem]">{heroTitle}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-brandTextMedium md:text-base">
          {heroDescription}
        </p>

        <div className="mt-5 flex flex-wrap gap-2.5 text-xs font-medium text-slate-500">
          <span className="rounded-full border border-brandBorder bg-slate-50 px-3 py-1.5">{isAr ? `${liveIphoneProducts.length} موديلات` : `${liveIphoneProducts.length} models`}</span>
          <span className="rounded-full border border-brandBorder bg-slate-50 px-3 py-1.5">{isAr ? `${availableFamilyCount}/${buyIphoneFamilies.length} فئات` : `${availableFamilyCount}/${buyIphoneFamilies.length} families`}</span>
          <span className="rounded-full border border-brandBorder bg-slate-50 px-3 py-1.5">{lowestPrice ? (isAr ? `ابتداءً من ${lowestPrice.toFixed(0)} درهم` : `From AED ${lowestPrice.toFixed(0)}`) : (isAr ? 'اطلب السعر' : 'Request pricing')}</span>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="#iphone-models"
            className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brandGreenDark"
          >
            {browseFamiliesLabel}
          </a>
          <a
            href="#buy-iphone-contact"
            className="inline-flex items-center rounded-xl border border-brandBorder px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
          >
            {askWhatsappLabel}
          </a>
        </div>
      </section>

      {/* Family cards grid */}
      {queryTerm && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#eee] bg-slate-50 px-4 py-3">
          <p className="text-sm text-slate-600">
            {isAr ? 'عرض النتائج لـ' : 'Showing results for'} <span className="font-semibold text-slate-900">“{queryTerm}”</span>.
          </p>
          <button
            type="button"
            onClick={clearSearchContext}
            className="text-sm font-semibold text-slate-700 underline-offset-2 hover:text-slate-900 hover:underline"
          >
            {isAr ? 'مسح' : 'Clear'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-[#eee] bg-white p-8 text-sm text-slate-400">
          {isAr ? 'جاري تحميل موديلات آيفون…' : 'Loading iPhone models…'}
        </div>
      ) : (
        <section id="iphone-models" className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {localizedFamilyGroups.map((group) => (
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
        <section className="rounded-2xl border border-[#eee] bg-white p-6 text-start">
          <h2 className="text-lg font-bold text-gray-900 mb-3">{howToOrderHeading}</h2>
          <div className="space-y-2 text-sm text-slate-700">
            {howToOrderSteps.map((step, index) => (
              <p key={step}><span className="font-semibold text-primary">{index + 1}.</span> {step}</p>
            ))}
          </div>
        </section>

        <div id="buy-iphone-contact">
          <WhatsAppCTA
            title={isAr ? 'هل تبحث عن موديل محدد؟' : "Can't find your model?"}
            description={isAr ? 'أرسل لنا الموديل والسعة واللون وسنرد عليك مباشرة.' : "Tell us the model, storage, and color and we'll reply directly."}
            prefilledMessage={isAr ? 'مرحباً، أبحث عن موديل آيفون محدد. هل يمكنكم مساعدتي؟ (via pzm.ae/services/buy-iphone)' : "Hi, I'm looking for a specific iPhone model. Can you help me find it? (via pzm.ae/services/buy-iphone)"}
          />
        </div>
      </div>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.08fr),minmax(280px,0.92fr)]">
        <article className="rounded-2xl border border-brandBorder bg-white p-6 text-start shadow-sm md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{localSupportEyebrow}</p>
          <h2 className="mt-2 text-xl font-bold text-slate-950 md:text-2xl">{localSupportHeading}</h2>
          <p className="mt-4 text-sm leading-7 text-brandTextMedium md:text-[0.98rem]">
            {localSupportDescription}
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

        <aside className="rounded-2xl border border-brandBorder bg-white p-6 text-start shadow-sm md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{relatedSectionEyebrow}</p>
          <h2 className="mt-2 text-xl font-bold text-slate-950 md:text-2xl">{relatedSectionHeading}</h2>
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
    </div>
  )
}