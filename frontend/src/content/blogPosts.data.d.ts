export interface BlogServiceLink {
  label: string
  to: string
}

export interface RawBlogPostEntry {
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

export const rawBlogPosts: RawBlogPostEntry[]
