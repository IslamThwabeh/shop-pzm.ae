import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, ChevronDown, Clock3, MapPin, ShieldCheck, ShoppingCart, Wrench } from 'lucide-react'
import type { Product } from '@shared/types'
import Seo from '../components/Seo'
import HomeAppointmentPanel from '../components/HomeAppointmentPanel'
import { areaCatalogList } from '../content/areaCatalog'
import {
  homeAreaOrder,
  homeBlogTeasers,
  homeFaqItems,
  homeFeaturedCategories,
  homeServiceCards,
  homeTrustCards,
} from '../content/homePageContent'
import { siteContact, siteIdentity } from '../content/siteData'
import { buildSiteUrl, toAbsoluteSiteUrl } from '../utils/siteConfig'

type SectionHeaderProps = {
  badge: string
  title: string
  description: string
  align?: 'left' | 'center'
}

function SectionHeader({ badge, title, description, align = 'center' }: SectionHeaderProps) {
  const alignmentClass = align === 'left' ? 'text-left' : 'text-center'

  return (
    <div className={alignmentClass}>
      <span className="inline-flex rounded-full bg-gradient-to-r from-sky-100 to-emerald-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-sky-700">
        {badge}
      </span>
      <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">{title}</h2>
      <p className={`mt-4 text-base leading-7 text-brandTextMedium md:text-lg ${align === 'center' ? 'mx-auto max-w-3xl' : 'max-w-3xl'}`}>
        {description}
      </p>
    </div>
  )
}

function ReviewCard(props: { name: string, rating: number, text: string }) {
  return (
    <div className="h-full rounded-3xl border border-brandBorder bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
      <div className="mb-3 flex items-center gap-2">
        <span className="font-bold text-gray-900">{props.name}</span>
        <span className="text-yellow-400">{'★'.repeat(props.rating)}</span>
      </div>
      <p className="text-sm leading-7 text-gray-700">{props.text}</p>
    </div>
  )
}

function CustomerReviewsFallback() {
  const reviews = [
    { name: '9airafi', rating: 5, text: 'Amazing store full of everything. I came here to sell my iPhone and the process was super fast with instant cash.' },
    { name: 'Matallah Mohamed', rating: 5, text: 'They handle both hardware and software repairs very well, and their used laptops and phones are priced competitively for Dubai.' },
    { name: 'Margarette Ann Tamo', rating: 5, text: 'PZM fixed my water-damaged phone after other shops could not. Very professional team and I was very happy with the result.' },
    { name: 'Ahmed Hekal', rating: 5, text: 'Very good store for new and used phones and laptops, and a strong choice for repairs and gaming PC builds as well.' },
    { name: 'Muhammad Nazeer Rakha', rating: 5, text: 'I brought a MacBook Pro and the team upgraded and restored it well. Customer service was strong and they wanted the job done properly.' },
    { name: 'Niyati Desai', rating: 5, text: 'Excellent work by PZM. They repaired our PlayStation quickly, at a good price, and were very easy to deal with.' },
  ]

  return (
    <div className="mt-10 space-y-8">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {reviews.map((review) => (
          <div key={review.name}>
            <ReviewCard {...review} />
          </div>
        ))}
      </div>

      <div className="text-center">
        <a
          href="https://www.google.com/maps/place/PZM+Computers+%26+Phones+Store+-Buy%E2%80%A2Sell%E2%80%A2Fix%E2%80%A2Used%E2%80%A2PC%E2%80%A2Build/@25.0849294,55.1966838,17z/data=!4m18!1m9!3m8!1s0x3e5f6dc0bc49a6d5:0x158c13f2d688b32e!2zUFpNIENvbXB1dGVycyAmIFBob25lcyBTdG9yZSAtQnV54oCiU2VsbOKAokZpeOKAolVzZWTigKJQQ-KAokJ1aWxk!8m2!3d25.0849246!4d55.1992587!9m1!1b1!16s%2Fg%2F11vtbpyx8l!3m7!1s0x3e5f6dc0bc49a6d5:0x158c13f2d688b32e!8m2!3d25.0849246!4d55.1992587!9m1!1b1!16s%2Fg%2F11vtbpyx8l?entry=ttu&g_ep=EgoyMDI2MDEyOC4wIKXMDSoASAFQAw%3D%3D"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-brandBorder bg-white px-5 py-3 text-base font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary"
        >
          See All Reviews on Google Maps
          <ArrowRight size={16} />
        </a>
      </div>
    </div>
  )
}

interface HomePageProps {
  products: Product[]
  onShopClick: () => void
}

export default function HomePage({ products, onShopClick }: HomePageProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState(0)

  const inStockProducts = useMemo(
    () => products.filter((product) => (product.quantity ?? 0) > 0),
    [products]
  )

  const areaLookup = useMemo(
    () => new Map(areaCatalogList.map((area) => [area.slug, area])),
    []
  )

  const orderedAreas = homeAreaOrder
    .map((slug) => areaLookup.get(slug))
    .filter((area): area is NonNullable<typeof area> => Boolean(area))

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: homeFaqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  const storeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ComputerStore',
    name: siteIdentity.name,
    description:
      'Buy, sell, fix, and build with PZM in Al Barsha, Dubai. New and used iPhones, MacBooks, gaming PCs, repairs, accessories, and local service support.',
    url: buildSiteUrl('/'),
    telephone: '+971528026677',
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${siteContact.addressLine1}, ${siteContact.addressLine2}`,
      addressLocality: 'Dubai',
      addressCountry: 'AE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 25.0848627,
      longitude: 55.1992671,
    },
    hasMap: siteContact.mapsHref,
    image: toAbsoluteSiteUrl('/images/mini_logo.png'),
    priceRange: 'AED 150 - AED 7,000',
    areaServed: orderedAreas.map((area) => ({
      '@type': 'Place',
      name: `${area.name}, Dubai`,
    })),
  }

  return (
    <div className="min-h-screen bg-[#f0f7ff] text-slate-900">
      <Seo
        title="Buy iPhones, Laptops and Repair Dubai | PZM Store"
        description="PZM Computers and Phones Store in Al Barsha, Dubai for new and used devices, expert repairs, custom PC builds, accessories, and local service support."
        canonicalPath="/"
        jsonLd={[storeJsonLd, faqJsonLd]}
      />

      <section id="home" className="relative overflow-hidden bg-[linear-gradient(180deg,#f0f7ff_0%,#e8f4fd_55%,#f0f7ff_100%)] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.18),transparent_70%)]" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(0,200,150,0.16),transparent_70%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full border border-white/80 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-sky-700 shadow-sm backdrop-blur">
              Al Barsha, Dubai
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              PZM Computers
              <br />
              and Phones Store
              <br />
              <span className="bg-gradient-to-r from-sky-500 to-primary bg-clip-text text-transparent">
                New Used Repair PC Build
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-brandTextMedium">
              Your integrated device solutions hub in Al Barsha, Dubai. Expert repairs, brand new and certified used devices, custom gaming PC builds, accessories, and direct support from one local team.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={onShopClick}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-white shadow-[0_10px_30px_rgba(0,167,111,0.25)] transition-transform hover:-translate-y-0.5 hover:bg-brandGreenDark"
              >
                <ShoppingCart size={18} />
                Browse Devices
              </button>
              <Link
                to="/services/repair"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-7 py-4 text-base font-semibold text-slate-900 transition-colors hover:border-primary hover:text-primary"
              >
                <Wrench size={18} />
                Repair Services
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">{inStockProducts.length} live products</span>
              <span className="rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">8 service categories</span>
              <span className="rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">Open late, 7 days</span>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur md:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-gradient-to-br from-sky-50 to-white p-5 ring-1 ring-sky-100">
                <ShieldCheck className="text-sky-600" size={22} />
                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">Trust layer</p>
                <h2 className="mt-2 text-xl font-bold text-slate-900">Warranty, repairs, and pickups</h2>
                <p className="mt-3 text-sm leading-7 text-brandTextMedium">
                  Get clear service paths for repairs, device sales, pickups, and product browsing without leaving the site.
                </p>
              </div>

              <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-white p-5 ring-1 ring-emerald-100">
                <CalendarDays className="text-primary" size={22} />
                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Booking</p>
                <h2 className="mt-2 text-xl font-bold text-slate-900">Book drop-off or pickup</h2>
                <p className="mt-3 text-sm leading-7 text-brandTextMedium">
                  Use the appointment panel to request pickup, drop-off, or a callback from the PZM team.
                </p>
              </div>

              <div className="rounded-3xl bg-slate-950 p-5 text-white sm:col-span-2">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-200">Store details</p>
                <h2 className="mt-2 text-2xl font-bold">{siteIdentity.name}</h2>
                <div className="mt-4 grid gap-3 text-sm text-slate-200 md:grid-cols-3">
                  <a href={siteContact.phoneHref} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:bg-white/10">
                    Call {siteContact.phoneDisplay}
                  </a>
                  <a href={siteContact.mapsHref} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:bg-white/10">
                    Get directions
                  </a>
                  <Link to="/services" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:bg-white/10">
                    Explore services
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          badge="What We Do"
          title="Our Services"
          description="From expert repairs to custom builds, explore the main ways PZM can help with your device, setup, or next purchase."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {homeServiceCards.map((card) => (
            <Link
              key={card.title}
              to={card.to}
              className="group relative overflow-hidden rounded-[28px] border border-brandBorder bg-white shadow-sm transition-all hover:-translate-y-1.5 hover:border-transparent hover:shadow-xl"
            >
              {card.imageUrl ? (
                <div className="relative h-40 overflow-hidden bg-slate-100">
                  <img
                    src={card.imageUrl}
                    alt={card.imageAlt || card.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-slate-950/10 to-transparent" />
                  <div className={`absolute left-5 top-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accentClassName} text-2xl shadow-sm`}>
                    {card.emoji}
                  </div>
                </div>
              ) : (
                <div className="p-7 pb-0">
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accentClassName} text-2xl shadow-sm`}>
                    {card.emoji}
                  </div>
                </div>
              )}

              <div className="p-7">
                <h3 className="text-xl font-bold text-slate-900">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-brandTextMedium">{card.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 transition-all group-hover:gap-3 group-hover:text-primary">
                  {card.cta}
                  <ArrowRight size={16} />
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-sky-500 to-primary transition-transform group-hover:scale-x-100" />
            </Link>
          ))}
        </div>
      </section>

      <section id="products" className="border-y border-slate-200/70 bg-slate-50/80 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            badge="Featured"
            title="Shop by Category"
            description="Brand new devices with official warranty and certified pre-owned stock at prices that make sense in Dubai."
          />

          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {homeFeaturedCategories.map((category) => (
              <Link
                key={category.title}
                to={category.to}
                className="group overflow-hidden rounded-[30px] border border-brandBorder bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="grid min-h-[280px] grid-cols-1 md:grid-cols-[220px,1fr]">
                  <div className="bg-slate-100">
                    <img src={category.imageUrl} alt={category.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-center p-7 md:p-8">
                    <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${category.badgeClassName}`}>
                      {category.tag}
                    </span>
                    <h3 className="mt-5 text-2xl font-bold text-slate-900">{category.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-brandTextMedium">{category.description}</p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 transition-all group-hover:gap-3 group-hover:text-primary">
                      Open category
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 rounded-[28px] border border-brandBorder bg-white px-6 py-5 shadow-sm md:flex md:items-center md:justify-between md:gap-6">
            <div>
              <p className="text-lg font-semibold text-slate-900">Live inventory already exists behind the category pages</p>
              <p className="mt-1 text-sm text-brandTextMedium">Use the storefront for product checkout, and use service pages for repair, trade-in, and callback funnels.</p>
            </div>
            <button
              onClick={onShopClick}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brandGreenDark md:mt-0"
            >
              Explore Device Pages
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Why PZM"
          title="Trusted by Dubai Residents"
          description="Serving Al Barsha and the wider Dubai corridor with quality devices, dependable repair handling, and clearer website conversion paths."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {homeTrustCards.map((card) => (
            <div key={card.title} className="rounded-[28px] border border-brandBorder bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="text-4xl">{card.emoji}</div>
              <h3 className="mt-5 text-xl font-bold text-slate-900">{card.title}</h3>
              <p className="mt-3 text-sm leading-7 text-brandTextMedium">{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="blog" className="bg-[linear-gradient(180deg,#f8fafc_0%,#f0f7ff_100%)] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            badge="Latest Updates"
            title="Tech Blog"
            description="The React blog now runs on canonical routes with first-party media, so the homepage can send visitors straight into the migrated article experience."
          />

          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {homeBlogTeasers.map((post) => (
              <Link
                key={post.title}
                to={post.href}
                className="overflow-hidden rounded-[28px] border border-brandBorder bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-36 overflow-hidden">
                  <img src={post.imageUrl} alt={post.title} className="h-full w-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent" />
                  <div className={`absolute inset-0 bg-gradient-to-br ${post.themeClassName} opacity-20`} />
                  <div className="absolute inset-0 p-6">
                    <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-sky-700 shadow-sm">
                      {post.tag}
                    </span>
                    <p className="mt-10 text-sm font-semibold text-white">{post.date}</p>
                  </div>
                </div>
                <div className="p-7">
                  <h3 className="text-xl font-bold leading-8 text-slate-900">{post.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-brandTextMedium">{post.description}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sky-700">
                    Read article
                    <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/blog/"
              className="inline-flex items-center gap-2 rounded-full border border-brandBorder bg-white px-5 py-3 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary"
            >
              Open Blog
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Testimonials"
          title="Customer Reviews"
          description="What customers are saying about PZM on Google and after real repair, trade-in, and purchase experiences."
        />
        <CustomerReviewsFallback />
      </section>

      <section id="faq" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          badge="FAQ"
          title="Frequently Asked Questions"
          description="Everything customers typically ask about warranty, repair timing, ordering, pickup, and how the store works in Dubai."
        />

        <div className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {homeFaqItems.map((item, index) => {
            const isOpen = openFaqIndex === index

            return (
              <div key={item.question} className="overflow-hidden rounded-[22px] border border-brandBorder bg-white shadow-sm transition-shadow hover:shadow-md">
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-base font-semibold text-slate-900">{item.question}</span>
                  <span className={`inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all ${isOpen ? 'rotate-180 bg-primary text-white' : ''}`}>
                    <ChevronDown size={18} />
                  </span>
                </button>
                <div className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 text-sm leading-7 text-brandTextMedium">{item.answer}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Areas We Serve in Dubai</h2>
          <p className="mt-3 text-base text-slate-300 md:text-lg">Based in Al Barsha, proudly serving customers from across Dubai.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {orderedAreas.map((area) => (
              <Link
                key={area.slug}
                to={`/areas/${area.slug}`}
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-200 transition-colors hover:border-primary hover:bg-primary hover:text-white"
              >
                {area.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="appointment" className="bg-[linear-gradient(180deg,#f0f7ff_0%,#e8f4fd_100%)] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr,1.1fr] lg:items-center">
          <div>
            <SectionHeader
              badge="Book Now"
              title="Book Drop-Off or Pickup"
              description="Choose whether you will bring the device to our Al Barsha store or ask us to collect and return it. Use the form to request service intake, pickup, or a callback from the team."
              align="left"
            />

            <div className="mt-8 space-y-4 rounded-[28px] border border-brandBorder bg-white/70 p-6 shadow-sm backdrop-blur">
              <div className="flex items-start gap-3">
                <Clock3 className="mt-1 text-primary" size={18} />
                <p className="text-sm leading-7 text-brandTextDark">Store drop-off can be booked for the same day, while pickup and return needs at least 24 hours notice.</p>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 text-primary" size={18} />
                <p className="text-sm leading-7 text-brandTextDark">Send the request online and the team will follow up with the details, availability, or next step.</p>
              </div>
              <div className="flex items-start gap-3">
                <ShoppingCart className="mt-1 text-primary" size={18} />
                <p className="text-sm leading-7 text-brandTextDark">Product buying still belongs in the live storefront and checkout flow. Booking is reserved for service-style journeys.</p>
              </div>
            </div>
          </div>

          <HomeAppointmentPanel />
        </div>
      </section>
    </div>
  )
}
