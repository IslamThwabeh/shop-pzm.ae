import { useState } from 'react'
import { toAbsoluteSiteUrl } from '../utils/siteConfig'
import RetailMediaPlaceholder from './RetailMediaPlaceholder'

const intrinsicSizeByVariant = {
  card: { width: 640, height: 640 },
  panel: { width: 1200, height: 900 },
  thumb: { width: 120, height: 120 },
  article: { width: 1200, height: 675 },
} as const

// Card images on mobile are ~half-viewport wide; on desktop they settle at ~160px.
const sizesByVariant: Partial<Record<'card' | 'panel' | 'thumb' | 'article', string>> = {
  card: '(max-width: 640px) calc(50vw - 24px), 160px',
}

const SITE_ORIGIN = 'https://pzm.ae'

/**
 * Build a Cloudflare Image Resizing srcset for local (Pages-served) images.
 * Falls back gracefully: browsers that honour srcset use the resized variant;
 * the `src` attribute always points to the original for older browsers / errors.
 */
function buildCfSrcset(absoluteSrc: string, widths: number[]): string | undefined {
  if (!absoluteSrc.startsWith(`${SITE_ORIGIN}/`)) return undefined
  const localPath = absoluteSrc.slice(SITE_ORIGIN.length) // e.g. /images/generated/...
  return widths
    .map((w) => `/cdn-cgi/image/width=${w},format=webp,quality=85${localPath} ${w}w`)
    .join(', ')
}

type RetailImageProps = {
  src?: string | null
  alt: string
  name: string
  variant?: 'card' | 'panel' | 'thumb' | 'article'
  className?: string
  loading?: 'lazy' | 'eager'
  fetchPriority?: 'high' | 'low' | 'auto'
}

export default function RetailImage({
  src,
  alt,
  name,
  variant = 'card',
  className = '',
  loading = 'lazy',
  fetchPriority = 'auto',
}: RetailImageProps) {
  const [hasError, setHasError] = useState(false)
  const normalizedSrc = typeof src === 'string' && src.trim() ? toAbsoluteSiteUrl(src.trim()) : ''
  const intrinsicSize = intrinsicSizeByVariant[variant]

  if (!normalizedSrc || hasError) {
    return <RetailMediaPlaceholder name={name} variant={variant} className={className} />
  }

  const srcSet = variant === 'card' ? buildCfSrcset(normalizedSrc, [320, 640]) : undefined
  const sizes = sizesByVariant[variant]

  return (
    <img
      src={normalizedSrc}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={intrinsicSize.width}
      height={intrinsicSize.height}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      className={className}
      onError={() => setHasError(true)}
    />
  )
}