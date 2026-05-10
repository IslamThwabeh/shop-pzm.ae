import { useMemo, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Zap, CheckCircle, Truck, MapPin } from 'lucide-react'
import type { Product } from '@shared/types'
import FeaturedProductsSection from '../components/FeaturedProductsSection'
import Seo from '../components/Seo'
import CategoryCard from '../components/CategoryCard'
import DeviceFinder from '../components/DeviceFinder'
import RetailImage from '../components/RetailImage'

const TestimonialCards = lazy(() => import('../components/TestimonialCards'))
const FaqAccordion = lazy(() => import('../components/FaqAccordion'))
import {
  homeAreaHighlights,
  homeCategoryCards,
  homeFaqItems,
  homeMoneyRouteLinks,
  homeTrustCards,
} from '../content/homePageContent'
import { blogPostsNewestFirst } from '../content/blogCatalog'
import { siteContact, siteIdentity } from '../content/siteData'
import { useLanguage } from '../context/LanguageContext'
import { selectHomepageFeaturedProducts } from '../utils/featuredProducts'
import { buildCanonicalUrl, toAbsoluteSiteUrl } from '../utils/siteConfig'

const trustIcons = [ShieldCheck, Zap, CheckCircle, Truck] as const
const homeSeoTitle = 'PZM Computers & Phones – Sell, New, Used, Repair, PC Build | Barsha Dubai'
const homeSeoDescription =
  "PZM's Al Barsha store serves Barsha 1-3, Dubai Science Park, JVC, Meadows Village, JLT, Springs, Barsha Heights, Tecom, and Al Sufouh for phones, laptops, repairs, and device support."
const homeAreaServed = Array.from(
  new Set(['Al Barsha, Dubai', ...homeAreaHighlights.map((area) => area.placeName)]),
)

const homeCategoryCardTranslations: Record<string, { title: string; subtitle?: string }> = {
  '/services/buy-iphone/': { title: 'شراء آيفون', subtitle: 'آيفون 16 و17' },
  '/services/brand-new/': { title: 'أجهزة جديدة', subtitle: 'ضمان رسمي' },
  '/services/laptop-shop/': { title: 'محل لابتوب', subtitle: 'ماك بوك، ديل، HP والمزيد' },
  '/services/computer-shop/': { title: 'محل كمبيوتر', subtitle: 'أجهزة مكتبية وشاشات' },
  '/services/secondhand/': { title: 'أجهزة مستعملة', subtitle: 'مستعمل معتمد' },
  '/services/gaming-pc/': { title: 'كمبيوترات ألعاب', subtitle: 'تجميعات مخصصة' },
  '/services/sell-gadgets/': { title: 'بع جهازك', subtitle: 'احصل على تقييم عادل' },
  '/services/accessories/': { title: 'إكسسوارات', subtitle: 'كفرات وشواحن والمزيد' },
  '/services/repair/': { title: 'خدمات الإصلاح', subtitle: 'إصلاحات سريعة' },
  '/services/web-design/': { title: 'تصميم مواقع', subtitle: 'مواقع احترافية' },
}

const homeMoneyRouteLinkTranslations: Record<string, { label: string; description: string }> = {
  '/services/laptop-shop/': {
    label: 'محل لابتوب في البرشاء',
    description: 'مسارات شراء ماك بوك ولابتوبات ويندوز مع دعم الاستلام المحلي.',
  },
  '/services/computer-shop/': {
    label: 'محل كمبيوتر في دبي',
    description: 'أجهزة مكتبية وشاشات ومحطات عمل من فرع البرشاء.',
  },
  '/services/repair/': {
    label: 'خدمات الإصلاح',
    description: 'استلام إصلاح الماك بوك واللابتوب والهاتف مع متابعة سريعة من الفرع.',
  },
  '/services/buy-iphone/': {
    label: 'شراء آيفون',
    description: 'تشكيلة آيفون الحالية مع تأكيد الموديل قبل الزيارة أو التوصيل.',
  },
  '/services/secondhand/': {
    label: 'أجهزة مستعملة',
    description: 'هواتف ولابتوبات مستعملة معتمدة لمن يبحث عن قيمة أفضل.',
  },
  '/services/gaming-pc/': {
    label: 'تجميع كمبيوتر ألعاب',
    description: 'تجميعات ألعاب ومحطات عمل مخصصة مع استشارة من فرع البرشاء.',
  },
}

const homeTrustCardTranslations: Record<string, { title: string; description: string }> = {
  'Warranty Included': {
    title: 'ضمان شامل',
    description: 'كل جهاز يأتي مع تغطية ضمان واضحة ومسار دعم معروف بعد الشراء.',
  },
  'Same-Day Repair': {
    title: 'إصلاح في نفس اليوم',
    description: 'العديد من أعمال الإصلاح تنتهي خلال ساعات مع استلام فعلي من المتجر.',
  },
  'Certified Pre-Owned': {
    title: 'مستعمل معتمد',
    description: 'كل جهاز مستعمل يمر بالفحص والاختبار قبل عرضه أو تسليمه.',
  },
  'Pickup and Delivery': {
    title: 'استلام وتوصيل',
    description: 'إذا لم تستطع زيارة الفرع، يمكننا استلام الجهاز وإعادته بعد الخدمة.',
  },
}

const homeFaqItemsAr: typeof homeFaqItems = [
  {
    question: 'هل تقدمون ضماناً على الأجهزة المستعملة؟',
    answer: 'نعم. الأجهزة المستعملة المعتمدة تشمل ضماناً، وعادة تحصل أجهزة الآيفون والماك بوك على ضمان هاردوير لمدة 6 أشهر.',
  },
  {
    question: 'كم يستغرق إصلاح الهاتف أو اللابتوب؟',
    answer: 'معظم إصلاحات الهواتف تنتهي خلال 30 إلى 60 دقيقة. أما أعمال اللابتوب وإصلاحات اللوحة الأم فقد تحتاج من يوم إلى 3 أيام عمل بحسب التعقيد وتوفر القطع.',
  },
  {
    question: 'هل يمكنني بيع هاتفي أو اللابتوب القديم لكم؟',
    answer: 'نعم. استخدم صفحة بع جهازك أو نموذج الحجز لطلب تقييم، أو زر المتجر للحصول على فحص وتقييم مباشر.',
  },
  {
    question: 'هل تقومون بتجميع كمبيوترات ألعاب مخصصة؟',
    answer: 'نعم. نقوم بتجميع كمبيوترات ألعاب ومحطات عمل اقتصادية ومتوسطة وعالية المواصفات مع توصيات مناسبة للميزانية والاستخدام.',
  },
  {
    question: 'ما وسائل الدفع التي تقبلونها؟',
    answer: 'نقبل الدفع النقدي والتحويل البنكي وبطاقات الدفع. كما يمكن لبعض طلبات الموقع استخدام الدفع عند الاستلام داخل دبي.',
  },
  {
    question: 'أين يقع المتجر؟',
    answer: 'نحن داخل هِسّة يونيون كووب هايبرماركت في الطابق الأرضي على شارع حصة في البرشاء، دبي، مع مواقف سهلة وروابط خرائط جوجل على الموقع.',
  },
  {
    question: 'هل يمكنني الطلب أونلاين مع التوصيل؟',
    answer: 'نعم. تصفح صفحات الأجهزة على الموقع واضغط على واتساب في أي منتج، وسيتابع الفريق تفاصيل التوصيل مباشرة عبر المحادثة.',
  },
  {
    question: 'ما هي ساعات العمل؟',
    answer: 'يرجى مراجعة قسم اتصل بنا في هذه الصفحة لمعرفة أحدث ساعات العمل، أو راسلنا على واتساب للتأكيد الفوري.',
  },
]

interface HomePageProps {
  products: Product[]
}

export default function HomePage({ products }: HomePageProps) {
  const { lang, toSupportedLocalizedPath } = useLanguage()
  const isAr = lang === 'ar'
  const featuredProducts = useMemo(() => selectHomepageFeaturedProducts(products, 3), [products])
  const localizedCategoryCards = isAr
    ? homeCategoryCards.map((card) => ({
        ...card,
        to: toSupportedLocalizedPath(card.to),
        ...(homeCategoryCardTranslations[card.to] ?? {}),
      }))
    : homeCategoryCards
  const localizedMoneyRouteLinks = isAr
    ? homeMoneyRouteLinks.map((item) => ({
        ...item,
        to: toSupportedLocalizedPath(item.to),
        ...(homeMoneyRouteLinkTranslations[item.to] ?? {}),
      }))
    : homeMoneyRouteLinks
  const localizedTrustCards = isAr
    ? homeTrustCards.map((card) => ({
        ...card,
        ...(homeTrustCardTranslations[card.title] ?? {}),
      }))
    : homeTrustCards
  const localizedFaqItems = isAr ? homeFaqItemsAr : homeFaqItems
  const seoTitle = isAr
    ? 'PZM للحواسيب والهواتف دبي | بيع، جديد، مستعمل، إصلاح'
    : homeSeoTitle
  const seoDescription = isAr
    ? 'متجر PZM في البرشاء دبي — بيع وشراء الأجهزة الجديدة والمستعملة وخدمات الإصلاح وتجميع الحواسيب.'
    : homeSeoDescription
  const heroTitle = isAr ? 'PZM للحواسيب والهواتف' : siteIdentity.publicBrandName
  const heroDescription = isAr
    ? 'أجهزة جديدة ومستعملة، إصلاحات احترافية، وتجميع كمبيوترات من فرع البرشاء في دبي.'
    : 'New & used devices, expert repairs, and custom builds — Al Barsha, Dubai.'

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: localizedFaqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  const storeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ComputerStore',
    name: siteIdentity.name,
    description: seoDescription,
    url: buildCanonicalUrl(isAr ? '/ar/' : '/'),
    telephone: '+971528026677',
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${siteContact.addressLine1}, ${siteContact.addressLine2}`,
      addressLocality: 'Dubai',
      addressCountry: 'AE',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 25.0848627, longitude: 55.1992671 },
    areaServed: [
      ...homeAreaServed.map((name) => ({ '@type': 'Place', name })),
      {
        '@type': 'GeoCircle',
        geoMidpoint: {
          '@type': 'GeoCoordinates',
          latitude: 25.0848627,
          longitude: 55.1992671,
        },
        geoRadius: '10000',
      },
    ],
    hasMap: siteContact.mapsHref,
    image: toAbsoluteSiteUrl('/images/mini_logo.png'),
    priceRange: 'AED 150 - AED 7,000',
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Seo
        title={seoTitle}
        description={seoDescription}
        canonicalPath="/"
        hreflangPath="/"
        jsonLd={[storeJsonLd, faqJsonLd]}
      />

      {/* ── Hero ────────────────────────────────────── */}
      <section className="px-4 pt-16 pb-12 text-center sm:px-6 sm:pt-20 sm:pb-16 lg:px-8 lg:pt-24 lg:pb-20">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-[2rem] font-extrabold leading-[1.1] tracking-tight text-slate-950 sm:text-[2.6rem] lg:text-[3.2rem]">
            {heroTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-slate-500">
            {heroDescription}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/services/brand-new"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              {isAr ? 'أجهزة جديدة' : 'New Devices'}
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/services/secondhand"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-900 px-7 py-3.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50"
            >
              {isAr ? 'أجهزة مستعملة' : 'Pre-Owned'}
            </Link>
            <Link
              to="/services/repair/"
              className="inline-flex items-center gap-2 rounded-xl border border-[#eee] px-7 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900"
            >
              {isAr ? 'خدمات الإصلاح' : 'Repair Services'}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Device Finder ────────────────────────── */}
      <section className="border-t border-[#eee] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <DeviceFinder />
      </section>

      {/* ── Shop by Category ─────────────────────────── */}
      <section id="products" className="border-t border-[#eee] bg-[#fafafa] px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-[1.75rem]">{isAr ? 'تسوق حسب الفئة' : 'Shop by Category'}</h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-sm text-slate-500">
            {isAr ? 'تصفح الأجهزة والخدمات واضغط على أي فئة للمتابعة.' : 'Browse devices and services — tap any category to explore.'}
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {localizedCategoryCards.map((cat, i) => (
              <CategoryCard
                key={cat.to}
                title={cat.title}
                subtitle={cat.subtitle}
                to={cat.to}
                imageUrl={cat.imageUrl}
                loading={i < 2 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : 'auto'}
              />
            ))}
          </div>
        </div>
      </section>

      <FeaturedProductsSection
        eyebrow={isAr ? 'مخزون مميز' : 'Featured inventory'}
        title={isAr ? 'أجهزة جاهزة للشراء الآن' : 'Ready-to-buy devices worth opening first'}
        description={isAr ? 'هذه المنتجات المتوفرة الآن تحتوي على تفاصيل كافية لتوضيح ما هو معروض فعلياً للعملاء ومحركات البحث.' : 'These in-stock listings have enough detail to help both shoppers and search engines understand what is actually available right now.'}
        products={featuredProducts}
      />

      {/* ── Trust Strip ──────────────────────────────── */}
      <section className="border-t border-[#eee] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 sm:grid-cols-4">
          {localizedTrustCards.map((card, i) => {
            const Icon = trustIcons[i % trustIcons.length]
            return (
              <div key={card.title} className="flex flex-col items-center text-center">
                <Icon size={22} className="text-slate-400" />
                <p className="mt-2 text-sm font-semibold text-slate-800">{card.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{card.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="border-t border-[#eee] bg-[#fafafa] px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-7xl rounded-[30px] border border-[#eee] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {isAr ? 'المناطق التي نخدمها' : 'Areas We Serve'}
              </p>
              <h2 className="mt-3 text-2xl font-bold text-slate-900 sm:text-[1.75rem]">
                {isAr ? 'نساعد المجتمعات القريبة في دبي على الشراء والإصلاح والاستلام بشكل أسرع' : 'Helping nearby Dubai communities shop, repair, and collect faster'}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
                {isAr
                  ? 'يمكن لعملائنا من البرشاء 1 و2 و3، دبي ساينس بارك، JVC، ميدوز فيليج، JLT، سبرينغز، برشاء هايتس، تيكوم، والسفوح استخدام فرعنا في البرشاء لشراء الأجهزة والإصلاح والمتابعة السريعة.'
                  : 'Customers from Barsha 1-3, Dubai Science Park, JVC, Meadows Village, JLT, Springs, Barsha Heights, Tecom, and Al Sufouh can use our Al Barsha store for device buying, repairs, and quick follow-up.'}
              </p>
            </div>
            <Link
              to="/areas/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-950"
            >
              {isAr ? 'عرض كل صفحات المناطق' : 'View all area pages'}
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {homeAreaHighlights.map((area) => (
              <Link
                key={`${area.to}-${area.label}`}
                to={area.to}
                className="inline-flex items-center gap-2 rounded-full border border-[#eee] bg-[#fafafa] px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
              >
                <MapPin size={14} className="text-slate-400" />
                {area.label}
              </Link>
            ))}
          </div>

          <div className="mt-8 border-t border-[#eee] pt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              {isAr ? 'الأكثر طلباً في البرشاء' : 'Popular In Al Barsha'}
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {localizedMoneyRouteLinks.map((linkItem) => (
                <Link
                  key={linkItem.to}
                  to={linkItem.to}
                  className="rounded-2xl border border-[#eee] bg-[#fafafa] px-4 py-4 text-start transition-colors hover:border-slate-300 hover:bg-white"
                >
                  <span className="block text-sm font-semibold text-slate-900">
                    {linkItem.label}
                  </span>
                  <span className="mt-1.5 block text-xs leading-6 text-slate-500">
                    {linkItem.description}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────── */}
      <section className="border-t border-[#eee] px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold text-slate-900">{isAr ? 'آراء العملاء' : 'Customer Reviews'}</h2>
          <div className="mt-10">
            <Suspense fallback={null}>
              <TestimonialCards />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ── Blog ─────────────────────────────────────── */}
      <section className="border-t border-[#eee] px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold text-slate-900">{isAr ? 'من المدونة' : 'Latest from the Blog'}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {blogPostsNewestFirst.slice(0, 2).map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}/`}
                className="group overflow-hidden rounded-[28px] border border-brandBorder bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-36 overflow-hidden sm:h-40">
                  <RetailImage src={post.imageUrl} alt={post.title} name={post.title} variant="article" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                  <div className={`absolute inset-0 bg-gradient-to-br ${post.themeClassName} opacity-20`} />
                  <div className="absolute inset-x-0 top-0 p-5">
                    <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-sky-700 shadow-sm">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brandTextMedium">
                    {new Date(`${post.publishedAt}T00:00:00`).toLocaleDateString(isAr ? 'ar-AE' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <h3 className="mt-3 text-xl font-bold leading-8 text-slate-950">{post.title}</h3>
                  <p className="mt-3 line-clamp-2 text-sm leading-7 text-brandTextMedium">{post.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    {isAr ? 'اقرأ المقال' : 'Read article'}
                    <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/blog/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              {isAr ? 'عرض كل المقالات' : 'View all articles'}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────── */}
      <section id="faq" className="border-t border-[#eee] bg-[#fafafa] px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold text-slate-900">{isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}</h2>
          <div className="mt-10">
            <Suspense fallback={null}>
              <FaqAccordion items={localizedFaqItems} />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  )
}
