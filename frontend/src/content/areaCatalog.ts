export interface AreaServiceLink {
  label: string
  to: string
  description: string
}

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
    to: '/services/buy-iphone',
    description: 'Check current model availability before you visit or request a callback.',
  },
  {
    label: 'Repair Services',
    to: '/services/repair',
    description: 'Submit a tracked repair request instead of starting from an untracked chat thread.',
  },
  {
    label: 'Sell Your Device',
    to: '/services/sell-gadgets',
    description: 'Send a trade-in request with your model and condition so the team can respond faster.',
  },
  {
    label: 'Gaming PC Builds',
    to: '/services/gaming-pc',
    description: 'Collect consultation and build-budget requests directly inside the website.',
  },
]

export const areaCatalog: Record<string, AreaCatalogEntry> = {
  'al-barsha': {
    slug: 'al-barsha',
    name: 'Al Barsha',
    badge: 'Home Base',
    title: 'Phone and Laptop Store in Al Barsha, Dubai',
    metaTitle: 'Phone and Laptop Store in Al Barsha Dubai | PZM',
    description:
      'PZM serves Al Barsha from its Hessa Street branch with iPhones, laptops, repairs, accessories, and custom PC builds.',
    heroTitle: 'Your closest PZM branch for walk-in service in Al Barsha',
    heroDescription:
      'Customers from Al Barsha 1, 2, 3, and Al Barsha South can reach the store quickly for product pickup, repair drop-off, trade-ins, and custom build consultations.',
    travelNote: 'Walk in directly or call ahead before you visit the Hessa Street branch.',
    localSummary:
      'PZM is inside Hessa Union Coop Hypermarket, making Al Barsha the fastest access point for same-day repair intake, product collection, and on-site help.',
    nearbyCommunities: ['Al Barsha 1', 'Al Barsha 2', 'Al Barsha 3', 'Al Barsha South'],
    advantages: [
      'Fastest walk-in option for same-day repair intake and accessory pickup.',
      'Best route for customers who want to confirm stock online and complete the purchase in-store.',
      'Good starting point for repair, trade-in, and build consultations without relying on WhatsApp.',
    ],
    featuredServices: standardFeaturedServices,
    areaServed: ['Al Barsha, Dubai', 'Al Barsha 1, Dubai', 'Al Barsha 2, Dubai', 'Al Barsha 3, Dubai', 'Al Barsha South, Dubai'],
  },
  'al-quoz': {
    slug: 'al-quoz',
    name: 'Al Quoz',
    badge: 'Quick Access',
    title: 'Phone and Laptop Services Near Al Quoz, Dubai',
    metaTitle: 'Phone and Laptop Services Near Al Quoz Dubai | PZM',
    description:
      'PZM supports Al Quoz customers with device sales, repairs, accessories, and gaming PC builds from the nearby Hessa Street branch.',
    heroTitle: 'A nearby option for Al Quoz device repairs and purchases',
    heroDescription:
      'Customers in Al Quoz can reach PZM quickly for repairs, trade-ins, accessories, and product collection without leaving the main Dubai corridor.',
    travelNote: 'A short drive from Al Quoz makes this a practical repair and purchase stop.',
    localSummary:
      'Al Quoz customers often need reliable repairs, used devices, and quick accessory pickup. The replacement site should make those requests attributable before the visit even starts.',
    nearbyCommunities: ['Al Quoz 1', 'Al Quoz 2', 'Al Quoz 3', 'Al Quoz Industrial'],
    advantages: [
      'Strong fit for quick repair quotes and same-day drop-off planning.',
      'Useful for customers comparing new and used stock before heading over.',
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
    metaTitle: 'Phone and Laptop Services for Dubai Marina | PZM',
    description:
      'PZM supports Dubai Marina and JLT customers with tracked requests for buying, repairing, selling, and upgrading devices.',
    heroTitle: 'Track your request before you travel from Dubai Marina',
    heroDescription:
      'Dubai Marina and JLT customers can use the website to confirm stock, submit repair details, or request a callback before making the 10 to 15 minute trip.',
    travelNote: 'Usually reachable in 10 to 15 minutes via Sheikh Zayed Road.',
    localSummary:
      'Marina customers are more likely to check availability and timing first, so the replacement site should capture those requests directly instead of pushing them into WhatsApp.',
    nearbyCommunities: ['Dubai Marina', 'JLT', 'Marina Gate', 'Beachfront'],
    advantages: [
      'Availability checks matter more here than pure walk-in traffic.',
      'Callback and quote requests reduce wasted trips for out-of-stock items.',
      'Good fit for premium-device buyers and gaming-build customers who want structured follow-up.',
    ],
    featuredServices: standardFeaturedServices,
    areaServed: ['Dubai Marina, Dubai', 'JLT, Dubai', 'Marina Gate, Dubai', 'Beachfront, Dubai'],
  },
  'emirates-hills': {
    slug: 'emirates-hills',
    name: 'Emirates Hills',
    badge: 'Premium Communities',
    title: 'Phone and Laptop Services for Emirates Hills, Springs, and Meadows',
    metaTitle: 'Phone and Laptop Services for Emirates Hills Dubai | PZM',
    description:
      'PZM serves Emirates Hills, Springs, and Meadows with product availability checks, repair intake, and custom PC consultation requests.',
    heroTitle: 'A practical service point for Emirates Hills and nearby communities',
    heroDescription:
      'Customers from Emirates Hills, Springs, and Meadows can use the site to confirm stock, arrange repairs, and submit build requests before visiting the store.',
    travelNote: 'Normally a 5 to 10 minute drive from these nearby residential communities.',
    localSummary:
      'This audience usually expects cleaner handoff and faster confirmation. Attributable on-site forms are more useful than chat-only follow-up.',
    nearbyCommunities: ['Emirates Hills', 'The Springs', 'The Meadows', 'The Lakes'],
    advantages: [
      'Works well for callback-first buying journeys and premium repair intake.',
      'Good fit for customers who want a clean reference ID before the follow-up starts.',
      'Useful for structured PC-build conversations with budget and requirements captured up front.',
    ],
    featuredServices: standardFeaturedServices,
    areaServed: ['Emirates Hills, Dubai', 'The Springs, Dubai', 'The Meadows, Dubai', 'The Lakes, Dubai'],
  },
  jbr: {
    slug: 'jbr',
    name: 'JBR',
    badge: 'Beachside Demand',
    title: 'Phone and Laptop Services for JBR and nearby communities',
    metaTitle: 'Phone and Laptop Services for JBR Dubai | PZM',
    description:
      'PZM supports JBR customers with tracked requests for buying, repairing, upgrading, and selling devices before the store visit.',
    heroTitle: 'Use the site first, then head over from JBR only when it makes sense',
    heroDescription:
      'JBR customers often want a quick answer before traveling. The replacement site should give them availability, quote, and callback flows with a paper trail.',
    travelNote: 'Most visits from JBR take around 10 to 15 minutes depending on traffic.',
    localSummary:
      'JBR traffic is high-intent but time-sensitive. Request capture and confirmation matter more than chat-heavy back and forth.',
    nearbyCommunities: ['JBR', 'Bluewaters', 'Dubai Harbour', 'Marina promenade'],
    advantages: [
      'Best for callback and availability requests before a trip to the store.',
      'Helps reduce drop-off when customers are comparing several options quickly.',
      'Keeps beachside and tourist-area demand attributable instead of sending it straight to chat.',
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
      'PZM serves Jumeirah and Umm Suqeim with device sales, repair intake, accessory requests, and premium product availability checks.',
    heroTitle: 'Jumeirah shoppers can confirm stock and service timing before they travel',
    heroDescription:
      'For customers coming from Jumeirah and Umm Suqeim, the replacement site should handle the first conversation through product or service requests, not WhatsApp-first routing.',
    travelNote: 'Usually 10 to 15 minutes away via Al Wasl Road or Hessa Street connections.',
    localSummary:
      'Customers here often need clear availability, warranty, and timing information first. Structured online requests are the right replacement model.',
    nearbyCommunities: ['Jumeirah 1', 'Jumeirah 2', 'Jumeirah 3', 'Umm Suqeim'],
    advantages: [
      'Good fit for premium-device availability checks and repair consultations.',
      'Works well for customers who want product or warranty clarity before they move.',
      'Supports a cleaner conversion path than legacy WhatsApp-first inquiries.',
    ],
    featuredServices: standardFeaturedServices,
    areaServed: ['Jumeirah, Dubai', 'Jumeirah 1, Dubai', 'Jumeirah 2, Dubai', 'Jumeirah 3, Dubai', 'Umm Suqeim, Dubai'],
  },
  'jumeirah-village': {
    slug: 'jumeirah-village',
    name: 'Jumeirah Village',
    badge: 'Near Hessa Street',
    title: 'Phone and Laptop Services for JVC and JVT',
    metaTitle: 'Phone and Laptop Services for Jumeirah Village Dubai | PZM',
    description:
      'PZM supports JVC and JVT customers with tracked repair, quote, callback, and availability requests from the nearby Hessa Street branch.',
    heroTitle: 'A strong nearby option for JVC and JVT customers',
    heroDescription:
      'Jumeirah Village customers are close enough for fast follow-up, which makes tracked service requests especially useful for repairs, trade-ins, and high-intent device purchases.',
    travelNote: 'Typically a 5 to 10 minute drive via Hessa Street.',
    localSummary:
      'JVC and JVT are close enough that the website can act as a clean pre-visit intake layer without slowing down real conversions.',
    nearbyCommunities: ['JVC', 'JVT', 'District One villas nearby', 'Hessa Street communities'],
    advantages: [
      'Very practical for repair booking, callback requests, and quick availability checks.',
      'Short travel time makes same-day follow-up realistic after the first request is submitted.',
      'Good fit for customers comparing new and used stock before heading in.',
    ],
    featuredServices: standardFeaturedServices,
    areaServed: ['Jumeirah Village Circle, Dubai', 'Jumeirah Village Triangle, Dubai'],
  },
  tecom: {
    slug: 'tecom',
    name: 'Tecom',
    badge: 'Barsha Heights Coverage',
    title: 'Phone and Laptop Services for Tecom and Barsha Heights',
    metaTitle: 'Phone and Laptop Services for Tecom Dubai | PZM',
    description:
      'PZM serves Tecom, Barsha Heights, Internet City, and Media City with product, repair, and build-request flows that stay on-site.',
    heroTitle: 'A close option for Tecom, Barsha Heights, and nearby office hubs',
    heroDescription:
      'Tecom-area customers often need a quick quote, callback, or product check before stepping out. The replacement site should handle that directly and keep the lead attributable.',
    travelNote: 'Often reachable in around 5 minutes from Tecom and Barsha Heights.',
    localSummary:
      'This area produces quick-turnaround demand from offices and nearby apartments, so the site should help visitors move from request to follow-up with minimal friction.',
    nearbyCommunities: ['Tecom', 'Barsha Heights', 'Internet City', 'Media City'],
    advantages: [
      'Great for fast repair and availability requests during the workday.',
      'Works well for customers who prefer a call back before leaving the office.',
      'Short travel time supports clean conversion from request form to visit.',
    ],
    featuredServices: standardFeaturedServices,
    areaServed: ['Tecom, Dubai', 'Barsha Heights, Dubai', 'Internet City, Dubai', 'Media City, Dubai'],
  },
}

export const areaCatalogList = Object.values(areaCatalog)

export function resolveAreaSlug(rawSlug?: string): AreaCatalogEntry | null {
  if (!rawSlug) return null

  const normalized = rawSlug.replace(/\.html$/i, '').toLowerCase()
  if (normalized === 'index') return null

  return areaCatalog[normalized] || null
}