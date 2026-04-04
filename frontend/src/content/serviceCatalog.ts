import type { ServiceRequestKind } from '@shared/types'
import { buildApiUrl } from '../utils/siteConfig'

export interface ServiceRequestOption {
  value: ServiceRequestKind
  label: string
  description: string
}

export interface ServiceCatalogEntry {
  slug: string
  title: string
  description: string
  heroTitle: string
  heroDescription: string
  highlights: string[]
  requestKinds: ServiceRequestOption[]
  shopPath?: string
  imageUrl?: string
  imageAlt?: string
}

const legacyMedia = (path: string) => buildApiUrl(`/media/legacy/${path}`)

const quoteAndCallback: ServiceRequestOption[] = [
  { value: 'quote', label: 'Request a quote', description: 'Get pricing and availability from the team.' },
  { value: 'callback', label: 'Request a callback', description: 'Ask the team to call you back for details.' },
]

export const serviceCatalog: Record<string, ServiceCatalogEntry> = {
  repair: {
    slug: 'repair',
    title: 'Repair Services',
    description: 'Book phone, laptop, MacBook, console, and motherboard repair services in Dubai with first-party tracking on the PZM website.',
    heroTitle: 'Device repair without losing the lead to WhatsApp',
    heroDescription: 'Submit a repair request, pickup request, or callback directly on the website. You will get a reference ID immediately so the request stays attributable.',
    highlights: [
      'Phone, laptop, MacBook, console, and motherboard repair intake',
      'Pickup and drop-off requests can be tracked with a reference ID',
      'Keep service conversions inside the website instead of leaking to chat apps',
    ],
    imageUrl: legacyMedia('Services/repairing_services.jpg'),
    imageAlt: 'Repair services at PZM',
    requestKinds: [
      { value: 'booking', label: 'Book repair or drop-off', description: 'Reserve a repair visit, drop-off, or pickup slot.' },
      { value: 'quote', label: 'Request repair estimate', description: 'Describe the issue and ask for a cost estimate first.' },
      { value: 'callback', label: 'Request a callback', description: 'Ask the team to contact you and discuss the issue.' },
    ],
  },
  'sell-gadgets': {
    slug: 'sell-gadgets',
    title: 'Sell Your Device',
    description: 'Request a valuation for your phone, laptop, tablet, or console directly through the PZM website and keep the lead attributable.',
    heroTitle: 'Trade-in and sell-device requests that stay in your system',
    heroDescription: 'Tell us what you want to sell, its condition, and how to reach you. We will respond to a tracked request instead of forcing the user into WhatsApp first.',
    highlights: [
      'Useful for iPhones, Samsung devices, MacBooks, Windows laptops, tablets, and consoles',
      'Supports quote-first and callback flows for price discovery',
      'Creates an internal request reference you can track later',
    ],
    imageUrl: legacyMedia('Services/Sell_Your_Old_iPhones.jpg'),
    imageAlt: 'Sell your old iPhone at PZM',
    requestKinds: quoteAndCallback,
  },
  'gaming-pc': {
    slug: 'gaming-pc',
    title: 'Gaming PC Builds',
    description: 'Collect custom PC build requests on-site with budget, goals, and contact preferences saved to your own backend.',
    heroTitle: 'Custom build requests with an actual paper trail',
    heroDescription: 'Customers can submit their build goals, budget, and preferred specs directly here. That gives you a trackable request instead of a disappearing chat lead.',
    highlights: [
      'Budget-friendly, mid-range, and high-end build inquiries',
      'Good fit for gaming, workstation, streaming, and editing builds',
      'Structured intake before the sales conversation starts',
    ],
    imageUrl: legacyMedia('Catigories/GamingPC.JPG'),
    imageAlt: 'Gaming PC builds at PZM',
    requestKinds: [
      { value: 'quote', label: 'Request a build quote', description: 'Share your budget and goal to get a recommended configuration.' },
      { value: 'callback', label: 'Talk through the build', description: 'Ask the team to call you and discuss parts and timing.' },
      { value: 'booking', label: 'Schedule a consultation', description: 'Reserve a time to review the build in more detail.' },
    ],
  },
  accessories: {
    slug: 'accessories',
    title: 'Accessories',
    description: 'Ask about accessory availability, bundles, or pricing through a tracked request or browse current inventory.',
    heroTitle: 'Accessory inquiries with a route back to inventory',
    heroDescription: 'Use this page for availability questions and bundle requests, or jump straight to the live shop where the catalog is already tracked.',
    highlights: [
      'Chargers, cases, hubs, keyboards, controllers, and more',
      'Works for availability checks and bundle requests',
      'Pairs well with live catalog pages as they expand',
    ],
    imageUrl: legacyMedia('Catigories/mobile_accessories.jpg'),
    imageAlt: 'Accessories and peripherals at PZM',
    requestKinds: [
      { value: 'availability', label: 'Check availability', description: 'Ask whether a specific accessory is in stock.' },
      { value: 'quote', label: 'Request a bundle quote', description: 'Ask for pricing on multiple accessories together.' },
      { value: 'callback', label: 'Request a callback', description: 'Ask the team to contact you and guide the purchase.' },
    ],
    shopPath: '/shop',
  },
  'brand-new': {
    slug: 'brand-new',
    title: 'Brand New Devices',
    description: 'Keep the marketing page while directing serious shoppers into the tracked shop and checkout flow.',
    heroTitle: 'Brand-new device requests should end in your checkout, not in chat',
    heroDescription: 'This page keeps the service-style landing experience, but the primary conversion path can move into the live product and order flow where inventory exists.',
    highlights: [
      'Useful as a bridge between marketing copy and live inventory',
      'Supports availability checks for models not yet listed',
      'Designed for gradual parity without losing attribution',
    ],
    imageUrl: legacyMedia('Catigories/brand_new.jpg'),
    imageAlt: 'Brand new device range at PZM',
    requestKinds: [
      { value: 'availability', label: 'Check model availability', description: 'Ask about a model or configuration before ordering.' },
      { value: 'quote', label: 'Request a price confirmation', description: 'Ask for a confirmed price and stock status.' },
      { value: 'callback', label: 'Request a callback', description: 'Ask the team to help you choose before buying.' },
    ],
    shopPath: '/shop',
  },
  'buy-iphone': {
    slug: 'buy-iphone',
    title: 'Buy iPhone',
    description: 'Keep the iPhone landing-page experience while routing tracked demand into live product pages or on-site availability requests.',
    heroTitle: 'Use the landing page, keep the purchase on-site',
    heroDescription: 'This is the right model for migration: preserve the marketing page, but send ready buyers into your own catalog and checkout instead of WhatsApp.',
    highlights: [
      'Live catalog can absorb purchase-ready traffic',
      'Availability and callback requests cover missing SKUs during migration',
      'Keeps your payout tied to orders created on the website',
    ],
    imageUrl: legacyMedia('buy_iphone/iPhone_17_Pro_Max_all_colors.jpg'),
    imageAlt: 'iPhone 17 Pro Max color lineup at PZM',
    requestKinds: [
      { value: 'availability', label: 'Check iPhone availability', description: 'Ask whether a model, storage option, or color is available.' },
      { value: 'quote', label: 'Request a confirmed offer', description: 'Ask for pricing confirmation before placing the order.' },
      { value: 'callback', label: 'Request a callback', description: 'Talk to the team before choosing the right device.' },
    ],
    shopPath: '/shop',
  },
  secondhand: {
    slug: 'secondhand',
    title: 'Used Devices',
    description: 'Use tracked inquiries and the live catalog together for certified pre-owned devices.',
    heroTitle: 'Pre-owned demand should still be attributable',
    heroDescription: 'Used-device shoppers often ask questions first. This page gives them a tracked availability and callback path instead of losing the conversation to WhatsApp.',
    highlights: [
      'Great for color, storage, battery-health, and cosmetic-condition questions',
      'Pairs with the live catalog for in-stock used items',
      'Keeps service-style inquiries tied to the website',
    ],
    imageUrl: legacyMedia('buy_used/used_iphone_16_pro_max_main.webp'),
    imageAlt: 'Used devices at PZM',
    requestKinds: [
      { value: 'availability', label: 'Check used stock', description: 'Ask about stock, condition, or configuration.' },
      { value: 'quote', label: 'Request a price confirmation', description: 'Ask for a confirmed price on a used device.' },
      { value: 'callback', label: 'Request a callback', description: 'Talk through the options before buying.' },
    ],
    shopPath: '/shop',
  },
  'web-design': {
    slug: 'web-design',
    title: 'Website Design',
    description: 'Collect website-design inquiries directly inside your own project instead of outsourcing the lead to chat.',
    heroTitle: 'If the site sells web design, the lead should be stored here too',
    heroDescription: 'This route gives you a first-party request capture for website-design work with a proper reference ID and contact preferences.',
    highlights: [
      'Good for brochure sites, e-commerce, and landing pages',
      'Works for quote requests and discovery calls',
      'Same attribution-first model as the other services',
    ],
    requestKinds: quoteAndCallback,
  },
}

const serviceAliases: Record<string, string> = {
  'buy-used': 'secondhand',
}

export const serviceCatalogList = Object.values(serviceCatalog)

export function resolveServiceSlug(rawSlug?: string): ServiceCatalogEntry | null {
  if (!rawSlug) return null

  const normalized = rawSlug.replace(/\.html$/i, '').toLowerCase()
  const resolved = serviceAliases[normalized] || normalized

  return serviceCatalog[resolved] || null
}