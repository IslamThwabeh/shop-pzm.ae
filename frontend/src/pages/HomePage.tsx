import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Zap, CheckCircle, Truck } from 'lucide-react'
import type { Product } from '@shared/types'
import Seo from '../components/Seo'
import FaqAccordion from '../components/FaqAccordion'
import CategoryCard from '../components/CategoryCard'
import RetailImage from '../components/RetailImage'
import TestimonialCards from '../components/TestimonialCards'
import {
  homeCategoryCards,
  homeFaqItems,
  homeTrustCards,
} from '../content/homePageContent'
import { blogPostsNewestFirst } from '../content/blogCatalog'
import { siteContact, siteIdentity } from '../content/siteData'
import { buildCanonicalUrl, toAbsoluteSiteUrl } from '../utils/siteConfig'

interface HomePageProps {
  products: Product[]
  onShopClick: () => void
}

const trustIcons = [ShieldCheck, Zap, CheckCircle, Truck] as const

export default function HomePage({ onShopClick }: HomePageProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const elements = Array.from(document.querySelectorAll<HTMLElement>('.reveal-on-scroll'))

    if (reduceMotion || !('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('is-visible'))
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.18, rootMargin: '0px 0px -40px 0px' },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: homeFaqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  const storeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ComputerStore',
    name: siteIdentity.name,
    description:
      'Buy, sell, fix, and build with PZM in Al Barsha, Dubai. New and used iPhones, MacBooks, gaming PCs, repairs, accessories, and local service support.',
    url: buildCanonicalUrl('/'),
    telephone: '+971528026677',
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${siteContact.addressLine1}, ${siteContact.addressLine2}`,
      addressLocality: 'Dubai',
      addressCountry: 'AE',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 25.0848627, longitude: 55.1992671 },
    hasMap: siteContact.mapsHref,
    image: toAbsoluteSiteUrl('/images/mini_logo.png'),
    priceRange: 'AED 150 - AED 7,000',
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Seo
        title="Buy iPhones, Laptops & Repair Dubai | PZM Store"
        description="PZM Computers & Phones Store in Al Barsha, Dubai for new and used devices, expert repairs, custom PC builds, accessories, and same-day local support."
        canonicalPath="/"
        jsonLd={[storeJsonLd, faqJsonLd]}
      />

      {/* ── Hero ────────────────────────────────────── */}
      <section className="px-4 pt-16 pb-12 text-center sm:px-6 sm:pt-20 sm:pb-16 lg:px-8 lg:pt-24 lg:pb-20">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-[2rem] font-extrabold leading-[1.1] tracking-tight text-slate-950 sm:text-[2.6rem] lg:text-[3.2rem]">
            {siteIdentity.name}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-slate-500">
            New &amp; used devices, expert repairs, and custom builds — Al Barsha, Dubai.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={onShopClick}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Browse Products
              <ArrowRight size={16} />
            </button>
            <Link
              to="/services/repair/"
              className="inline-flex items-center gap-2 rounded-xl border border-[#eee] px-7 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900"
            >
              Repair Services
            </Link>
          </div>
        </div>
      </section>

      {/* ── Shop by Category ─────────────────────────── */}
      <section id="products" className="reveal-on-scroll border-t border-[#eee] bg-[#fafafa] px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-[1.75rem]">Shop by Category</h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-sm text-slate-500">
            Browse devices and services — tap any category to explore.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {homeCategoryCards.map((cat) => (
              <CategoryCard
                key={cat.title}
                title={cat.title}
                subtitle={cat.subtitle}
                to={cat.to}
                imageUrl={cat.imageUrl}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Strip ──────────────────────────────── */}
      <section className="reveal-on-scroll border-t border-[#eee] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 sm:grid-cols-4">
          {homeTrustCards.map((card, i) => {
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

      {/* ── Testimonials ─────────────────────────────── */}
      <section className="reveal-on-scroll border-t border-[#eee] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold text-slate-900">Customer Reviews</h2>
          <div className="mt-10">
            <TestimonialCards />
          </div>
        </div>
      </section>

      {/* ── Blog ─────────────────────────────────────── */}
      <section className="reveal-on-scroll border-t border-[#eee] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold text-slate-900">Latest from the Blog</h2>
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
                    {new Date(`${post.publishedAt}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <h3 className="mt-3 text-xl font-bold leading-8 text-slate-950">{post.title}</h3>
                  <p className="mt-3 line-clamp-2 text-sm leading-7 text-brandTextMedium">{post.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Read article
                    <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/blog/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              View all articles
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────── */}
      <section id="faq" className="reveal-on-scroll border-t border-[#eee] bg-[#fafafa] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
          <div className="mt-10">
            <FaqAccordion items={homeFaqItems} />
          </div>
        </div>
      </section>
    </div>
  )
}
