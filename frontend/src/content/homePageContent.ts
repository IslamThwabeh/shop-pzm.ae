import { buildApiUrl, normalizeSitePath } from '../utils/siteConfig'

export interface HomeTrustCard {
  emoji: string
  title: string
  description: string
}

export interface HomeFaqItem {
  question: string
  answer: string
}

const page = normalizeSitePath
const svcMedia = (path: string) => buildApiUrl(`/media/${path}`)

export interface HomeCategoryCard {
  title: string
  subtitle?: string
  to: string
  imageUrl?: string
}

export const homeCategoryCards: HomeCategoryCard[] = [
  {
    title: 'Buy iPhone',
    subtitle: 'iPhone 17 series & more',
    to: page('/services/buy-iphone'),
    imageUrl: svcMedia('generated/services/buy-iphone/buy-iphone-service.webp'),
  },
  {
    title: 'New Devices',
    subtitle: 'Official warranty',
    to: page('/services/brand-new'),
    imageUrl: svcMedia('generated/services/brand-new/brand-new-service.webp'),
  },
  {
    title: 'Used Devices',
    subtitle: 'Certified pre-owned',
    to: page('/services/secondhand'),
    imageUrl: svcMedia('generated/services/secondhand/secondhand-service.webp'),
  },
  {
    title: 'Gaming PCs',
    subtitle: 'Custom builds',
    to: page('/services/gaming-pc'),
    imageUrl: svcMedia('generated/services/gaming-pc/gaming-pc-builds-service.webp'),
  },
  {
    title: 'Sell Your Device',
    subtitle: 'Get a fair quote',
    to: page('/services/sell-gadgets'),
    imageUrl: svcMedia('generated/services/sell-gadgets/sell-devices-service.webp'),
  },
  {
    title: 'Accessories',
    subtitle: 'Cases, chargers & more',
    to: page('/services/accessories'),
    imageUrl: svcMedia('generated/services/accessories/accessories-service.webp'),
  },
  {
    title: 'Repair Services',
    subtitle: 'Same-day fixes',
    to: page('/services/repair'),
    imageUrl: svcMedia('generated/services/repair/repair-services.webp'),
  },
  {
    title: 'Website Design',
    subtitle: 'Professional sites',
    to: page('/services/web-design'),
    imageUrl: svcMedia('generated/services/web-design/website-design-service.webp'),
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
    description: 'Can\'t visit? We\'ll pick up your device and deliver it back after repair or service.',
  },
]

export const homeFaqItems: HomeFaqItem[] = [
  {
    question: 'Do you offer warranty on used devices?',
    answer: 'Yes. Certified pre-owned devices include warranty coverage, and iPhones and MacBooks typically include a 30-day hardware warranty.',
  },
  {
    question: 'How long does a phone or laptop repair take?',
    answer: 'Most phone repairs are completed within 30 to 60 minutes. Laptop and motherboard-level jobs may take 1 to 3 business days depending on complexity and the parts required.',
  },
  {
    question: 'Can I sell my old phone or laptop to you?',
    answer: 'Yes. Use the Sell Your Device service page or the booking panel to request a valuation, or visit the store for an in-person evaluation.',
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
    answer: 'Yes. Browse the device pages on the website, tap WhatsApp Us on any product, and the team will handle delivery details directly in the chat.',
  },
  {
    question: 'What are your working hours?',
    answer: 'Please check the Contact Us section on this page for our latest and most accurate working hours, or message us on WhatsApp for instant confirmation.',
  },
]
