import { Helmet } from 'react-helmet-async'
import { siteIdentity } from '../content/siteData'
import { toArPath, toEnPath, useLanguage } from '../context/LanguageContext'
import { buildCanonicalUrl, normalizeSitePath, toAbsoluteSiteUrl } from '../utils/siteConfig'

interface SeoProps {
  title: string
  description: string
  canonicalPath: string
  imageUrl?: string
  noindex?: boolean
  jsonLd?: Record<string, any> | Array<Record<string, any>>
  /**
   * When provided, injects hreflang alternate links for the English canonical
   * path and its Arabic /ar/ mirror.  Pass the bare English path, e.g.
   * '/services/gaming-pc'.  The component will derive the /ar/ counterpart.
   */
  hreflangPath?: string
}

const SITE_NAME = siteIdentity.publicBrandName
const DEFAULT_IMAGE = toAbsoluteSiteUrl('/images/mini_logo.png')

export default function Seo({
  title,
  description,
  canonicalPath,
  imageUrl,
  noindex = false,
  jsonLd,
  hreflangPath,
}: SeoProps) {
  const { lang } = useLanguage()
  const normalizedCanonicalPath = normalizeSitePath(
    lang === 'ar' ? toArPath(canonicalPath) : toEnPath(canonicalPath)
  )
  const canonicalUrl = buildCanonicalUrl(normalizedCanonicalPath)
  const robots = noindex ? 'noindex, follow' : 'index, follow'
  const ogImage = imageUrl ? toAbsoluteSiteUrl(imageUrl) : DEFAULT_IMAGE

  const jsonLdArray = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []
  const normalizedHreflangPath = hreflangPath ? normalizeSitePath(toEnPath(hreflangPath)) : null

  // Build hreflang URLs when the caller provides a base English path.
  const enHref = normalizedHreflangPath ? buildCanonicalUrl(normalizedHreflangPath) : null
  const arHref = normalizedHreflangPath ? buildCanonicalUrl(toArPath(normalizedHreflangPath)) : null

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />

      {enHref && <link rel="alternate" hrefLang="en-AE" href={enHref} />}
      {arHref && <link rel="alternate" hrefLang="ar-AE" href={arHref} />}
      {enHref && <link rel="alternate" hrefLang="x-default" href={enHref} />}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLdArray.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
        >
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  )
}
