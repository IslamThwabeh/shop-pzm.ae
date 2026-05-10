import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import type { Lang } from '../i18n/translations'
import { useTranslations } from '../i18n/translations'
import { normalizeSitePath } from '../utils/siteConfig'

interface LanguageContextValue {
  lang: Lang
  isRtl: boolean
  /** Translate a UI key, optionally interpolating variables. */
  t: ReturnType<typeof useTranslations>
  toEnPath: typeof toEnPath
  toArPath: typeof toArPath
  toLocalizedPath: typeof toLocalizedPath
  hasArabicVariant: typeof hasArabicVariant
  toSupportedLocalizedPath: (path: string) => string
  getLanguageSwitchPath: (path: string) => string
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  isRtl: false,
  t: (key) => String(key),
  toEnPath,
  toArPath,
  toLocalizedPath,
  hasArabicVariant,
  toSupportedLocalizedPath: (path) => toSupportedLocalizedPath(path, 'en'),
  getLanguageSwitchPath,
})

const ARABIC_CORE_PATHS = new Set([
  '/',
  '/return-policy/',
  '/services/gaming-pc/',
  '/services/laptop-shop/',
  '/services/computer-shop/',
  '/services/buy-iphone/',
])

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()

  const lang: Lang =
    pathname === '/ar' || pathname.startsWith('/ar/') ? 'ar' : 'en'
  const isRtl = lang === 'ar'
  const t = useTranslations(lang)

  // Flip the document direction so Tailwind logical properties work automatically.
  useEffect(() => {
    const previousLang = document.documentElement.lang
    const previousDir = document.documentElement.getAttribute('dir')

    document.documentElement.lang = lang
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr'

    return () => {
      document.documentElement.lang = previousLang
      if (previousDir) {
        document.documentElement.dir = previousDir
      } else {
        document.documentElement.removeAttribute('dir')
      }
    }
  }, [lang, isRtl])

  return (
    <LanguageContext.Provider
      value={{
        lang,
        isRtl,
        t,
        toEnPath,
        toArPath,
        toLocalizedPath: (path) => toLocalizedPath(path, lang),
        hasArabicVariant,
        toSupportedLocalizedPath: (path) => toSupportedLocalizedPath(path, lang),
        getLanguageSwitchPath,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

/** Use inside any component that needs translated strings or direction state. */
export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext)
}

/** Strips the /ar prefix from a localized path. */
export function toEnPath(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`

  if (clean === '/ar' || clean === '/ar/') {
    return '/'
  }

  if (clean.startsWith('/ar/')) {
    return clean.slice(3) || '/'
  }

  return clean
}

/** Returns the /ar/-prefixed version of a path for building hreflang links. */
export function toArPath(enPath: string): string {
  const clean = toEnPath(enPath)
  return clean === '/' ? '/ar/' : `/ar${clean}`
}

export function toLocalizedPath(path: string, lang: Lang): string {
  return lang === 'ar' ? toArPath(path) : toEnPath(path)
}

export function hasArabicVariant(path: string): boolean {
  return ARABIC_CORE_PATHS.has(normalizeSitePath(toEnPath(path)))
}

export function toSupportedLocalizedPath(path: string, lang: Lang): string {
  const englishPath = normalizeSitePath(toEnPath(path))

  if (lang !== 'ar') {
    return englishPath
  }

  return hasArabicVariant(englishPath) ? toArPath(englishPath) : englishPath
}

export function getLanguageSwitchPath(path: string): string {
  const englishPath = normalizeSitePath(toEnPath(path))

  if (path === '/ar' || path === '/ar/' || path.startsWith('/ar/')) {
    return englishPath
  }

  return hasArabicVariant(englishPath) ? toArPath(englishPath) : '/ar/'
}
