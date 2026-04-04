import { Helmet } from 'react-helmet-async'

interface SeoProps {
  title: string
  description: string
  canonicalPath: string
  imageUrl?: string
  noindex?: boolean
  jsonLd?: Record<string, any> | Array<Record<string, any>>
}

const SITE_NAME = 'PZM Computers & Phones Store'
const SITE_URL = 'https://shop.pzm.ae'
const DEFAULT_IMAGE = `${SITE_URL}/images/mini_logo.png`

export default function Seo({
  title,
  description,
  canonicalPath,
  imageUrl,
  noindex = false,
  jsonLd,
}: SeoProps) {
  const canonicalUrl = `${SITE_URL}${canonicalPath}`
  const robots = noindex ? 'noindex, nofollow' : 'index, follow'
  const ogImage = imageUrl || DEFAULT_IMAGE

  const jsonLdArray = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={noindex ? 'website' : 'website'} />
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
