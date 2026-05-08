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

export interface ServiceSupportLink {
  label: string
  to: string
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
  imageUrl?: string
  imageAlt?: string
  cardImageUrl?: string
  cardDescription?: string
  detailSections?: ServiceDetailSection[]
  localSupportTitle?: string
  localSupportDescription?: string
  localSupportPoints?: string[]
  relatedLinks?: ServiceSupportLink[]
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
    imageUrl: generatedServiceMedia('repair/repair-services.webp'),
    imageAlt: 'Repair services at PZM',
    cardImageUrl: '/images/Catigories/mini_laptop_maintenance.webp',
    cardDescription: 'Expert device repair and maintenance',
    localSupportTitle: 'MacBook, laptop, and phone repair from Al Barsha',
    localSupportDescription:
      'Customers in Al Barsha, Dubai Science Park, Tecom, and nearby communities use this page to confirm MacBook repair, laptop diagnostics, screen replacement, battery replacement, and same-day intake before visiting the store.',
    localSupportPoints: [
      'Send the exact model and issue first so the team can confirm parts, timing, and whether same-day intake is realistic.',
      'Use the Al Barsha branch on Hessa Street for quick drop-off, board-level diagnostics, and straightforward pickup after repair.',
      'If repair is not the best value, compare trade-in and replacement routes before committing to parts and labor.',
    ],
    relatedLinks: [
      {
        label: 'Al Barsha store coverage',
        to: '/areas/al-barsha/',
        description: 'Open directions, nearby communities, and the fastest route to the Hessa Street branch.',
      },
      {
        label: 'Sell Your Device',
        to: '/services/sell-gadgets/',
        description: 'Trade in the device if replacing it makes more sense than repairing it.',
      },
      {
        label: 'Pre-Owned Devices',
        to: '/services/secondhand/',
        description: 'Compare used phones and laptops if you need a replacement quickly.',
      },
    ],
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
    imageUrl: generatedServiceMedia('sell-gadgets/sell-devices-service.webp'),
    imageAlt: 'Sell your old iPhone at PZM',
    cardImageUrl: '/images/Catigories/mini_sell-gadgets.webp',
    cardDescription: 'Get the best price for your devices',
    localSupportTitle: 'Trade in phones, laptops, and gaming gear near Al Barsha',
    localSupportDescription:
      'Use this route when you want a fast quote before driving to the store. It works well for phones, laptops, MacBooks, consoles, and gaming PCs from Al Barsha and nearby Dubai communities.',
    localSupportPoints: [
      'Send the model, storage, condition, and any included accessories so the team can give a clearer first estimate.',
      'Use the Al Barsha branch for quick handoff and same-day pricing when you are already near Hessa Street.',
      'If you are upgrading, move straight from valuation into the new-device or certified pre-owned pages.',
    ],
    relatedLinks: [
      {
        label: 'Brand New Devices',
        to: '/services/brand-new/',
        description: 'Browse current new-device stock if you want to upgrade after the trade-in.',
      },
      {
        label: 'Pre-Owned Devices',
        to: '/services/secondhand/',
        description: 'Compare certified used options if you want to keep the budget tighter.',
      },
      {
        label: 'Al Barsha store coverage',
        to: '/areas/al-barsha/',
        description: 'Open the store-area page for directions and nearby community coverage.',
      },
    ],
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
    imageUrl: generatedServiceMedia('gaming-pc/gaming-pc-builds-service.webp'),
    imageAlt: 'Gaming PC builds at PZM',
    cardImageUrl: '/images/Catigories/mini_GamingPC.webp',
    cardDescription: 'Custom gaming PC builds',
    localSupportTitle: 'Custom gaming PC builds from Al Barsha, Dubai',
    localSupportDescription:
      'Dubai gamers, streamers, editors, and workstation buyers use this page to confirm budget, parts direction, and consultation timing before visiting the Al Barsha store.',
    localSupportPoints: [
      'Send the budget, games, software, or FPS target first so the team can suggest the right CPU, GPU, cooling, and storage mix.',
      'Use the Al Barsha branch for build consultations, upgrades, diagnostics, and finished-system pickup from one location.',
      'If you are replacing an older setup, compare trade-in, used-device, and repair routes before finalizing the new build.',
    ],
    relatedLinks: [
      {
        label: 'Al Barsha store coverage',
        to: '/areas/al-barsha/',
        description: 'Get directions to the Hessa Street branch for build consultation and pickup.',
      },
      {
        label: 'Brand New Devices',
        to: '/services/brand-new/',
        description: 'Browse currently listed gaming laptops, desktops, and related new hardware.',
      },
      {
        label: 'Sell Your Device',
        to: '/services/sell-gadgets/',
        description: 'Trade in an older laptop, console, or PC before moving into a new build.',
      },
    ],
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
    imageUrl: generatedServiceMedia('accessories/accessories-service.webp'),
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
    imageUrl: generatedServiceMedia('brand-new/brand-new-service.webp'),
    imageAlt: 'Brand new device range at PZM',
    cardImageUrl: '/images/Catigories/mini_brand_new.webp',
    cardDescription: 'Latest smartphones, laptops, and accessories',
    requestKinds: [
      { value: 'availability', label: 'Ask about a model', description: 'Tell us the model or configuration you want.' },
      { value: 'quote', label: 'Request a price confirmation', description: 'Ask for a confirmed price.' },
      { value: 'callback', label: 'Request a callback', description: 'Ask the team to help you choose before buying.' },
    ],
  },
  'laptop-shop': {
    slug: 'laptop-shop',
    title: 'Laptop Shop',
    description: 'Brand-new laptops, MacBooks, business notebooks, and gaming laptops in Dubai.',
    heroTitle: 'Shop laptops in Dubai from our Al Barsha store',
    heroDescription: 'Compare MacBook, Dell, HP, Lenovo, Asus, Acer, and gaming laptop options before you visit or request a quote.',
    highlights: [
      'MacBook, Dell, HP, Lenovo, Asus, Acer, and gaming laptops',
      'Business, student, creator, and performance-focused configurations',
      'Pickup, delivery, and model guidance from the Al Barsha branch',
    ],
    imageUrl: generatedServiceMedia('brand-new/brand-new-service.webp'),
    imageAlt: 'Laptop shopping at PZM',
    cardImageUrl: '/images/Catigories/mini_brand_new.webp',
    cardDescription: 'MacBooks, Windows laptops, and gaming laptops',
    localSupportTitle: 'Laptop shop in Al Barsha with Dubai-wide support',
    localSupportDescription:
      'This page is for customers who want a clearer laptop route than the broader new-device catalog. Use it for MacBooks, Windows laptops, work-from-home setups, student laptops, and gaming laptop comparisons before you visit the store.',
    localSupportPoints: [
      'Share the brand, budget, and performance goal first so the team can narrow the options before your visit.',
      'Use the Al Barsha branch for quick pickup, basic setup help, and accessory matching on the same visit.',
      'If a used or repaired laptop is the better fit, move into the pre-owned and repair pages without restarting the buying flow.',
    ],
    relatedLinks: [
      {
        label: 'Brand New Devices',
        to: '/services/brand-new/',
        description: 'Go back to the wider new-device catalog if you want phones, tablets, and accessories too.',
      },
      {
        label: 'Pre-Owned Devices',
        to: '/services/secondhand/',
        description: 'Compare certified used laptops if value matters more than buying brand-new.',
      },
      {
        label: 'Repair Services',
        to: '/services/repair/',
        description: 'Check repair and upgrade options before replacing your current laptop.',
      },
    ],
    requestKinds: [
      { value: 'availability', label: 'Ask about a laptop', description: 'Tell us the brand or model family you want.' },
      { value: 'quote', label: 'Request a laptop quote', description: 'Ask for pricing on the exact laptop configuration you need.' },
      { value: 'callback', label: 'Request a callback', description: 'Ask the team to help you choose the right laptop before buying.' },
    ],
    detailSections: [
      {
        title: 'Popular Laptop Categories',
        items: [
          'MacBook Air and MacBook Pro models',
          'Business laptops from Dell, HP, and Lenovo',
          'Student and everyday-use laptops',
          'Gaming laptops with higher GPU performance',
          'Creator laptops with stronger displays and storage',
        ],
      },
      {
        title: 'How We Help You Choose',
        items: [
          'Budget-first recommendations',
          'Performance guidance for office, study, editing, and gaming',
          'Storage and RAM comparison support',
          'Accessory matching for chargers, bags, hubs, and monitors',
        ],
      },
    ],
  },
  'computer-shop': {
    slug: 'computer-shop',
    title: 'Computer Shop',
    description: 'Desktops, all-in-one computers, monitors, workstations, and office computer setups in Dubai.',
    heroTitle: 'Shop computers, desktops, and monitors in Dubai',
    heroDescription: 'Explore desktop computers, all-in-ones, workstation setups, monitors, and business computer options from our Al Barsha branch.',
    highlights: [
      'Desktops, all-in-one computers, monitors, and workstation setups',
      'Office systems, creator setups, and display guidance',
      'Pickup, delivery, and configuration help from Al Barsha',
    ],
    imageUrl: generatedServiceMedia('brand-new/brand-new-service.webp'),
    imageAlt: 'Computer shopping at PZM',
    cardImageUrl: '/images/Catigories/mini_brand_new.webp',
    cardDescription: 'Desktops, monitors, workstations, and office systems',
    localSupportTitle: 'Computer shop in Dubai from the Al Barsha branch',
    localSupportDescription:
      'Use this page when you are specifically shopping for desktop computers, monitors, all-in-ones, or a practical office and workstation setup instead of a phone-first catalog view.',
    localSupportPoints: [
      'Send the use case, budget, and screen or performance requirements before you visit the store.',
      'Use the Al Barsha branch for monitor comparison, desktop pickup, and accessory matching in one stop.',
      'If you need a higher-performance setup, move directly into the gaming PC build route from this page.',
    ],
    relatedLinks: [
      {
        label: 'Brand New Devices',
        to: '/services/brand-new/',
        description: 'Browse the wider new-device catalog when you also want phones, tablets, or laptops.',
      },
      {
        label: 'Gaming PC Builds',
        to: '/services/gaming-pc/',
        description: 'Open the custom-build route for stronger gaming and workstation requirements.',
      },
      {
        label: 'Repair Services',
        to: '/services/repair/',
        description: 'Compare repair and upgrade options for an existing desktop, monitor, or laptop first.',
      },
    ],
    requestKinds: [
      { value: 'availability', label: 'Ask about a computer', description: 'Tell us the desktop, monitor, or workstation type you want.' },
      { value: 'quote', label: 'Request a computer quote', description: 'Ask for pricing on the exact system or setup you need.' },
      { value: 'callback', label: 'Request a callback', description: 'Ask the team to help you choose the right computer setup before buying.' },
    ],
    detailSections: [
      {
        title: 'Computer Categories We Support',
        items: [
          'Desktop computers for office and home use',
          'All-in-one computers and space-saving setups',
          'Monitors and multi-screen desk setups',
          'Professional workstations and productivity systems',
          'Desktop accessories, cables, keyboards, and mice',
        ],
      },
      {
        title: 'Good Fit For This Page',
        items: [
          'Office teams replacing older desktops',
          'Customers comparing monitor sizes and display types',
          'Buyers who need a practical work-from-home setup',
          'Shoppers choosing between listed systems and a custom build',
        ],
      },
    ],
  },
  'buy-iphone': {
    slug: 'buy-iphone',
    title: 'Buy iPhone',
    description: 'iPhone 16 and 17 models in Dubai with direct WhatsApp ordering.',
    heroTitle: 'Buy iPhone in Dubai',
    heroDescription: 'Browse iPhone 16 and 17 families and message us for the model you want.',
    highlights: [
      'Pro Max, Pro, Air, and standard iPhone models',
      'Storage, color, and pricing guidance',
      'Pickup, delivery, and WhatsApp ordering',
    ],
    imageUrl: buildApiUrl('/media/generated/buy-iphone/iphone-17-pro-max-family.webp'),
    imageAlt: 'iPhone 17 Pro Max family image at PZM',
    cardImageUrl: '/images/Catigories/mini_buy_iphone.webp',
    cardDescription: 'iPhone 16 and 17 families with direct ordering',
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
    imageUrl: generatedServiceMedia('secondhand/secondhand-service.webp'),
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
    imageUrl: generatedServiceMedia('web-design/website-design-service.webp'),
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