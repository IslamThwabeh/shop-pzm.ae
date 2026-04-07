import { useState } from 'react'
import { toAbsoluteSiteUrl } from '../utils/siteConfig'
import RetailMediaPlaceholder from './RetailMediaPlaceholder'

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

  if (!normalizedSrc || hasError) {
    return <RetailMediaPlaceholder name={name} variant={variant} className={className} />
  }

  return (
    <img
      src={normalizedSrc}
      alt={alt}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      className={className}
      onError={() => setHasError(true)}
    />
  )
}