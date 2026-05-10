/**
 * Lightweight translation record for the Arabic (Phase 2) rollout.
 * No external i18n library required — the catalog of strings is small enough
 * to manage as a plain TypeScript record.
 *
 * Keys are camelCase identifiers used via the `useT()` hook.
 * English values are authoritative; Arabic values are the translations.
 */

export type Lang = 'en' | 'ar'

interface TranslationRecord {
  // ── Header nav ────────────────────────────────────────────
  navProducts: string
  navRepair: string
  navCategories: string
  navShop: string
  navCallAriaLabel: string
  navWhatsAppAriaLabel: string
  navToggleAriaLabel: string
  navLogoutAriaLabel: string
  navCartAriaLabel: string // "Shopping cart, {count} items"
  // Mega-menu: categories
  catPhones: string
  catPhonesSubtitle: string
  catLaptops: string
  catLaptopsSubtitle: string
  catGaming: string
  catGamingSubtitle: string
  catPro: string
  catProSubtitle: string
  // Mega-menu: shop sections
  shopBrandNew: string
  shopBrandNewSubtitle: string
  shopUsed: string
  shopUsedSubtitle: string
  shopBuyIphone: string
  shopBuyIphoneSubtitle: string
  shopSell: string
  shopSellSubtitle: string
  shopAccessories: string
  shopAccessoriesSubtitle: string

  // ── Footer ────────────────────────────────────────────────
  footerCopyright: string // placeholder — year injected by component

  // ── StoreContactSection ───────────────────────────────────
  contactSectionEyebrow: string
  contactSectionHeading: string
  contactSectionBody: string
  contactCardCallLabel: string
  contactCardWhatsappLabel: string
  contactCardWhatsappDesc: string
  contactCardVisitLabel: string
  contactCardVisitDesc: string
  contactCardVisitSub: string
  storeCardEyebrow: string
  storeCardTagline: string

  // ── WhatsAppCTA ───────────────────────────────────────────
  whatsappCtaDefaultTitle: string
  whatsappCtaDefaultDesc: string
  whatsappCtaButtonLabel: string

  // ── ServicePage static labels ─────────────────────────────
  serviceEyebrow: string
  serviceWhatWeDoHeading: string
  serviceDetailsHeading: string
  serviceLocalSupportEyebrow: string
  serviceRelatedEyebrow: string
  serviceRelatedHeading: string
  serviceBookAppointment: string
  serviceContactUs: string
  serviceAppointmentEyebrow: string
  serviceAppointmentHeading: string
  serviceAppointmentBody: string
  serviceMorePoints: string // e.g. "+3 more points"
  serviceNotFoundHeading: string
  serviceNotFoundBody: string
  serviceBackToServices: string
  serviceNeedHelp: string // "Need help with {service}?" — {service} injected by component

  // ── Shared CTA / misc ─────────────────────────────────────
  langSwitchLabel: string // "العربية" / "English"

  // ── Header search ─────────────────────────────────────────
  searchPlaceholderDesktop: string
  searchPlaceholderMobile: string
  searchInputAriaLabel: string
  searchClearAriaLabel: string
  searchSuggestionsAriaLabel: string
  searchNoMatchesPrefix: string // "No matches for"
  searchAskWhatsapp: string

  // ── Consent banner ────────────────────────────────────────
  consentMessage: string
  consentPrivacyLabel: string
  consentAcceptButton: string

  // ── Store hours panel ─────────────────────────────────────
  storeHoursEyebrow: string
  storeHoursHeading: string
  storeHoursTodaySuffix: string
  storeHoursOpenBadge: string
  storeHoursClosedBadge: string
  storeHoursOpenNote: string
  storeHoursClosedNote: string
}

const en: TranslationRecord = {
  navProducts: 'Products',
  navRepair: 'Repair',
  navCategories: 'Categories',
  navShop: 'Shop',
  navCallAriaLabel: 'Call us',
  navWhatsAppAriaLabel: 'WhatsApp',
  navToggleAriaLabel: 'Toggle navigation',
  navLogoutAriaLabel: 'Logout',
  navCartAriaLabel: 'Shopping cart, {count} {itemWord}',
  catPhones: 'Phones & Tablets',
  catPhonesSubtitle: 'iPhone, Samsung & more',
  catLaptops: 'Laptops & Computers',
  catLaptopsSubtitle: 'MacBook, Dell, HP & more',
  catGaming: 'Gaming Systems',
  catGamingSubtitle: 'Custom PCs, consoles & gear',
  catPro: 'Professional Equipment',
  catProSubtitle: 'Workstations & displays',
  shopBrandNew: 'Brand New Devices',
  shopBrandNewSubtitle: 'Latest models with warranty',
  shopUsed: 'Certified Used',
  shopUsedSubtitle: 'Inspected & guaranteed devices',
  shopBuyIphone: 'Buy iPhone',
  shopBuyIphoneSubtitle: 'All iPhone families & variants',
  shopSell: 'Sell Your Device',
  shopSellSubtitle: 'Get the best value instantly',
  shopAccessories: 'Accessories',
  shopAccessoriesSubtitle: 'Cases, chargers & more',

  footerCopyright: '© {year} PZM Computers & Phones – Sell, New, Used, Repair, PC Build',

  contactSectionEyebrow: 'Contact Us',
  contactSectionHeading: 'Need help with our services or products?',
  contactSectionBody:
    'Visit our store inside Hessa Union Coop Hypermarket or reach out for pricing, repairs, and pickup support.',
  contactCardCallLabel: 'Call Us',
  contactCardWhatsappLabel: 'WhatsApp',
  contactCardWhatsappDesc: 'Chat with us instantly',
  contactCardVisitLabel: 'Visit Our Store',
  contactCardVisitDesc: 'Hessa Union Coop Hypermarket',
  contactCardVisitSub: 'Ground Floor, Al Barsha, Dubai',
  storeCardEyebrow: 'Visit Our Store',
  storeCardTagline: 'Sell, New, Used, Repair, PC Build',

  whatsappCtaDefaultTitle: 'Have a question?',
  whatsappCtaDefaultDesc: 'Message us on WhatsApp and the team will follow up directly.',
  whatsappCtaButtonLabel: 'WhatsApp Us',

  serviceEyebrow: 'PZM service',
  serviceWhatWeDoHeading: 'What we do',
  serviceDetailsHeading: 'Service Details',
  serviceLocalSupportEyebrow: 'Local support',
  serviceRelatedEyebrow: 'Related routes',
  serviceRelatedHeading: 'Keep moving without starting over',
  serviceBookAppointment: 'Book Appointment',
  serviceContactUs: 'Contact Us',
  serviceAppointmentEyebrow: 'Appointment',
  serviceAppointmentHeading: 'Book a Service Appointment',
  serviceAppointmentBody: 'Choose a preferred time and send your request to the store team.',
  serviceMorePoints: '+{n} more points',
  serviceNotFoundHeading: 'Service page not found',
  serviceNotFoundBody:
    'The service page you requested is not available right now. You can browse the current services below.',
  serviceBackToServices: 'Back to Services',
  serviceNeedHelp: 'Need help with {service}?',

  langSwitchLabel: 'العربية',

  searchPlaceholderDesktop: 'Search iPhones, MacBooks, Galaxy, PS5…',
  searchPlaceholderMobile: 'Search devices',
  searchInputAriaLabel: 'Search devices',
  searchClearAriaLabel: 'Clear search',
  searchSuggestionsAriaLabel: 'Device suggestions',
  searchNoMatchesPrefix: 'No matches for',
  searchAskWhatsapp: 'Ask on WhatsApp',

  consentMessage: 'We collect minimal technical data (city, country) to serve you better.',
  consentPrivacyLabel: 'Privacy Policy',
  consentAcceptButton: 'Got it',

  storeHoursEyebrow: 'Store Hours',
  storeHoursHeading: 'Dubai working hours',
  storeHoursTodaySuffix: '(Today)',
  storeHoursOpenBadge: 'Open now',
  storeHoursClosedBadge: 'Closed',
  storeHoursOpenNote: 'The store is currently open in Dubai time.',
  storeHoursClosedNote: 'We still receive calls and messages outside store hours.',
}

const ar: TranslationRecord = {
  navProducts: 'المنتجات',
  navRepair: 'الإصلاح',
  navCategories: 'الفئات',
  navShop: 'التسوق',
  navCallAriaLabel: 'اتصل بنا',
  navWhatsAppAriaLabel: 'واتساب',
  navToggleAriaLabel: 'فتح أو إغلاق التنقل',
  navLogoutAriaLabel: 'تسجيل الخروج',
  navCartAriaLabel: 'سلة التسوق، {count} {itemWord}',
  catPhones: 'هواتف وأجهزة لوحية',
  catPhonesSubtitle: 'آيفون، سامسونج والمزيد',
  catLaptops: 'لابتوب وكمبيوتر',
  catLaptopsSubtitle: 'ماك بوك، ديل، HP والمزيد',
  catGaming: 'أنظمة الألعاب',
  catGamingSubtitle: 'كمبيوترات مخصصة وكونسول ومعدات',
  catPro: 'معدات احترافية',
  catProSubtitle: 'محطات عمل وشاشات',
  shopBrandNew: 'أجهزة جديدة',
  shopBrandNewSubtitle: 'أحدث الموديلات مع ضمان',
  shopUsed: 'مستعمل معتمد',
  shopUsedSubtitle: 'أجهزة مفحوصة ومضمونة',
  shopBuyIphone: 'شراء آيفون',
  shopBuyIphoneSubtitle: 'جميع موديلات وإصدارات آيفون',
  shopSell: 'بيع جهازك',
  shopSellSubtitle: 'احصل على أفضل سعر فوراً',
  shopAccessories: 'إكسسوارات',
  shopAccessoriesSubtitle: 'كفرات، شواحن والمزيد',

  footerCopyright: '© {year} PZM للحواسيب والهواتف – بيع، جديد، مستعمل، إصلاح، تجميع حواسيب',

  contactSectionEyebrow: 'تواصل معنا',
  contactSectionHeading: 'هل تحتاج مساعدة في منتجاتنا أو خدماتنا؟',
  contactSectionBody:
    'زر متجرنا داخل هايبرماركت هيسه يونيون كوب أو تواصل معنا للأسعار والإصلاح ودعم الاستلام.',
  contactCardCallLabel: 'اتصل بنا',
  contactCardWhatsappLabel: 'واتساب',
  contactCardWhatsappDesc: 'تحدث معنا مباشرة',
  contactCardVisitLabel: 'زر المتجر',
  contactCardVisitDesc: 'هايبرماركت هيسه يونيون كوب',
  contactCardVisitSub: 'الطابق الأرضي، البرشاء، دبي',
  storeCardEyebrow: 'زر متجرنا',
  storeCardTagline: 'بيع · جديد · مستعمل · إصلاح · تجميع حواسيب',

  whatsappCtaDefaultTitle: 'هل لديك سؤال؟',
  whatsappCtaDefaultDesc: 'راسلنا على واتساب وسيتابع معك فريقنا مباشرة.',
  whatsappCtaButtonLabel: 'تواصل عبر واتساب',

  serviceEyebrow: 'خدمة PZM',
  serviceWhatWeDoHeading: 'ما نقدمه',
  serviceDetailsHeading: 'تفاصيل الخدمة',
  serviceLocalSupportEyebrow: 'دعم محلي',
  serviceRelatedEyebrow: 'روابط ذات صلة',
  serviceRelatedHeading: 'تابع رحلتك بسهولة',
  serviceBookAppointment: 'احجز موعداً',
  serviceContactUs: 'تواصل معنا',
  serviceAppointmentEyebrow: 'حجز موعد',
  serviceAppointmentHeading: 'احجز موعد خدمة',
  serviceAppointmentBody: 'اختر وقتاً مناسباً وأرسل طلبك لفريق المتجر.',
  serviceMorePoints: '+{n} نقاط إضافية',
  serviceNotFoundHeading: 'صفحة الخدمة غير موجودة',
  serviceNotFoundBody:
    'صفحة الخدمة المطلوبة غير متاحة حالياً. يمكنك تصفح الخدمات المتاحة أدناه.',
  serviceBackToServices: 'العودة إلى الخدمات',
  serviceNeedHelp: 'هل تحتاج مساعدة في {service}؟',

  langSwitchLabel: 'English',

  searchPlaceholderDesktop: 'ابحث عن آيفون، ماك بوك، جالاكسي، PS5…',
  searchPlaceholderMobile: 'ابحث عن جهاز',
  searchInputAriaLabel: 'بحث عن الأجهزة',
  searchClearAriaLabel: 'مسح البحث',
  searchSuggestionsAriaLabel: 'اقتراحات الأجهزة',
  searchNoMatchesPrefix: 'لا توجد نتائج لـ',
  searchAskWhatsapp: 'اسأل عبر واتساب',

  consentMessage: 'نجمع بيانات تقنية بسيطة (المدينة، الدولة) لتحسين الخدمة.',
  consentPrivacyLabel: 'سياسة الخصوصية',
  consentAcceptButton: 'موافق',

  storeHoursEyebrow: 'ساعات العمل',
  storeHoursHeading: 'ساعات العمل في دبي',
  storeHoursTodaySuffix: '(اليوم)',
  storeHoursOpenBadge: 'مفتوح الآن',
  storeHoursClosedBadge: 'مغلق',
  storeHoursOpenNote: 'المتجر مفتوح حالياً حسب توقيت دبي.',
  storeHoursClosedNote: 'نستقبل الاتصالات والرسائل حتى خارج أوقات العمل.',
}

const translations: Record<Lang, TranslationRecord> = { en, ar }

export function useTranslations(lang: Lang): (key: keyof TranslationRecord, vars?: Record<string, string | number>) => string {
  return (key, vars) => {
    let str = translations[lang][key] ?? translations.en[key] ?? String(key)
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{${k}}`, String(v))
      }
    }
    return str
  }
}
