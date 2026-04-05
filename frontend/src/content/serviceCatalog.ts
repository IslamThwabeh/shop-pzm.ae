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
  detailSections?: ServiceDetailSection[]
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
    description: 'Book phone, laptop, MacBook, console, and motherboard repair services in Dubai with pickup, drop-off, and callback support from PZM.',
    heroTitle: 'Fast repair support for phones, laptops, consoles, and more',
    heroDescription: 'Tell us the device, the issue, and whether you want to visit the Hessa Street branch or arrange pickup. The team will guide you on diagnosis, timing, and next steps.',
    highlights: [
      'Phone, laptop, MacBook, console, and motherboard repair intake',
      'Pickup, drop-off, and callback options for Dubai customers',
      'Useful for cracked screens, battery issues, charging faults, and board work',
    ],
    imageUrl: legacyMedia('Services/repairing_services.jpg'),
    imageAlt: 'Repair services at PZM',
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
    description: 'Get a valuation for the phone, laptop, tablet, or console you want to sell in Dubai.',
    heroTitle: 'Sell your device with a quick valuation from PZM',
    heroDescription: 'Share the model, condition, storage, and any accessories included. Our team can review the device and reply with the next step or a trade-in estimate.',
    highlights: [
      'Useful for iPhones, Samsung devices, MacBooks, Windows laptops, tablets, and consoles',
      'Ask for a quote before visiting the store',
      'Callback support if you want help comparing trade-in options',
    ],
    imageUrl: legacyMedia('Services/Sell_Your_Old_iPhones.jpg'),
    imageAlt: 'Sell your old iPhone at PZM',
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
    description: 'Plan a custom gaming or workstation PC build with budget, performance goals, and part recommendations from the PZM team.',
    heroTitle: 'Custom gaming PC builds for your budget and setup',
    heroDescription: 'Tell us what you play, the performance you want, and your budget range. We can recommend parts, build options, and timing for your setup.',
    highlights: [
      'Budget, mid-range, and high-end build planning',
      'Good for gaming, streaming, editing, and workstation setups',
      'Consultation support before you commit to a parts list',
    ],
    imageUrl: legacyMedia('Catigories/GamingPC.JPG'),
    imageAlt: 'Gaming PC builds at PZM',
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
    description: 'Ask about accessory availability, bundle pricing, or matching add-ons, or browse the latest stock in the shop.',
    heroTitle: 'Accessories, bundles, and setup advice in one place',
    heroDescription: 'Use this page if you need help finding the right charger, case, controller, hub, keyboard, or bundled setup for your device.',
    highlights: [
      'Chargers, cases, hubs, keyboards, controllers, and more',
      'Helpful for compatibility questions and bundle pricing',
      'Browse current inventory or request assistance from the team',
    ],
    imageUrl: legacyMedia('Catigories/mobile_accessories.jpg'),
    imageAlt: 'Accessories and peripherals at PZM',
    requestKinds: [
      { value: 'availability', label: 'Check availability', description: 'Ask whether a specific accessory is in stock.' },
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
    description: 'Explore brand-new phones, laptops, tablets, gaming devices, and more with live shop access and availability support from PZM.',
    heroTitle: 'Shop brand-new devices with store support when you need it',
    heroDescription: 'Browse current stock in the live shop or ask the team about a model, storage option, or color before you order.',
    highlights: [
      'Best for the latest phones, laptops, tablets, and gaming devices',
      'Useful when you need stock confirmation before checkout',
      'Store guidance for model selection, pickup, and ordering',
    ],
    imageUrl: legacyMedia('Catigories/brand_new.jpg'),
    imageAlt: 'Brand new device range at PZM',
    requestKinds: [
      { value: 'availability', label: 'Check model availability', description: 'Ask about a model or configuration before ordering.' },
      { value: 'quote', label: 'Request a price confirmation', description: 'Ask for a confirmed price and stock status.' },
      { value: 'callback', label: 'Request a callback', description: 'Ask the team to help you choose before buying.' },
    ],
  },
  'buy-iphone': {
    slug: 'buy-iphone',
    title: 'Buy iPhone',
    description: 'Browse iPhone models with live shop access, stock checks, and direct help from the PZM team.',
    heroTitle: 'Find the right iPhone with live stock and local support',
    heroDescription: 'Compare current iPhone options in the live shop or ask about color, storage, availability, and pickup before you buy.',
    highlights: [
      'Browse live iPhone listings and current pricing',
      'Ask about storage, color, and availability before ordering',
      'Get help with pickup, delivery, and model selection',
    ],
    imageUrl: legacyMedia('buy_iphone/iPhone_17_Pro_Max_all_colors.jpg'),
    imageAlt: 'iPhone 17 Pro Max color lineup at PZM',
    requestKinds: [
      { value: 'availability', label: 'Check iPhone availability', description: 'Ask whether a model, storage option, or color is available.' },
      { value: 'quote', label: 'Request a confirmed offer', description: 'Ask for pricing confirmation before placing the order.' },
      { value: 'callback', label: 'Request a callback', description: 'Talk to the team before choosing the right device.' },
    ],
  },
  secondhand: {
    slug: 'secondhand',
    title: 'Used Devices',
    description: 'Shop certified pre-owned phones, laptops, tablets, and other devices with stock checks and condition guidance from PZM.',
    heroTitle: 'Certified pre-owned devices with clear condition guidance',
    heroDescription: 'Ask about stock, battery health, cosmetic condition, storage, and pricing before you visit or place an order.',
    highlights: [
      'Helpful for condition, battery-health, storage, and color questions',
      'Good for shoppers comparing value across used models',
      'Team support for stock confirmation and next steps',
    ],
    imageUrl: legacyMedia('buy_used/used_iphone_16_pro_max_main.webp'),
    imageAlt: 'Used devices at PZM',
    requestKinds: [
      { value: 'availability', label: 'Check used stock', description: 'Ask about stock, condition, or configuration.' },
      { value: 'quote', label: 'Request a price confirmation', description: 'Ask for a confirmed price on a used device.' },
      { value: 'callback', label: 'Request a callback', description: 'Talk through the options before buying.' },
    ],
  },
  'web-design': {
    slug: 'web-design',
    title: 'Website Design',
    description: 'Request a quote for a business website, landing page, online store, or redesign from the PZM team.',
    heroTitle: 'Website design for businesses that need a fast, modern online presence',
    heroDescription: 'Tell us about your business, goals, and preferred timeline. We can scope brochure sites, landing pages, e-commerce builds, and redesign work.',
    highlights: [
      'Suitable for brochure sites, landing pages, and online stores',
      'Useful for redesigns, new launches, and marketing campaigns',
      'Start with a quote request or ask for a callback',
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