import type { ServiceRequestKind } from '@shared/types'
import { buildApiUrl } from '../utils/siteConfig'

export interface ServiceRequestOption {
  value: ServiceRequestKind
  label: string
  description: string
}

export interface ServiceDetailSection {
  title: string
  items: string[]
}

export interface ServiceCatalogEntry {
  slug: string
  title: string
  description: string
  heroTitle: string
  heroDescription: string
  highlights: string[]
  requestKinds: ServiceRequestOption[]
  imageUrl?: string
  imageAlt?: string
  cardImageUrl?: string
  cardDescription?: string
  detailSections?: ServiceDetailSection[]
}

const generatedServiceMedia = (path: string) => buildApiUrl(`/media/generated/services/${path}`)

const quoteAndCallback: ServiceRequestOption[] = [
  { value: 'quote', label: 'Request a quote', description: 'Get pricing from the team.' },
  { value: 'callback', label: 'Request a callback', description: 'Ask the team to call you back.' },
]

export const serviceCatalog: Record<string, ServiceCatalogEntry> = {
  repair: {
    slug: 'repair',
    title: 'Repair Services',
    description: 'Phone, laptop, MacBook, console, and motherboard repairs in Dubai.',
    heroTitle: 'Repair phones, laptops, and consoles in Dubai',
    heroDescription: 'Screens, batteries, charging, board work, and same-day intake from our Al Barsha store.',
    highlights: [
      'Screen, battery, charging, and board repairs',
      'Phones, laptops, MacBooks, and consoles',
      'Walk-in, drop-off, and callback support',
    ],
    imageUrl: generatedServiceMedia('repair/repair-services.jpg'),
    imageAlt: 'Repair services at PZM',
    cardImageUrl: '/images/Catigories/mini_laptop_maintenance.webp',
    cardDescription: 'Expert device repair and maintenance',
    requestKinds: [
      { value: 'booking', label: 'Book repair or drop-off', description: 'Reserve a repair visit, drop-off, or pickup slot.' },
      { value: 'quote', label: 'Request repair estimate', description: 'Describe the issue and ask for a cost estimate first.' },
      { value: 'callback', label: 'Request a callback', description: 'Ask the team to contact you and discuss the issue.' },
    ],
    detailSections: [
      {
        title: 'Smartphone Repair Services',
        items: [
          'Screen replacements using original quality displays',
          'Battery replacements with genuine cells',
          'Water damage recovery and treatment',
          'Camera module repairs and replacements',
          'Charging port and power issue fixes',
          'Software troubleshooting and updates',
          'Data recovery services',
        ],
      },
      {
        title: 'Laptop & Computer Repairs',
        items: [
          'Hardware diagnostics and repairs',
          'Screen and keyboard replacements',
          'Motherboard-level repairs',
          'Hard drive and SSD upgrades',
          'RAM and storage expansions',
          'Virus removal and software optimization',
          'Operating system installations',
        ],
      },
      {
        title: 'Professional Repair Process',
        items: [
          'Detailed initial diagnosis',
          'Free repair quote with no hidden costs',
          'Use of genuine or high-quality compatible parts',
          'Thorough testing after repairs',
          'Quality assurance checks',
          '90-day warranty on all repairs',
        ],
      },
      {
        title: 'Additional Services',
        items: [
          'Express repair service for urgent needs',
          'Device pickup and delivery across Dubai',
          'Regular maintenance services',
          'Performance optimization',
          'Hardware upgrades',
        ],
      },
    ],
  },
  'sell-gadgets': {
    slug: 'sell-gadgets',
    title: 'Sell Your Device',
    description: 'Sell phones, laptops, tablets, and consoles in Dubai.',
    heroTitle: 'Sell your device at PZM',
    heroDescription: 'Send the model, condition, and storage for a quick quote.',
    highlights: [
      'Phones, laptops, tablets, and consoles',
      'Trade-in quotes before you visit',
      'Fast follow-up from the store team',
    ],
    imageUrl: generatedServiceMedia('sell-gadgets/sell-devices-service.jpg'),
    imageAlt: 'Sell your old iPhone at PZM',
    cardImageUrl: '/images/Catigories/mini_sell-gadgets.webp',
    cardDescription: 'Get the best price for your devices',
    requestKinds: quoteAndCallback,
    detailSections: [
      {
        title: 'Devices We Buy',
        items: [
          'iPhones (iPhone X and newer models)',
          'Samsung Galaxy phones (S series, Note series)',
          'Other premium Android smartphones',
          'MacBooks and Apple laptops',
          'Windows laptops and ultrabooks',
          'Gaming laptops and desktops',
          'iPads and tablets',
          'Gaming consoles and accessories',
          'Smartwatches and wearables',
        ],
      },
      {
        title: 'Evaluation Process',
        items: [
          'Professional device inspection',
          'Market value assessment',
          'Condition-based pricing',
          'Instant price quotes',
          'Same-day payment',
        ],
      },
      {
        title: 'What We Check',
        items: [
          'Overall physical condition',
          'Screen and display quality',
          'Battery health status',
          'Functionality of all components',
          'Internal storage capacity',
          'Warranty status',
        ],
      },
      {
        title: 'Tips for Maximum Value',
        items: [
          'Back up your data before selling',
          'Remove any screen protectors or cases',
          'Bring original accessories if available',
          'Reset device to factory settings',
          'Bring proof of purchase if possible',
        ],
      },
    ],
  },
  'gaming-pc': {
    slug: 'gaming-pc',
    title: 'Gaming PC Builds',
    description: 'Custom gaming and workstation PC builds in Dubai.',
    heroTitle: 'Build your gaming PC with PZM',
    heroDescription: 'Share your budget, games, or workflow and we will suggest the right build.',
    highlights: [
      'Gaming, streaming, editing, and workstation builds',
      'Part selection, assembly, and setup help',
      'From budget builds to high-end systems',
    ],
    imageUrl: generatedServiceMedia('gaming-pc/gaming-pc-builds-service.jpg'),
    imageAlt: 'Gaming PC builds at PZM',
    cardImageUrl: '/images/Catigories/mini_GamingPC.webp',
    cardDescription: 'Custom gaming PC builds',
    requestKinds: [
      { value: 'quote', label: 'Request a build quote', description: 'Share your budget and goal to get a recommended configuration.' },
      { value: 'callback', label: 'Talk through the build', description: 'Ask the team to call you and discuss parts and timing.' },
      { value: 'booking', label: 'Schedule a consultation', description: 'Reserve a time to review the build in more detail.' },
    ],
    detailSections: [
      {
        title: 'Premium Components',
        items: [
          'Latest-generation CPUs (Intel & AMD)',
          'High-performance graphics cards (NVIDIA & AMD)',
          'Fast NVMe SSD storage solutions',
          'High-speed DDR5 memory kits',
          'Premium motherboards and power supplies',
          'Custom RGB lighting and cable management',
        ],
      },
      {
        title: 'Custom Cooling Solutions',
        items: [
          'Advanced air cooling setups',
          'All-in-one liquid cooling systems',
          'Custom loop water cooling',
          'Thermal optimization and testing',
        ],
      },
      {
        title: 'Professional Assembly & Testing',
        items: [
          'Expert component installation',
          'Full system stress testing',
          'Operating system setup and drivers',
          'Performance benchmarking and tuning',
          'Quality assurance before delivery',
        ],
      },
      {
        title: 'Customization Options',
        items: [
          'Case selection and modification',
          'RGB lighting configuration',
          'Software and game pre-installation',
          'Future upgrade planning',
        ],
      },
      {
        title: 'After-Sales Support',
        items: [
          'Component warranty assistance',
          'Performance maintenance',
          'Hardware upgrade service',
          'Troubleshooting and diagnostics',
        ],
      },
    ],
  },
  accessories: {
    slug: 'accessories',
    title: 'Accessories',
    description: 'Chargers, cases, controllers, hubs, and accessories for your devices.',
    heroTitle: 'Accessories for phones, laptops, and gaming',
    heroDescription: 'Chargers, cases, cables, controllers, hubs, and bundles for the devices you use every day.',
    highlights: [
      'Chargers, cases, hubs, controllers, and more',
      'Bundle pricing and compatibility help',
      'Fast guidance from the store team',
    ],
    imageUrl: generatedServiceMedia('accessories/accessories-service.jpg'),
    imageAlt: 'Accessories and peripherals at PZM',
    cardImageUrl: '/images/Catigories/mini_mobile_accessories.webp',
    cardDescription: 'Wide range of genuine accessories',
    requestKinds: [
      { value: 'availability', label: 'Ask about an accessory', description: 'Tell us which accessory you want.' },
      { value: 'quote', label: 'Request a bundle quote', description: 'Ask for pricing on multiple accessories together.' },
      { value: 'callback', label: 'Request a callback', description: 'Ask the team to contact you and guide the purchase.' },
    ],
    detailSections: [
      {
        title: 'Smartphone Protection',
        items: [
          'Premium cases and covers',
          'Tempered glass screen protectors',
          'Camera lens protectors',
          'MagSafe compatible accessories',
          'Wireless charging pads and stands',
          'Car mounts and holders',
          'Power banks and portable chargers',
          'Lightning and USB-C cables',
        ],
      },
      {
        title: 'Computing Accessories',
        items: [
          'Laptop sleeves and bags',
          'USB-C hubs and docking stations',
          'External monitors and stands',
          'Wireless keyboards and mice',
          'Webcams and microphones',
          'Laptop cooling pads',
          'External SSDs and storage',
          'Ergonomic desk accessories',
        ],
      },
      {
        title: 'Gaming Peripherals',
        items: [
          'Gaming headsets and earphones',
          'Controllers and gamepads',
          'Gaming mice and mousepads',
          'Mechanical keyboards',
          'Console accessories (PS5, Xbox, Switch)',
          'Capture cards and streaming gear',
          'Gaming chairs and desks',
        ],
      },
      {
        title: 'Quality Assurance',
        items: [
          'All products tested before sale',
          'Compatible with latest devices',
          'Warranty on all accessories',
          'Genuine and certified products',
          'Easy return and exchange',
          'Expert compatibility advice',
        ],
      },
      {
        title: 'Featured Brands',
        items: [
          'Apple (MagSafe, AirPods, Cables)',
          'Samsung (Cases, Chargers)',
          'Logitech (Keyboards, Mice)',
          'Anker (Chargers, Power Banks)',
          'Razer (Gaming Peripherals)',
          'Sony (Audio, Gaming)',
        ],
      },
    ],
  },
  'brand-new': {
    slug: 'brand-new',
    title: 'Brand New Devices',
    description: 'Brand-new phones, laptops, tablets, consoles, and more in Dubai.',
    heroTitle: 'Shop brand-new devices in Dubai',
    heroDescription: 'Browse the current lineup or message us for the model, storage, or color you want.',
    highlights: [
      'Phones, laptops, tablets, and gaming devices',
      'Official warranty and local store support',
      'Fast help with model selection and ordering',
    ],
    imageUrl: generatedServiceMedia('brand-new/brand-new-service.jpg'),
    imageAlt: 'Brand new device range at PZM',
    cardImageUrl: '/images/Catigories/mini_brand_new.webp',
    cardDescription: 'Latest smartphones, laptops, and accessories',
    requestKinds: [
      { value: 'availability', label: 'Ask about a model', description: 'Tell us the model or configuration you want.' },
      { value: 'quote', label: 'Request a price confirmation', description: 'Ask for a confirmed price.' },
      { value: 'callback', label: 'Request a callback', description: 'Ask the team to help you choose before buying.' },
    ],
  },
  'buy-iphone': {
    slug: 'buy-iphone',
    title: 'Buy iPhone',
    description: 'iPhone models in Dubai with direct WhatsApp ordering.',
    heroTitle: 'Buy iPhone in Dubai',
    heroDescription: 'Browse the current iPhone lineup and message us for the model you want.',
    highlights: [
      'Pro Max, Pro, Air, and standard iPhone models',
      'Storage, color, and pricing guidance',
      'Pickup, delivery, and WhatsApp ordering',
    ],
    imageUrl: generatedServiceMedia('buy-iphone/buy-iphone-service.jpg'),
    imageAlt: 'iPhone 17 Pro Max color lineup at PZM',
    cardImageUrl: '/images/Catigories/mini_buy_iphone.webp',
    cardDescription: 'iPhone 17 series in all colors — Cash on Delivery',
    requestKinds: [
      { value: 'availability', label: 'Ask about an iPhone', description: 'Tell us the model, storage option, or color you want.' },
      { value: 'quote', label: 'Request a confirmed offer', description: 'Ask for pricing confirmation before placing the order.' },
      { value: 'callback', label: 'Request a callback', description: 'Talk to the team before choosing the right device.' },
    ],
  },
  secondhand: {
    slug: 'secondhand',
    title: 'Used Devices',
    description: 'Certified pre-owned phones, laptops, tablets, and gaming devices in Dubai.',
    heroTitle: 'Shop pre-owned devices in Dubai',
    heroDescription: 'Browse used devices or message us with the model, budget, and condition you want.',
    highlights: [
      'Phones, laptops, tablets, and gaming devices',
      'Battery, condition, and value guidance',
      'Direct WhatsApp follow-up from the store team',
    ],
    imageUrl: generatedServiceMedia('secondhand/secondhand-service.jpg'),
    imageAlt: 'Used devices at PZM',
    cardImageUrl: '/images/Catigories/mini_Used_Phones.webp',
    cardDescription: 'Quality checked pre-owned devices',
    requestKinds: [
      { value: 'availability', label: 'Ask about a device', description: 'Tell us the condition or configuration you want.' },
      { value: 'quote', label: 'Request a price confirmation', description: 'Ask for a confirmed price on a used device.' },
      { value: 'callback', label: 'Request a callback', description: 'Talk through the options before buying.' },
    ],
  },
  'web-design': {
    slug: 'web-design',
    title: 'Website Design',
    description: 'Request a quote for a business website, landing page, online store, or redesign from the PZM team.',
    heroTitle: 'Website design for modern businesses',
    heroDescription: 'Share your business, goal, and timeline and we will scope the right site for you.',
    highlights: [
      'Suitable for brochure sites, landing pages, and online stores',
      'Useful for redesigns, new launches, and marketing campaigns',
      'Start with a quote request or ask for a callback',
    ],
    imageUrl: generatedServiceMedia('web-design/website-design-service.jpg'),
    imageAlt: 'Website design service at PZM',
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