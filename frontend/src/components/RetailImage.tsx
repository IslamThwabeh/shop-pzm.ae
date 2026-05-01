import { useState } from 'react'
import { toAbsoluteSiteUrl } from '../utils/siteConfig'
import RetailMediaPlaceholder from './RetailMediaPlaceholder'

const intrinsicSizeByVariant = {
  card: { width: 640, height: 640 },
  panel: { width: 1200, height: 900 },
  thumb: { width: 120, height: 120 },
  article: { width: 1200, height: 675 },
} as const

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

  return (
    <img
      src={normalizedSrc}
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