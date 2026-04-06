import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import RetailMediaPlaceholder from '../components/RetailMediaPlaceholder'
import Seo from '../components/Seo'
import { blogPostsNewestFirst } from '../content/blogCatalog'

function formatPublishedDate(publishedAt: string) {
  return new Date(`${publishedAt}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function BlogPage() {
  const [featuredPost, ...otherPosts] = blogPostsNewestFirst

  return (
    <div className="space-y-10">
      <Seo
        title="Tech Blog | PZM Dubai"
        description="Latest market updates, repair advice, iPhone tips, used-device buying guides, and PC articles from PZM in Dubai."
        canonicalPath="/blog/"
      />

      <section className="overflow-hidden rounded-[32px] border border-brandBorder bg-[linear-gradient(180deg,#f0f7ff_0%,#e8f4fd_100%)] p-6 shadow-sm md:p-10">
        <span className="inline-flex rounded-full bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-sky-700 shadow-sm">
          PZM Blog
        </span>
        <h1 className="mt-5 max-w-3xl text-[2.35rem] font-extrabold tracking-tight text-slate-950 md:text-[3.2rem]">
          Market updates, buying guides, repair advice, and device knowledge from Dubai
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-brandTextMedium md:text-lg">
          Read practical articles from the PZM team on local device pricing, repair decisions, used-tech buying, and the products people actually shop in Dubai.
        </p>
      </section>

      {featuredPost && (
        <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr] lg:items-stretch">
          <Link
            to={`/blog/${featuredPost.slug}`}
            className="overflow-hidden rounded-[30px] border border-brandBorder bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative h-44 overflow-hidden sm:h-52 md:h-60">
              <RetailMediaPlaceholder name={featuredPost.category} variant="article" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />
              <div className={`absolute inset-0 bg-gradient-to-br ${featuredPost.themeClassName} opacity-25`} />
              <div className="absolute inset-x-0 top-0 p-8">
                <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-sky-700 shadow-sm">
                  {featuredPost.category}
                </span>
              </div>
            </div>
            <div className="p-6 md:p-8">
              <p className="text-sm font-semibold text-brandTextMedium">{formatPublishedDate(featuredPost.publishedAt)}</p>
              <h2 className="mt-3 text-[1.9rem] font-bold tracking-tight text-slate-950 md:text-[2.2rem]">{featuredPost.title}</h2>
              <p className="mt-4 text-[0.98rem] leading-7 text-brandTextMedium md:text-base">{featuredPost.excerpt}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Read featured article
                <ArrowRight size={16} />
              </span>
            </div>
          </Link>

          <div className="grid gap-4">
            {otherPosts.slice(0, 3).map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="overflow-hidden rounded-[24px] border border-brandBorder bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-32 overflow-hidden sm:h-36">
                  <RetailMediaPlaceholder name={post.category} variant="article" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/15 to-transparent" />
                  <div className={`absolute inset-0 bg-gradient-to-br ${post.themeClassName} opacity-20`} />
                  <div className="absolute inset-x-0 top-0 p-5">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-brandLight px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                      {post.category}
                    </span>
                    <span className="text-xs font-semibold text-brandTextMedium">{formatPublishedDate(post.publishedAt)}</span>
                  </div>
                  <h3 className="mt-4 text-xl font-bold leading-8 text-slate-950">{post.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-brandTextMedium">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {blogPostsNewestFirst.map((post) => (
          <Link
            key={post.slug}
            to={`/blog/${post.slug}`}
            className="overflow-hidden rounded-[28px] border border-brandBorder bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative h-36 overflow-hidden sm:h-40 md:h-44">
              <RetailMediaPlaceholder name={post.category} variant="article" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
              <div className={`absolute inset-0 bg-gradient-to-br ${post.themeClassName} opacity-20`} />
              <div className="absolute inset-x-0 top-0 p-6">
                <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-sky-700 shadow-sm">
                  {post.category}
                </span>
              </div>
            </div>
            <div className="p-6 md:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brandTextMedium">{formatPublishedDate(post.publishedAt)}</p>
              <h2 className="mt-3 text-2xl font-bold leading-8 text-slate-950">{post.title}</h2>
              <p className="mt-3 text-sm leading-7 text-brandTextMedium">{post.excerpt}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Read article
                <ArrowRight size={16} />
              </span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  )
}