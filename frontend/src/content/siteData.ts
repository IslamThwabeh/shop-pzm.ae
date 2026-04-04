export interface NavigationLink {
  label: string
  to: string
}

export const siteIdentity = {
  name: 'PZM Computers & Phones Store',
  tagline: 'Buy Sell Fix Used PC Build',
  summary:
    'Dubai tech storefront for new and used phones, laptops, repairs, accessories, and custom PC builds.',
}

export const siteContact = {
  phoneDisplay: '+971 52 802 6677',
  phoneHref: 'tel:+971528026677',
  whatsappSupportHref:
    'https://wa.me/971528026677?text=Hi%2C%20I%20need%20help%20with%20PZM%20services.%20(via%20shop.pzm.ae)',
  mapsHref: 'https://maps.app.goo.gl/e5Rhfo8YY3i8CatM7?g_st=ic',
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3608.231830114033!2d55.1992671!3d25.0848627!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f6dc0bc49a6d5%3A0x158c13f2d688b32e!2sPZM%20Computer%20Phone%20Trading%20%26%20Repair%20(Sell%2CUsed%2CNew%2CBuild)!5e0!3m2!1sen!2sae!4v1715590341023!5m2!1sen!2sae',
  supportEmail: 'support@pzm.ae',
  addressLine1: 'Hessa Street Branch',
  addressLine2: 'Inside Hessa Union Coop Hypermarket, Ground Floor',
  cityLine: 'Al Barsha, Dubai, UAE',
  blogHref: '/blog/',
}

export const serviceNavigationLinks: NavigationLink[] = [
  { label: 'Buy iPhone', to: '/services/buy-iphone' },
  { label: 'New Devices', to: '/services/brand-new' },
  { label: 'Used Devices', to: '/services/secondhand' },
  { label: 'Repair Services', to: '/services/repair' },
  { label: 'Gaming PC', to: '/services/gaming-pc' },
  { label: 'Sell Devices', to: '/services/sell-gadgets' },
  { label: 'Accessories', to: '/services/accessories' },
  { label: 'Website Design', to: '/services/web-design' },
]

export const areaNavigationLinks: NavigationLink[] = [
  { label: 'Al Barsha', to: '/areas/al-barsha' },
  { label: 'Al Quoz', to: '/areas/al-quoz' },
  { label: 'Dubai Marina', to: '/areas/dubai-marina' },
  { label: 'Emirates Hills', to: '/areas/emirates-hills' },
  { label: 'JBR', to: '/areas/jbr' },
  { label: 'Jumeirah', to: '/areas/jumeirah' },
  { label: 'Jumeirah Village', to: '/areas/jumeirah-village' },
  { label: 'Tecom', to: '/areas/tecom' },
]

export const policyNavigationLinks: NavigationLink[] = [
  { label: 'Return Policy', to: '/return-policy' },
  { label: 'Terms', to: '/terms' },
]