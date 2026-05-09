import { normalizeSitePath } from '../utils/siteConfig'
import { rawBlogPosts as rawBlogPostRecords } from './blogPosts.data.js'

export interface BlogServiceLink {
  label: string
  to: string
}

export interface BlogPostEntry {
  title: string
  slug: string
  excerpt: string
  seoDescription: string
  category: string
  imageUrl: string
  publishedAt: string
  themeClassName: string
  bodyHtml: string
  relatedServiceLinks: BlogServiceLink[]
}


const page = normalizeSitePath

function normalizeBlogBodyHtml(bodyHtml: string) {
  return bodyHtml.replace(/href="(\/[^\"]*)"/g, (_, href: string) => `href="${page(href)}"`)
}

function normalizeBlogServiceLinks(links: BlogServiceLink[]) {
  return links.map((link) => ({
    ...link,
    to: page(link.to),
  }))
}

function formatInlineLinkList(links: Array<{ label: string; href: string }>) {
  const htmlLinks = links
    .filter((link) => link.label && link.href)
    .map((link) => `<a href="${link.href}">${link.label}</a>`)

  if (htmlLinks.length === 0) {
    return ''
  }

  if (htmlLinks.length === 1) {
    return htmlLinks[0]
  }

  if (htmlLinks.length === 2) {
    return `${htmlLinks[0]} and ${htmlLinks[1]}`
  }

  return `${htmlLinks.slice(0, -1).join(', ')}, and ${htmlLinks[htmlLinks.length - 1]}`
}

function getInlineRelatedPosts(post: BlogPostEntry, allPosts: BlogPostEntry[]) {
  const sameCategoryPosts = allPosts
    .filter((candidate) => candidate.slug !== post.slug && candidate.category === post.category)
    .slice(0, 2)

  if (sameCategoryPosts.length >= 2) {
    return sameCategoryPosts
  }

  const usedSlugs = new Set(sameCategoryPosts.map((candidate) => candidate.slug))
  const fallbackPosts = allPosts
    .filter((candidate) => candidate.slug !== post.slug && !usedSlugs.has(candidate.slug))
    .slice(0, 2 - sameCategoryPosts.length)

  return [...sameCategoryPosts, ...fallbackPosts]
}

function buildBlogInlineSection(post: BlogPostEntry, allPosts: BlogPostEntry[]) {
  const serviceText = formatInlineLinkList(
    normalizeBlogServiceLinks(post.relatedServiceLinks)
      .slice(0, 2)
      .map((link) => ({ label: link.label, href: link.to }))
  )

  const articleText = formatInlineLinkList(
    getInlineRelatedPosts(post, allPosts).map((candidate) => ({
      label: candidate.title,
      href: `/blog/${candidate.slug}/`,
    }))
  )

  return [
    '<h3>Keep exploring</h3>',
    serviceText
      ? `<p>If you want the practical next step after this article, compare ${serviceText} to move from research into current store routes, repair help, or live device options.</p>`
      : '',
    articleText
      ? `<p>For related reading, continue with ${articleText} to build a clearer buying, cleaning, or repair plan.</p>`
      : '',
  ].filter(Boolean).join('')
}

const rawBlogPosts: BlogPostEntry[] = rawBlogPostRecords as BlogPostEntry[]

export const blogPosts: BlogPostEntry[] = rawBlogPosts.map((post) => ({
  ...post,
  bodyHtml: normalizeBlogBodyHtml(`${post.bodyHtml}${buildBlogInlineSection(post, rawBlogPosts)}`),
  relatedServiceLinks: normalizeBlogServiceLinks(post.relatedServiceLinks),
}))

export const blogPostsNewestFirst = [...blogPosts].sort(
  (left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt)
)

export function resolveBlogPost(rawSlug?: string | null): BlogPostEntry | null {
  if (!rawSlug) return null

  const normalizedSlug = rawSlug.replace(/\.html$/i, '').toLowerCase()
  return blogPosts.find((post) => post.slug === normalizedSlug) || null
}

export function getRelatedBlogPosts(slug: string, limit = 3): BlogPostEntry[] {
  const currentPost = resolveBlogPost(slug)

  if (!currentPost) {
    return blogPostsNewestFirst.filter((post) => post.slug !== slug).slice(0, limit)
  }

  const currentServiceLinks = new Set(currentPost.relatedServiceLinks.map((link) => link.to))

  return [...blogPostsNewestFirst]
    .filter((post) => post.slug !== slug)
    .sort((left, right) => {
      const categoryDelta = Number(right.category === currentPost.category) - Number(left.category === currentPost.category)
      if (categoryDelta !== 0) {
        return categoryDelta
      }

      const sharedRightLinks = right.relatedServiceLinks.filter((link) => currentServiceLinks.has(link.to)).length
      const sharedLeftLinks = left.relatedServiceLinks.filter((link) => currentServiceLinks.has(link.to)).length
      if (sharedRightLinks !== sharedLeftLinks) {
        return sharedRightLinks - sharedLeftLinks
      }

      return Date.parse(right.publishedAt) - Date.parse(left.publishedAt)
    })
    .slice(0, limit)
}
