const DEFAULT_SITE_URL = 'https://shop.pzm.ae'

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}

function normalizePath(path: string) {
  if (!path) return ''
  return path.startsWith('/') ? path : `/${path}`
}

export const SITE_URL = trimTrailingSlash(import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL)
export const API_BASE_URL = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || '/api')

export function buildSiteUrl(path = '/') {
  return `${SITE_URL}${normalizePath(path)}`
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