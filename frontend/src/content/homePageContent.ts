import { buildApiUrl } from '../utils/siteConfig'

export interface HomeServiceCard {
  emoji: string
  title: string
  description: string
  to: string
  cta: string
  accentClassName: string
  imageUrl?: string
  imageAlt?: string
}

export interface HomeFeaturedCategory {
  tag: string
  title: string
  description: string
  to: string
  imageUrl: string
  badgeClassName: string
}

export interface HomeTrustCard {
  emoji: string
  title: string
  description: string
}

export interface HomeBlogTeaser {
  tag: string
  title: string
  description: string
  href: string
  date: string
  themeClassName: string
  imageUrl: string
}

export interface HomeFaqItem {
  question: string
  answer: string
}

const legacyMedia = (path: string) => buildApiUrl(`/media/legacy/${path}`)
const blogMedia = (filename: string) => buildApiUrl(`/media/blog/${filename}`)

export const homeServiceCards: HomeServiceCard[] = [
  {
    emoji: '🔧',
    title: 'Repair Services',
    description: 'Expert device repair and maintenance for iPhones, MacBooks, Samsung, and all major brands. Same-day service is available for many issues.',
    to: '/services/repair',
    cta: 'Learn more',
    accentClassName: 'from-amber-100 to-orange-50',
    imageUrl: legacyMedia('Services/repairing_services.jpg'),
    imageAlt: 'PZM repair services workspace',
  },
  {
    emoji: '🛍️',
    title: 'Shop Brand New',
    description: 'iPhones, Samsung, MacBooks, and gaming consoles with official warranty and fast support from the Al Barsha store.',
    to: '/services/brand-new',
    cta: 'Browse new devices',
    accentClassName: 'from-sky-100 to-cyan-50',
    imageUrl: legacyMedia('Catigories/brand_new.jpg'),
    imageAlt: 'Brand new devices at PZM',
  },
  {
    emoji: '✅',
    title: 'Certified Pre-Owned',
    description: 'Tested and graded iPhones, laptops, MacBooks, and tablets with warranty, transparent condition notes, and better value.',
    to: '/services/buy-used.html',
    cta: 'Browse used devices',
    accentClassName: 'from-emerald-100 to-green-50',
    imageUrl: legacyMedia('buy_used/used_iphone_16_pro_max_main.webp'),
    imageAlt: 'Certified pre-owned devices at PZM',
  },
  {
    emoji: '🖥️',
    title: 'Custom PC Build',
    description: 'Plan a gaming or workstation PC around your budget and performance goals, then keep the request attributable on-site.',
    to: '/services/gaming-pc',
    cta: 'Start building',
    accentClassName: 'from-violet-100 to-purple-50',
    imageUrl: legacyMedia('Catigories/GamingPC.JPG'),
    imageAlt: 'Custom gaming PC category at PZM',
  },
  {
    emoji: '📱',
    title: 'Buy iPhone',
    description: 'Use the iPhone landing page and live catalog together for new and used models, cash on delivery, and store pickup support.',
    to: '/services/buy-iphone',
    cta: 'View iPhones',
    accentClassName: 'from-pink-100 to-rose-50',
    imageUrl: legacyMedia('buy_iphone/iPhone_17_Pro_Max_all_colors.jpg'),
    imageAlt: 'iPhone 17 Pro Max colors at PZM',
  },
  {
    emoji: '💰',
    title: 'Sell Your Device',
    description: 'Submit a tracked trade-in request for your phone, laptop, tablet, or console instead of starting from an untracked chat thread.',
    to: '/services/sell-gadgets',
    cta: 'Get a quote',
    accentClassName: 'from-yellow-100 to-lime-50',
    imageUrl: legacyMedia('Services/Sell_Your_Old_iPhones.jpg'),
    imageAlt: 'Sell your old iPhone at PZM',
  },
  {
    emoji: '🎧',
    title: 'Accessories',
    description: 'Cases, chargers, headphones, peripherals, and bundled setups for phones, laptops, and gaming gear.',
    to: '/services/accessories',
    cta: 'Shop accessories',
    accentClassName: 'from-indigo-100 to-blue-50',
    imageUrl: legacyMedia('Catigories/mobile_accessories.jpg'),
    imageAlt: 'Phone and laptop accessories at PZM',
  },
  {
    emoji: '🌐',
    title: 'Website Design',
    description: 'Professional, mobile-friendly websites starting from AED 1,500, captured through first-party request flow just like the rest of the service catalog.',
    to: '/services/web-design',
    cta: 'See what is included',
    accentClassName: 'from-lime-100 to-emerald-50',
  },
]

export const homeFeaturedCategories: HomeFeaturedCategory[] = [
  {
    tag: 'Brand New',
    title: 'Latest Devices',
    description: 'iPhones, Samsung, MacBooks, and gaming consoles with official warranty and fast support from the Hessa Street branch.',
    to: '/services/brand-new',
    imageUrl: legacyMedia('Catigories/brand_new.jpg'),
    badgeClassName: 'bg-emerald-100 text-emerald-700',
  },
  {
    tag: 'Certified Used',
    title: 'Pre-Owned Devices',
    description: 'Certified used phones, laptops, tablets, and gaming PCs with clear grading, testing, and warranty support.',
    to: '/services/buy-used.html',
    imageUrl: legacyMedia('buy_used/used_iphone_16_pro_max_main.webp'),
    badgeClassName: 'bg-amber-100 text-amber-700',
  },
]

export const homeTrustCards: HomeTrustCard[] = [
  {
    emoji: '🛡️',
    title: 'Warranty Included',
    description: 'All devices come with genuine warranty coverage and clear support paths after purchase.',
  },
  {
    emoji: '⚡',
    title: 'Same-Day Repair',
    description: 'Many repair jobs are completed within hours, not days, with real store intake and follow-up.',
  },
  {
    emoji: '✅',
    title: 'Certified Pre-Owned',
    description: 'Each used device goes through testing and inspection before it is listed or handed over.',
  },
  {
    emoji: '🚗',
    title: 'Pickup and Delivery',
    description: 'Use the booking panel to request pickup and return without losing the lead outside the site.',
  },
]

export const homeBlogTeasers: HomeBlogTeaser[] = [
  {
    tag: 'Market',
    title: 'Gold Prices Hit Record Highs — What It Means for Tech Buyers in Dubai',
    description: 'How rising gold prices affect smartphone, laptop, and PC buying decisions in Dubai during 2026.',
    href: '/blog/gold-record-highs-tech-buyers-dubai-2026',
    date: 'March 28, 2026',
    themeClassName: 'from-amber-200 via-orange-100 to-white',
    imageUrl: blogMedia('pexels-photo-610525.jpeg'),
  },
  {
    tag: 'Market',
    title: 'How US Tariffs in 2026 Are Changing Electronics Prices in Dubai',
    description: 'A practical explanation of how global pricing pressure affects local iPhone, laptop, and gaming PC offers.',
    href: '/blog/us-tariffs-2026-electronics-prices-dubai',
    date: 'March 28, 2026',
    themeClassName: 'from-sky-200 via-cyan-100 to-white',
    imageUrl: blogMedia('pexels-photo-3943716.jpeg'),
  },
  {
    tag: 'Guide',
    title: 'The Smart Buyer\'s Guide to Used Laptops in Dubai (2026)',
    description: 'What to check, which models to target, and how to buy used laptops with more confidence in Dubai.',
    href: '/blog/ultimate-guide-buying-used-laptops',
    date: 'March 28, 2026',
    themeClassName: 'from-emerald-200 via-green-100 to-white',
    imageUrl: blogMedia('pexels-photo.jpg'),
  },
]

export const homeFaqItems: HomeFaqItem[] = [
  {
    question: 'Do you offer warranty on used devices?',
    answer: 'Yes. Certified pre-owned devices include warranty coverage, and iPhones and MacBooks typically include a 30-day hardware warranty.',
  },
  {
    question: 'How long does a phone or laptop repair take?',
    answer: 'Most phone repairs are completed within 30 to 60 minutes. Laptop and motherboard-level jobs may take 1 to 3 business days depending on complexity and parts availability.',
  },
  {
    question: 'Can I sell my old phone or laptop to you?',
    answer: 'Yes. Submit a tracked request through the Sell Your Device service page or the booking panel, or visit the store for evaluation.',
  },
  {
    question: 'Do you build custom gaming PCs?',
    answer: 'Yes. We build budget, mid-range, and high-end gaming or workstation PCs, including custom recommendations for your budget and workload.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept cash, bank transfer, and card payments. Website orders can also use Cash on Delivery where available in Dubai.',
  },
  {
    question: 'Where is your store located?',
    answer: 'We are inside Hessa Union Coop Hypermarket, Ground Floor, on Hessa Street in Al Barsha, Dubai, with easy parking and Google Maps directions on the site.',
  },
  {
    question: 'Can I order online and get delivery?',
    answer: 'Yes. Browse the shop on the website, place the order through the cart and checkout flow, and use phone or chat only as support if needed.',
  },
  {
    question: 'What are your working hours?',
    answer: 'We are open 7 days a week. Sunday is 10 AM to 1 AM, Monday to Friday is 10 AM to 11 PM, and Saturday is 10 AM to 12 AM Dubai time.',
  },
]

export const homeAreaOrder = [
  'al-barsha',
  'jumeirah-village',
  'tecom',
  'jbr',
  'emirates-hills',
  'jumeirah',
  'dubai-marina',
  'al-quoz',
]