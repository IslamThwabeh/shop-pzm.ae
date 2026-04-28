import type { Product } from '@shared/types'
import { buyIphoneFamilies, getBuyIphoneFamilyGroups } from '../content/buyIphoneCatalog'
import { getDeviceFinderDestination, type DeviceFinderCondition, type DeviceFinderKey } from './deviceFinder'
import { groupProductsByModelFamily, resolveProductBrand } from './productPresentation'

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export type FamilyKind = 'iphone' | 'generic'

export interface SearchableFamily {
  /** Stable identifier used in URLs and React keys. */
  key: string
  /** Human-readable family label shown in suggestions. */
  label: string
  /** Brand display name (e.g. Apple, Samsung). */
  brand: string
  /** Destination key used to look up routes from `deviceFinder` when applicable. */
  finderKey: DeviceFinderKey | null
  kind: FamilyKind
  /** Lower-cased, normalised tokens used for matching. */
  searchTokens: string[]
  /** Lower-cased, normalised aliases (single tokens or short phrases). */
  aliases: string[]
  /** Numeric generation signal (e.g. 17, 25, 5). Higher = newer. */
  generation: number
  /** In-stock product count (quantity > 0). */
  inStockCount: number
  /** In-stock product count scoped to brand-new items. */
  newInStockCount: number
  /** In-stock product count scoped to pre-owned items. */
  usedInStockCount: number
  /** Total product count for this family. */
  productCount: number
  /** Mix of conditions present in this family. */
  conditions: Set<'new' | 'used'>
  /** Pre-resolved newest release year if available. */
  releaseYear: number
}

export interface SearchIndex {
  families: SearchableFamily[]
  /** Quick lookup by lower-case key. */
  byKey: Map<string, SearchableFamily>
}

export interface RankedSuggestion {
  family: SearchableFamily
  score: number
  /** Best destination URL for this family given current stock. */
  destination: string
}

/* ------------------------------------------------------------------ */
/*  Normalisation                                                     */
/* ------------------------------------------------------------------ */

/** Lower-case, strip diacritics, separate digit/letter runs, collapse non-alnum. */
export function normalizeQuery(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // split joined alpha+digit runs: "iphone17" -> "iphone 17"
    .replace(/([a-z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-z])/g, '$1 $2')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/** Per-token alias map (applied after normalisation, on each token). */
const TOKEN_ALIASES: Record<string, string> = {
  iph: 'iphone',
  iphn: 'iphone',
  ihpone: 'iphone',
  ihpones: 'iphone',
  iphones: 'iphone',
  iphonex: 'iphone',
  ipone: 'iphone',
  iphome: 'iphone',
  apl: 'apple',
  appl: 'apple',
  mac: 'macbook',
  macbk: 'macbook',
  macb: 'macbook',
  mcbook: 'macbook',
  bk: 'book',
  ipd: 'ipad',
  ipads: 'ipad',
  galaxy: 'galaxy',
  gal: 'galaxy',
  glx: 'galaxy',
  sams: 'samsung',
  samsng: 'samsung',
  sumsung: 'samsung',
  ps: 'playstation',
  ps3: 'playstation 3',
  ps4: 'playstation 4',
  ps5: 'playstation 5',
  playstation3: 'playstation 3',
  playstation4: 'playstation 4',
  playstation5: 'playstation 5',
  xbx: 'xbox',
  ninten: 'nintendo',
  swich: 'switch',
  surf: 'surface',
  pxl: 'pixel',
}

/** Multi-token phrase aliases applied to the full query before tokenisation. */
const PHRASE_ALIASES: Array<[RegExp, string]> = [
  [/\bmac\s*bk\b/g, 'macbook'],
  [/\bmac\s*book\b/g, 'macbook'],
  [/\bgalaxy\s*s\s*(\d+)\b/g, 'galaxy s $1'],
  [/\bps\s*([3-5])\b/g, 'playstation $1'],
  [/\bplay\s*station\b/g, 'playstation'],
]

export function expandQuery(value: string): string[] {
  let normalised = normalizeQuery(value)
  for (const [pattern, replacement] of PHRASE_ALIASES) {
    normalised = normalised.replace(pattern, replacement)
  }

  return normalised
    .split(' ')
    .filter(Boolean)
    .map((token) => TOKEN_ALIASES[token] ?? token)
    .flatMap((token) => token.split(' ').filter(Boolean))
}

/* ------------------------------------------------------------------ */
/*  Damerau–Levenshtein distance (capped, cheap)                       */
/* ------------------------------------------------------------------ */

function editDistance(a: string, b: string, cap = 2): number {
  if (a === b) return 0
  if (Math.abs(a.length - b.length) > cap) return cap + 1

  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m

  // Two-row DP with early exit.
  let prev = new Array(n + 1)
  let curr = new Array(n + 1)
  for (let j = 0; j <= n; j++) prev[j] = j

  for (let i = 1; i <= m; i++) {
    curr[0] = i
    let rowMin = curr[0]
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1
      let v = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost)
      if (
        i > 1 &&
        j > 1 &&
        a.charCodeAt(i - 1) === b.charCodeAt(j - 2) &&
        a.charCodeAt(i - 2) === b.charCodeAt(j - 1)
      ) {
        // Damerau transposition.
        // prev2 isn't tracked separately, but for our small strings the simpler
        // bound above is fine; recompute via a quick check.
        v = Math.min(v, (prev[j - 2] ?? Infinity) + cost)
      }
      curr[j] = v
      if (v < rowMin) rowMin = v
    }
    if (rowMin > cap) return cap + 1
    ;[prev, curr] = [curr, prev]
  }

  return prev[n]
}

/* ------------------------------------------------------------------ */
/*  Family / brand helpers                                            */
/* ------------------------------------------------------------------ */

/** Strip noisy trailing tokens to get a clean "family" label from a model. */
function familyTitleFromModel(model: string, brand: string): string {
  let title = model
    // Strip storage tokens.
    .replace(/\b\d+\s*(gb|tb)\b/gi, '')
    // Strip common trailing config/colour words.
    .replace(/\b(unlocked|dual\s*sim|esim|sim\s*free|wifi|cellular|space|silver|gold|graphite|black|white|blue|green|red|purple|pink|natural|titanium|midnight|starlight|deep purple|sierra blue|alpine green)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()

  // Brand-aware cleanups for common families.
  if (/samsung/i.test(brand)) {
    // Drop the leading "Samsung" prefix when "Galaxy" already carries the family.
    title = title.replace(/^samsung\s+(?=galaxy\b)/i, '').trim()
  }

  return title
}

function deriveGeneration(label: string, kind: FamilyKind, key: string): number {
  if (kind === 'iphone') {
    // Use the iPhone family ordering (newer keys come first in our list).
    const idx = buyIphoneFamilies.findIndex((f) => f.key === key)
    if (idx >= 0) {
      // Higher number = newer. Pro/Pro Max/Air share the "17" generation.
      const m = key.match(/iphone-(\d+)/)
      if (m) {
        const major = parseInt(m[1], 10)
        const variantBoost = key.includes('pro-max') ? 0.4 : key.includes('pro') ? 0.3 : key.includes('air') ? 0.2 : 0.1
        return major + variantBoost
      }
      return 100 - idx
    }
  }

  // Generic: pick the largest standalone integer in the label (e.g. "Galaxy S25" -> 25, "PlayStation 5" -> 5).
  const matches = label.match(/\b\d{1,4}\b/g)
  if (matches) {
    const max = Math.max(...matches.map((s) => parseInt(s, 10)))
    if (Number.isFinite(max)) return max
  }
  return 0
}

function aliasesForFamily(label: string, brand: string): string[] {
  const aliases = new Set<string>()
  const normLabel = normalizeQuery(label)
  aliases.add(normLabel)

  // Brand alone is a useful alias.
  aliases.add(normalizeQuery(brand))

  // Brand + label without redundant brand prefix, and label without brand prefix.
  const labelNoBrand = normLabel.replace(new RegExp(`^${normalizeQuery(brand)}\\s+`), '')
  if (labelNoBrand) aliases.add(labelNoBrand)

  // Some convenient short forms.
  if (/galaxy\s+s\s*\d+/i.test(label)) {
    const m = label.match(/galaxy\s+s\s*(\d+)/i)
    if (m) aliases.add(`s${m[1]}`)
  }
  if (/playstation\s*(\d+)/i.test(label)) {
    const m = label.match(/playstation\s*(\d+)/i)
    if (m) aliases.add(`ps${m[1]}`)
  }

  return Array.from(aliases).filter(Boolean)
}

/** Map a family to a deviceFinder key when possible. */
function resolveFinderKey(label: string, brand: string): DeviceFinderKey | null {
  const text = `${brand} ${label}`.toLowerCase()
  if (/\biphone\b/.test(text)) return 'iphone'
  if (/\bmacbook\b/.test(text)) return 'macbook'
  if (/\bipad\b/.test(text)) return 'ipad'
  if (/\b(samsung|galaxy)\b/.test(text)) return 'samsung'
  if (/\b(playstation|ps[345]|xbox|nintendo|switch|gaming|rog|alienware|aorus)\b/.test(text)) return 'gaming'
  return null
}

/* ------------------------------------------------------------------ */
/*  Index builder                                                     */
/* ------------------------------------------------------------------ */

function pickReleaseYear(products: Product[]): number {
  let max = 0
  for (const p of products) {
    const y = typeof p.release_year === 'number' ? p.release_year : 0
    if (y > max) max = y
  }
  return max
}

function countInStock(products: Product[]): number {
  let n = 0
  for (const p of products) if ((p.quantity ?? 0) > 0) n += 1
  return n
}

function countConditionInStock(products: Product[], condition: 'new' | 'used'): number {
  let n = 0
  for (const p of products) {
    if (p.condition === condition && (p.quantity ?? 0) > 0) {
      n += 1
    }
  }
  return n
}

function collectConditions(products: Product[]): Set<'new' | 'used'> {
  const set = new Set<'new' | 'used'>()
  for (const p of products) set.add(p.condition)
  return set
}

export function buildSearchIndex(products: Product[]): SearchIndex {
  const families: SearchableFamily[] = []

  // 1) iPhone families — use the explicit catalogue as source of truth.
  const iphoneGroups = getBuyIphoneFamilyGroups(products)
  const iphoneProductIds = new Set<string>()
  for (const group of iphoneGroups) {
    if (group.products.length === 0) {
      continue
    }

    for (const p of group.products) iphoneProductIds.add(p.id)
    const aliases = aliasesForFamily(group.family.title, 'Apple')
    aliases.push('iphone')
    families.push({
      key: group.family.key,
      label: group.family.title,
      brand: 'Apple',
      finderKey: 'iphone',
      kind: 'iphone',
      searchTokens: normalizeQuery(group.family.title).split(' ').filter(Boolean),
      aliases,
      generation: deriveGeneration(group.family.title, 'iphone', group.family.key),
      inStockCount: countInStock(group.products),
      newInStockCount: countConditionInStock(group.products, 'new'),
      usedInStockCount: countConditionInStock(group.products, 'used'),
      productCount: group.products.length,
      conditions: collectConditions(group.products),
      releaseYear: pickReleaseYear(group.products),
    })
  }

  // 2) Generic families — derive from non-iPhone products via base-model grouping.
  const nonIphone = products.filter((p) => !iphoneProductIds.has(p.id) && !/\biphone\b/i.test(p.model))
  const generic = groupProductsByModelFamily(nonIphone)

  for (const group of generic) {
    if (group.products.length === 0) continue
    const sample = group.products[0]
    const brand = resolveProductBrand(sample) || 'Other'
    const label = familyTitleFromModel(group.title, brand)
    if (!label || label.length < 2) continue

    // Skip ambiguous singletons that look like noisy one-off models (no digit, very short).
    const hasGenerationToken = /\d/.test(label)
    if (group.products.length < 2 && !hasGenerationToken) continue

    const finderKey = resolveFinderKey(label, brand)
    const aliases = aliasesForFamily(label, brand)
    const key = `generic:${normalizeQuery(label).replace(/\s+/g, '-')}`

    families.push({
      key,
      label,
      brand,
      finderKey,
      kind: 'generic',
      searchTokens: normalizeQuery(label).split(' ').filter(Boolean),
      aliases,
      generation: deriveGeneration(label, 'generic', key),
      inStockCount: countInStock(group.products),
      newInStockCount: countConditionInStock(group.products, 'new'),
      usedInStockCount: countConditionInStock(group.products, 'used'),
      productCount: group.products.length,
      conditions: collectConditions(group.products),
      releaseYear: pickReleaseYear(group.products),
    })
  }

  const byKey = new Map<string, SearchableFamily>()
  for (const f of families) byKey.set(f.key, f)

  return { families, byKey }
}

/* ------------------------------------------------------------------ */
/*  Destination resolution                                            */
/* ------------------------------------------------------------------ */

function preferredCondition(family: SearchableFamily): DeviceFinderCondition {
  const hasNew = family.conditions.has('new')
  const hasUsed = family.conditions.has('used')
  // Prefer brand-new in-stock if any; else pre-owned.
  if (family.newInStockCount > 0) return 'brand-new'
  if (family.usedInStockCount > 0) return 'pre-owned'
  if (hasNew && !hasUsed) return 'brand-new'
  if (hasUsed && !hasNew) return 'pre-owned'
  return 'brand-new'
}

function appendQueryParam(url: string, key: string, value: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}${key}=${encodeURIComponent(value)}`
}

export function getSuggestionDestination(family: SearchableFamily, query: string): string {
  const q = query.trim()

  // iPhone families always land on /services/buy-iphone with a family anchor.
  if (family.kind === 'iphone') {
    let url = '/services/buy-iphone'
    url = appendQueryParam(url, 'family', family.key)
    if (q) url = appendQueryParam(url, 'q', q)
    return url
  }

  if (family.finderKey && family.finderKey !== 'all') {
    const condition = preferredCondition(family)
    let url = getDeviceFinderDestination(condition, family.finderKey)
    url = appendQueryParam(url, 'family', family.key)
    if (q) url = appendQueryParam(url, 'q', q)
    return url
  }

  // Fallback: brand-new or secondhand index, with q only.
  const condition = preferredCondition(family)
  const base = condition === 'brand-new' ? '/services/brand-new' : '/services/secondhand'
  let url = appendQueryParam(base, 'family', family.key)
  if (q) url = appendQueryParam(url, 'q', q)
  return url
}

export function normalizeStorefrontFamilyKey(value: string | null) {
  if (!value) {
    return null
  }

  const trimmed = value.trim().toLowerCase()
  return trimmed || null
}

export function getStorefrontFamilyKey(product: Product) {
  for (const family of buyIphoneFamilies) {
    if (family.matcher.test(normalizeQuery(product.model))) {
      return family.key
    }
  }

  const brand = resolveProductBrand(product) || 'Other'
  const label = familyTitleFromModel(product.model, brand)
  if (!label) {
    return null
  }

  return `generic:${normalizeQuery(label).replace(/\s+/g, '-')}`
}

export function matchesStorefrontFamily(product: Product, familyKey: string | null) {
  const normalizedFamilyKey = normalizeStorefrontFamilyKey(familyKey)
  if (!normalizedFamilyKey) {
    return true
  }

  return getStorefrontFamilyKey(product) === normalizedFamilyKey
}

/* ------------------------------------------------------------------ */
/*  Search / ranking                                                  */
/* ------------------------------------------------------------------ */

export interface SearchOptions {
  limit?: number
}

interface ScoreParts {
  score: number
}

function scoreFamily(family: SearchableFamily, queryTokens: string[], rawNormalised: string): ScoreParts | null {
  if (queryTokens.length === 0) return null
  const labelNorm = normalizeQuery(family.label)
  const aliases = family.aliases

  let score = 0
  let hadAnyMatch = false

  // Whole-string strong signals.
  if (labelNorm === rawNormalised) {
    score += 1000
    hadAnyMatch = true
  } else if (labelNorm.startsWith(rawNormalised)) {
    score += 700
    hadAnyMatch = true
  } else if (rawNormalised.length >= 2 && labelNorm.includes(rawNormalised)) {
    score += 250
    hadAnyMatch = true
  }

  // Alias matches.
  for (const alias of aliases) {
    if (!alias) continue
    if (alias === rawNormalised) {
      score += 220
      hadAnyMatch = true
    } else if (alias.startsWith(rawNormalised)) {
      score += 150
      hadAnyMatch = true
    }
  }

  // Token-level signals.
  for (const token of queryTokens) {
    let tokenMatched = false

    for (const labelToken of family.searchTokens) {
      if (labelToken === token) {
        score += 120
        tokenMatched = true
        break
      }
      if (labelToken.startsWith(token) && token.length >= 1) {
        score += 80
        tokenMatched = true
        break
      }
      if (token.length >= 4 && labelToken.includes(token)) {
        score += 40
        tokenMatched = true
        break
      }
    }

    if (!tokenMatched) {
      for (const alias of aliases) {
        if (alias === token || alias.startsWith(token)) {
          score += 60
          tokenMatched = true
          break
        }
      }
    }

    // Fuzzy fallback for longer tokens.
    if (!tokenMatched && token.length >= 4) {
      let bestEdit = Infinity
      for (const labelToken of family.searchTokens) {
        if (Math.abs(labelToken.length - token.length) > 2) continue
        const d = editDistance(token, labelToken, 2)
        if (d < bestEdit) bestEdit = d
      }
      const cap = token.length >= 7 ? 2 : 1
      if (bestEdit <= cap) {
        score += 60 - bestEdit * 20
        tokenMatched = true
      }
    }

    if (tokenMatched) hadAnyMatch = true
  }

  if (!hadAnyMatch) return null

  // Bonuses.
  if (family.inStockCount > 0) score += 40
  // Newness bonus, scaled (cap at +30).
  score += Math.min(30, Math.max(0, family.generation))

  return { score }
}

/** De-duplicate families that represent the same logical thing across new/used. */
function dedupeFamilies(ranked: RankedSuggestion[]): RankedSuggestion[] {
  const byLabel = new Map<string, RankedSuggestion>()
  for (const item of ranked) {
    const dedupeKey = `${item.family.brand.toLowerCase()}|${normalizeQuery(item.family.label)}`
    const existing = byLabel.get(dedupeKey)
    if (!existing || item.score > existing.score) {
      byLabel.set(dedupeKey, item)
    }
  }
  return Array.from(byLabel.values())
}

export function searchStorefront(query: string, index: SearchIndex, opts: SearchOptions = {}): RankedSuggestion[] {
  const limit = opts.limit ?? 8
  const trimmed = query.trim()
  if (!trimmed) return []

  const tokens = expandQuery(trimmed)
  const rawNormalised = normalizeQuery(trimmed)
  if (tokens.length === 0) return []

  const ranked: RankedSuggestion[] = []
  for (const family of index.families) {
    const scored = scoreFamily(family, tokens, rawNormalised)
    if (!scored) continue
    ranked.push({
      family,
      score: scored.score,
      destination: getSuggestionDestination(family, trimmed),
    })
  }

  const deduped = dedupeFamilies(ranked)

  deduped.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (b.family.generation !== a.family.generation) return b.family.generation - a.family.generation
    if (b.family.inStockCount !== a.family.inStockCount) return b.family.inStockCount - a.family.inStockCount
    return a.family.label.localeCompare(b.family.label)
  })

  return deduped.slice(0, limit)
}
