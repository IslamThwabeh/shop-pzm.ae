import { normalizeSitePath } from '../utils/siteConfig'
import type { LucideIcon } from 'lucide-react'
import {
  Smartphone,
  Laptop,
  Gamepad2,
  Monitor,
  ShieldCheck,
  Award,
  ShoppingBag,
  Headphones,
} from 'lucide-react'

export interface NavigationLink {
  label: string
  to: string
}

export interface MegaMenuItem {
  label: string
  subtitle: string
  to: string
  icon: LucideIcon
}

/* ── Mega-menu: Device Categories (left column) ─────────── */
export const megaMenuCategories: MegaMenuItem[] = [
  {
    label: 'Phones & Tablets',
    subtitle: 'iPhone, Samsung & more',
    to: normalizeSitePath('/services/buy-iphone'),
    icon: Smartphone,
  },
  {
    label: 'Laptops & Computers',
    subtitle: 'MacBook, Dell, HP & more',
    to: normalizeSitePath('/services/brand-new'),
    icon: Laptop,
  },
  {
    label: 'Gaming Systems',
    subtitle: 'Custom PCs, consoles & gear',
    to: normalizeSitePath('/services/gaming-pc'),
    icon: Gamepad2,
  },
  {
    label: 'Professional Equipment',
    subtitle: 'Workstations & displays',
    to: normalizeSitePath('/services/brand-new'),
    icon: Monitor,
  },
]

/* ── Mega-menu: Shop Sections (right column) ─────────────── */
export const megaMenuShopSections: MegaMenuItem[] = [
  {
    label: 'Brand New Devices',
    subtitle: 'Latest models with warranty',
    to: normalizeSitePath('/services/brand-new'),
    icon: Award,
  },
  {
    label: 'Certified Used',
    subtitle: 'Inspected & guaranteed devices',
    to: normalizeSitePath('/services/secondhand'),
    icon: ShieldCheck,
  },
  {
    label: 'Buy iPhone',
    subtitle: 'All iPhone families & variants',
    to: normalizeSitePath('/services/buy-iphone'),
    icon: Smartphone,
  },
  {
    label: 'Sell Your Device',
    subtitle: 'Get the best value instantly',
    to: normalizeSitePath('/services/sell-gadgets'),
    icon: ShoppingBag,
  },
  {
    label: 'Accessories',
    subtitle: 'Cases, chargers & more',
    to: normalizeSitePath('/services/accessories'),
    icon: Headphones,
  },
]

const page = normalizeSitePath

export const siteIdentity = {
  name: 'PZM Computers & Phones Store',
  tagline: 'New•Used•Repair•PC•Build',
  summary:
    'Dubai tech storefront for new and used phones, laptops, repairs, accessories, and custom PC builds.',
}

export const siteContact = {
  phoneDisplay: '+971 52 802 6677',
  phoneHref: 'tel:+971528026677',
  whatsappSupportHref:
    'https://wa.me/971528026677?text=Hi%2C%20I%27m%20interested%20in%20the%20services%20listed%20on%20your%20website.%20Can%20you%20tell%20me%20more%3F%20(via%20pzm.ae)',
  noReplyEmail: 'no-reply@pzm.ae',
  mapsHref: 'https://maps.app.goo.gl/e5Rhfo8YY3i8CatM7?g_st=ic',
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3608.231830114033!2d55.1992671!3d25.0848627!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f6dc0bc49a6d5%3A0x158c13f2d688b32e!2sPZM%20Computer%20Phone%20Trading%20%26%20Repair%20(Sell%2CUsed%2CNew%2CBuild)!5e0!3m2!1sen!2sae!4v1715590341023!5m2!1sen!2sae',
  addressLine1: 'Hessa Street Branch',
  addressLine2: 'Inside Hessa Union Coop Hypermarket, Ground Floor',
  cityLine: 'Al Barsha, Dubai, UAE',
  blogHref: page('/blog'),
}

export const footerQuickLinks: NavigationLink[] = [
  { label: 'Home', to: '/' },
  { label: 'Repair', to: page('/services/repair') },
  { label: 'Shop', to: page('/services/brand-new') },
  { label: 'PC Build', to: page('/services/gaming-pc') },
  { label: 'Blog', to: page('/blog') },
  { label: 'Return Policy', to: page('/return-policy') },
  { label: 'Terms', to: page('/terms') },
]