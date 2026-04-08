import { normalizeSitePath } from '../utils/siteConfig'

export interface AreaServiceLink {
  label: string
  to: string
  description: string
}

const page = normalizeSitePath

export interface AreaCatalogEntry {
  slug: string
  name: string
  badge: string
  title: string
  metaTitle: string
  description: string
  heroTitle: string
  heroDescription: string
  travelNote: string
  localSummary: string
  nearbyCommunities: string[]
  advantages: string[]
  featuredServices: AreaServiceLink[]
  areaServed: string[]
}

const standardFeaturedServices: AreaServiceLink[] = [
  {
    label: 'Buy iPhone',
    to: page('/services/buy-iphone'),
    description: 'iPhone models and ordering.',
  },
  {
    label: 'Repair Services',
    to: page('/services/repair'),
    description: 'Repairs, drop-off, and pickup.',
  },
  {
    label: 'Sell Your Device',
    to: page('/services/sell-gadgets'),
    description: 'Trade-in and sell-device quotes.',
  },
  {
    label: 'Gaming PC Builds',
    to: page('/services/gaming-pc'),
    description: 'Custom gaming and workstation builds.',
  },
]

export const areaCatalog: Record<string, AreaCatalogEntry> = {
  'al-barsha': {
    slug: 'al-barsha',
    name: 'Al Barsha',
    badge: 'Home Base',
    title: 'Phone and Laptop Store in Al Barsha and Dubai Science Park',
    metaTitle: 'Phone and Laptop Store in Al Barsha & Dubai Science Park | PZM',
    description:
      'PZM serves Al Barsha, Barsha 1-3, and Dubai Science Park with iPhones, laptops, repairs, accessories, and custom PC builds from Hessa Street.',
    heroTitle: 'Phone and Laptop Store in Al Barsha and Dubai Science Park',
    heroDescription:
      'Walk in for iPhones, repairs, trade-ins, accessories, and PC builds from Al Barsha, Barsha 1-3, and Dubai Science Park.',
    travelNote: 'Inside Hessa Union Coop Hypermarket on Hessa Street.',
    localSummary:
      'PZM is inside Hessa Union Coop Hypermarket, making Al Barsha, Barsha 1-3, and Dubai Science Park one of the fastest access points for same-day repair intake, product collection, and on-site help.',
    nearbyCommunities: ['Barsha 1', 'Barsha 2', 'Barsha 3', 'Dubai Science Park', 'Al Barsha South'],
    advantages: [
      'Fastest walk-in option for same-day repair intake and accessory pickup.',
      'Best route for customers who want to check online and complete the purchase in-store.',
      'Good starting point for repair, trade-in, and build consultations close to the branch.',
    ],
    featuredServices: standardFeaturedServices,
    areaServed: ['Al Barsha, Dubai', 'Barsha 1, Dubai', 'Barsha 2, Dubai', 'Barsha 3, Dubai', 'Al Barsha 1, Dubai', 'Al Barsha 2, Dubai', 'Al Barsha 3, Dubai', 'Dubai Science Park, Dubai', 'Al Barsha South, Dubai'],
  },
  'al-quoz': {
    slug: 'al-quoz',
    name: 'Al Quoz',
    badge: 'Quick Access',
    title: 'Phone and Laptop Services Near Al Quoz, Dubai',
    metaTitle: 'Phone and Laptop Services Near Al Quoz Dubai | PZM',
    description:
      'PZM supports Al Quoz with device sales, repairs, accessories, and gaming PC builds from nearby Al Barsha.',
    heroTitle: 'Phone and Laptop Services Near Al Quoz',
    heroDescription:
      'A short drive for repairs, accessories, device buying, and trade-ins.',
    travelNote: 'Minutes away from Al Quoz via Hessa Street.',
    localSummary:
      'Al Quoz customers often need reliable repairs, used devices, and quick accessory pickup. This page helps them confirm the best next step before the visit even starts.',
    nearbyCommunities: ['Al Quoz 1', 'Al Quoz 2', 'Al Quoz 3', 'Al Quoz Industrial'],
    advantages: [
      'Strong fit for quick repair quotes and same-day drop-off planning.',
      'Useful for customers comparing new and used devices before heading over.',
      'Good location for trade-in requests that need a physical follow-up shortly after submission.',
    ],
    featuredServices: standardFeaturedServices,
    areaServed: ['Al Quoz, Dubai', 'Al Quoz 1, Dubai', 'Al Quoz 2, Dubai', 'Al Quoz 3, Dubai', 'Al Quoz Industrial, Dubai'],
  },
  'dubai-marina': {
    slug: 'dubai-marina',
    name: 'Dubai Marina',
    badge: 'Delivery Friendly',
    title: 'Phone and Laptop Services for Dubai Marina and JLT',
    metaTitle: 'Phone and Laptop Services for Dubai Marina & JLT | PZM',
    description:
      'PZM supports Dubai Marina and JLT with device sales, repairs, trade-ins, and upgrades.',
    heroTitle: 'Phone and Laptop Services for Dubai Marina',
    heroDescription:
      'Repairs, iPhones, trade-ins, and gaming PC support for Dubai Marina and JLT.',
    travelNote: 'Usually reachable in 10 to 15 minutes via Sheikh Zayed Road.',
    localSummary:
      'Marina customers usually want timing and next steps first, so quick online requests help avoid unnecessary trips.',
    nearbyCommunities: ['Dubai Marina', 'JLT', 'Marina Gate', 'Beachfront'],
    advantages: [
      'Quick confirmation matters more here than pure walk-in traffic.',
      'Callback and quote requests reduce wasted trips.',
      'Good fit for premium-device buyers and gaming-build customers who want structured follow-up.',
    ],
    featuredServices: standardFeaturedServices,
    areaServed: ['Dubai Marina, Dubai', 'Jumeirah Lakes Towers (JLT), Dubai', 'JLT, Dubai', 'Marina Gate, Dubai', 'Beachfront, Dubai'],
  },
  'emirates-hills': {
    slug: 'emirates-hills',
    name: 'Emirates Hills',
    badge: 'Premium Communities',
    title: 'Phone and Laptop Services for Emirates Hills, Springs, and Meadows Village',
    metaTitle: 'Phone and Laptop Services for Emirates Hills, Springs & Meadows | PZM',
    description:
      'PZM serves Emirates Hills, Springs, and Meadows Village with repairs, device buying, and PC build support.',
    heroTitle: 'Phone and Laptop Services for Emirates Hills',
    heroDescription:
      'Repairs, device buying, and custom build help for Emirates Hills, Springs, and Meadows Village.',
    travelNote: 'Usually 5 to 10 minutes from these nearby communities.',
    localSummary:
      'This audience usually expects faster confirmation and a cleaner handoff. Clear online requests work better than long back-and-forth messaging.',
    nearbyCommunities: ['Springs', 'Meadows Village', 'Emirates Hills', 'The Meadows', 'The Lakes'],
    advantages: [
      'Works well for callback-first buying journeys and premium repair intake.',
      'Good fit for customers who want clear confirmation before the follow-up starts.',
      'Useful for structured PC-build conversations with budget and requirements captured up front.',
    ],
    featuredServices: standardFeaturedServices,
    areaServed: ['Emirates Hills, Dubai', 'Springs, Dubai', 'The Springs, Dubai', 'Meadows Village, Dubai', 'The Meadows, Dubai', 'The Lakes, Dubai'],
  },
  jbr: {
    slug: 'jbr',
    name: 'JBR',
    badge: 'Beachside Demand',
    title: 'Phone and Laptop Services for JBR and nearby communities',
    metaTitle: 'Phone and Laptop Services for JBR Dubai | PZM',
    description:
      'PZM supports JBR with device buying, repairs, upgrades, and trade-ins.',
    heroTitle: 'Phone and Laptop Services for JBR',
    heroDescription:
      'Repairs, iPhones, used devices, and gaming PC help for JBR and nearby communities.',
    travelNote: 'Most visits from JBR take around 10 to 15 minutes depending on traffic.',
    localSummary:
      'JBR traffic is high-intent but time-sensitive. Fast confirmation matters more than long back-and-forth messages.',
    nearbyCommunities: ['JBR', 'Bluewaters', 'Dubai Harbour', 'Marina promenade'],
    advantages: [
      'Best for quick callback requests before a trip to the store.',
      'Helps reduce drop-off when customers are comparing several options quickly.',
      'Helpful for beachside and tourist-area shoppers who want quick answers before heading over.',
    ],
    featuredServices: standardFeaturedServices,
    areaServed: ['Jumeirah Beach Residence, Dubai', 'Bluewaters, Dubai', 'Dubai Harbour, Dubai'],
  },
  jumeirah: {
    slug: 'jumeirah',
    name: 'Jumeirah',
    badge: 'West Dubai Coverage',
    title: 'Phone and Laptop Services for Jumeirah and Umm Suqeim',
    metaTitle: 'Phone and Laptop Services for Jumeirah Dubai | PZM',
    description:
      'PZM serves Jumeirah and Umm Suqeim with device sales, repairs, accessories, and upgrades.',
    heroTitle: 'Phone and Laptop Services for Jumeirah',
    heroDescription:
      'Repairs, iPhones, accessories, and device buying for Jumeirah and Umm Suqeim.',
    travelNote: 'Usually 10 to 15 minutes via Al Wasl Road or Hessa Street.',
    localSummary:
      'Customers here often want clear warranty, timing, and pricing information first. Online requests help them get answers before they travel.',
    nearbyCommunities: ['Jumeirah 1', 'Jumeirah 2', 'Jumeirah 3', 'Umm Suqeim'],
    advantages: [
      'Good fit for premium-device questions and repair consultations.',
      'Works well for customers who want product or warranty clarity before they move.',
      'Works well for customers who prefer to confirm details online before they visit.',
    ],
    featuredServices: standardFeaturedServices,
    areaServed: ['Jumeirah, Dubai', 'Jumeirah 1, Dubai', 'Jumeirah 2, Dubai', 'Jumeirah 3, Dubai', 'Umm Suqeim, Dubai'],
  },
  'jumeirah-village': {
    slug: 'jumeirah-village',
    name: 'Jumeirah Village',
    badge: 'Near Hessa Street',
    title: 'Phone and Laptop Services for JVC and JVT',
    metaTitle: 'Phone and Laptop Services for JVC & JVT | PZM Dubai',
    description:
      'PZM supports JVC and JVT with repairs, trade-ins, iPhones, and device support from nearby Al Barsha.',
    heroTitle: 'Phone and Laptop Services for JVC and JVT',
    heroDescription:
      'A nearby stop for repairs, trade-ins, iPhones, and used devices from JVC and JVT.',
    travelNote: 'Typically a 5 to 10 minute drive via Hessa Street.',
    localSummary:
      'JVC and JVT are close enough that customers can quickly confirm repair timing or callback details before stopping by.',
    nearbyCommunities: ['JVC', 'JVT', 'Hessa Street communities', 'District One villas nearby'],
    advantages: [
      'Very practical for repair booking, callback requests, and quick questions.',
      'Short travel time makes same-day follow-up realistic once the team has the details.',
      'Good fit for customers comparing new and used devices before heading in.',
    ],
    featuredServices: standardFeaturedServices,
    areaServed: ['Jumeirah Village Circle (JVC), Dubai', 'JVC, Dubai', 'Jumeirah Village Triangle (JVT), Dubai', 'JVT, Dubai'],
  },
  tecom: {
    slug: 'tecom',
    name: 'Tecom',
    badge: 'Barsha Heights Coverage',
    title: 'Phone and Laptop Services for Tecom, Barsha Heights, and Al Sufouh',
    metaTitle: 'Phone and Laptop Services for Tecom, Barsha Heights & Al Sufouh | PZM',
    description:
      'PZM serves Tecom, Barsha Heights, Al Sufouh, Internet City, and Media City with repairs and device support.',
    heroTitle: 'Phone and Laptop Services for Tecom, Barsha Heights, and Al Sufouh',
    heroDescription:
      'Quick access from Tecom, Barsha Heights, Al Sufouh, Internet City, and Media City for repairs and device support.',
    travelNote: 'Usually around 5 to 10 minutes from Tecom, Barsha Heights, and Al Sufouh.',
    localSummary:
      'This area often needs quick turnaround from offices and nearby apartments, so fast responses and easy next steps matter.',
    nearbyCommunities: ['Tecom', 'Barsha Heights', 'Al Sufouh', 'Internet City', 'Media City'],
    advantages: [
      'Great for fast repair requests during the workday.',
      'Works well for customers who prefer a call back before leaving the office.',
      'Short travel time supports clean conversion from request form to visit.',
    ],
    featuredServices: standardFeaturedServices,
    areaServed: ['Tecom, Dubai', 'Barsha Heights, Dubai', 'Al Sufouh, Dubai', 'Dubai Internet City, Dubai', 'Internet City, Dubai', 'Dubai Media City, Dubai', 'Media City, Dubai'],
  },
}

export const areaCatalogList = Object.values(areaCatalog)

export function resolveAreaSlug(rawSlug?: string): AreaCatalogEntry | null {
  if (!rawSlug) return null

  const normalized = rawSlug.replace(/\.html$/i, '').toLowerCase()
  if (normalized === 'index') return null

  return areaCatalog[normalized] || null
}