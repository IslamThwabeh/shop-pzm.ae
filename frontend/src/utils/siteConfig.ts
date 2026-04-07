const DEFAULT_SITE_URL = 'https://shop.pzm.ae'

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}

function normalizePath(path: string) {
  if (!path) return ''
  return path.startsWith('/') ? path : `/${path}`
}

function splitPathSuffix(path: string) {
  const match = path.match(/^([^?#]*)([?#].*)?$/)
  return {
    basePath: match?.[1] || path,
    suffix: match?.[2] || '',
  }
}

export function normalizeSitePath(path = '/') {
  if (!path) return '/'
  if (/^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(path) || path.startsWith('#')) {
    return path
  }

  const normalizedPath = normalizePath(path)
  const { basePath, suffix } = splitPathSuffix(normalizedPath)

  if (basePath === '/' || /\.[a-z\d]+$/i.test(basePath)) {
    return `${basePath}${suffix}`
  }

  return `${basePath.replace(/\/+$/, '')}/${suffix}`
}

export const SITE_URL = trimTrailingSlash(import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL)
export const API_BASE_URL = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || '/api')

export function buildSiteUrl(path = '/') {
  return `${SITE_URL}${normalizePath(path)}`
}

export function buildCanonicalUrl(path = '/') {
  return `${SITE_URL}${normalizeSitePath(path)}`
}

export function toAbsoluteSiteUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl
  }

  return buildSiteUrl(pathOrUrl)
}

export function buildApiUrl(path: string) {
  return `${API_BASE_URL}${normalizePath(path)}`
}