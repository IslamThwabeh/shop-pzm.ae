import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
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
    <div className="space-y-12">
      <Seo
        title="Tech Blog | PZM Dubai"
        description="Latest market updates, repair advice, iPhone tips, used-device buying guides, and PC articles from PZM in Dubai."
        canonicalPath="/blog/"
      />

      <section className="overflow-hidden rounded-[32px] border border-brandBorder bg-[linear-gradient(180deg,#f0f7ff_0%,#e8f4fd_100%)] p-8 shadow-sm md:p-12">
        <span className="inline-flex rounded-full bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-sky-700 shadow-sm">
          PZM Blog
        </span>
        <h1 className="mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
          Market updates, buying guides, repair advice, and device knowledge from Dubai
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-brandTextMedium">
          The blog now lives inside the React app, so articles can use canonical routes, structured data, and internal links that point into the migrated shop and service flows.
        </p>
      </section>

      {featuredPost && (
        <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr] lg:items-stretch">
          <Link
            to={`/blog/${featuredPost.slug}`}
            className="overflow-hidden rounded-[30px] border border-brandBorder bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <div className={`h-52 bg-gradient-to-br ${featuredPost.themeClassName} p-8 md:h-64`}>
              <span className="inline-flex rounded-full bg-white/85 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-sky-700 shadow-sm">
                {featuredPost.category}
              </span>
            </div>
            <div className="p-8">
              <p className="text-sm font-semibold text-brandTextMedium">{formatPublishedDate(featuredPost.publishedAt)}</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{featuredPost.title}</h2>
              <p className="mt-4 text-base leading-8 text-brandTextMedium">{featuredPost.excerpt}</p>
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
                className="rounded-[24px] border border-brandBorder bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-brandLight px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                    {post.category}
                  </span>
                  <span className="text-xs font-semibold text-brandTextMedium">{formatPublishedDate(post.publishedAt)}</span>
                </div>
                <h3 className="mt-4 text-xl font-bold leading-8 text-slate-950">{post.title}</h3>
                <p className="mt-3 text-sm leading-7 text-brandTextMedium">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {blogPostsNewestFirst.map((post) => (
          <Link
            key={post.slug}
            to={`/blog/${post.slug}`}
            className="overflow-hidden rounded-[28px] border border-brandBorder bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <div className={`h-44 bg-gradient-to-br ${post.themeClassName} p-6`}>
              <span className="inline-flex rounded-full bg-white/85 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-sky-700 shadow-sm">
                {post.category}
              </span>
            </div>
            <div className="p-7">
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