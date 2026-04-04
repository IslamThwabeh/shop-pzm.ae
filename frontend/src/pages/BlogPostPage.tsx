import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import Seo from '../components/Seo'
import { getRelatedBlogPosts, resolveBlogPost } from '../content/blogCatalog'
import { buildSiteUrl, toAbsoluteSiteUrl } from '../utils/siteConfig'

function formatPublishedDate(publishedAt: string) {
  return new Date(`${publishedAt}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function estimateReadTime(bodyHtml: string) {
  const plainText = bodyHtml.replace(/<[^>]+>/g, ' ')
  const words = plainText.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}

export default function BlogPostPage() {
  const { slug: routeSlug } = useParams()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const slug = routeSlug || searchParams.get('slug')
  const post = resolveBlogPost(slug)

  if (!post) {
    return (
      <div className="rounded-[28px] border border-brandBorder bg-white p-10 text-center shadow-sm">
        <Seo
          title="Article Not Found | PZM Blog"
          description="The requested blog article could not be found."
          canonicalPath="/blog/"
          noindex={true}
        />
        <h1 className="text-3xl font-bold text-slate-950">Article not found</h1>
        <p className="mt-4 text-brandTextMedium">This legacy blog URL is not mapped to a current article.</p>
        <Link
          to="/blog"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brandGreenDark"
        >
          Back to Blog
        </Link>
      </div>
    )
  }

  const relatedPosts = getRelatedBlogPosts(post.slug)
  const readTimeMinutes = estimateReadTime(post.bodyHtml)
  const articleImageUrl = toAbsoluteSiteUrl(post.imageUrl)

  return (
    <div className="space-y-10">
      <Seo
        title={`${post.title} | PZM Blog`}
        description={post.seoDescription}
        canonicalPath={`/blog/${post.slug}`}
        imageUrl={articleImageUrl}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.seoDescription,
          image: [articleImageUrl],
          datePublished: `${post.publishedAt}T00:00:00+04:00`,
          dateModified: `${post.publishedAt}T00:00:00+04:00`,
          author: {
            '@type': 'Organization',
            name: 'PZM Computers & Phones Store',
          },
          publisher: {
            '@type': 'Organization',
            name: 'PZM Computers & Phones Store',
            logo: {
              '@type': 'ImageObject',
              url: toAbsoluteSiteUrl('/images/mini_logo.png'),
            },
          },
          mainEntityOfPage: buildSiteUrl(`/blog/${post.slug}`),
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/blog/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          <ArrowLeft size={16} />
          Back to blog
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-brandTextMedium">
          <span className="rounded-full bg-brandLight px-3 py-1 text-primary">{post.category}</span>
          <span>{formatPublishedDate(post.publishedAt)}</span>
          <span>{readTimeMinutes} min read</span>
        </div>
      </div>

      <article className="overflow-hidden rounded-[32px] border border-brandBorder bg-white shadow-sm">
        <div className={`h-56 bg-gradient-to-br ${post.themeClassName} p-8 md:h-72`}>
          <div className="flex h-full items-end">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full bg-white/85 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-sky-700 shadow-sm">
                {post.category}
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-slate-950 md:text-5xl">
                {post.title}
              </h1>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div
            className="text-base leading-8 text-brandTextDark [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_h3]:mt-10 [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:tracking-tight [&_li]:mt-2 [&_p]:mt-5 [&_ul]:mt-5 [&_ul]:list-disc [&_ul]:pl-6"
            dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
          />
        </div>
      </article>

      <section className="rounded-[28px] border border-brandBorder bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight text-slate-950">Next steps related to this article</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {post.relatedServiceLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-[22px] border border-brandBorder px-5 py-4 text-left transition-colors hover:border-primary hover:bg-green-50"
            >
              <span className="block text-lg font-semibold text-slate-950">{link.label}</span>
              <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Open page
                <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">Related articles</h2>
          <Link to="/blog/" className="text-sm font-semibold text-primary hover:underline">
            View all posts
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {relatedPosts.map((relatedPost) => (
            <Link
              key={relatedPost.slug}
              to={`/blog/${relatedPost.slug}`}
              className="rounded-[24px] border border-brandBorder bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="inline-flex rounded-full bg-brandLight px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                {relatedPost.category}
              </span>
              <h3 className="mt-4 text-xl font-bold leading-8 text-slate-950">{relatedPost.title}</h3>
              <p className="mt-3 text-sm leading-7 text-brandTextMedium">{relatedPost.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}