import { Star } from 'lucide-react'

interface Testimonial {
  name: string
  rating: number
  text: string
  timeAgo: string
}

const testimonials: Testimonial[] = [
  {
    name: 'Mohame Abbas',
    rating: 5,
    text: 'Honest and professional. They have computers, iPads, phones — new and used at great prices. Plus parts and accessories and maintenance services. Thank you to the management for the honesty and professionalism.',
    timeAgo: '1 year ago',
  },
  {
    name: 'Bechire Cheikh',
    rating: 5,
    text: 'Everything you need for computer and phone services in one place. Excellent deals on iPhones and iPads.',
    timeAgo: '1 year ago',
  },
  {
    name: 'Mohamed Madyn',
    rating: 5,
    text: 'Everything you need — phone and computer accessories and maintenance under one roof. New and used devices too.',
    timeAgo: '2 years ago',
  },
  {
    name: 'Bashar Bero',
    rating: 5,
    text: 'Best place to buy iPhones.',
    timeAgo: '5 months ago',
  },
  {
    name: 'Bader Keewan',
    rating: 5,
    text: 'Amazing staff. All devices are genuine — the best iPhones and iPads. Highly recommend.',
    timeAgo: '2 years ago',
  },
  {
    name: 'Kamal Yaseen',
    rating: 5,
    text: 'One of the best shops for buying, selling, and repairing laptops. Great service and accurate repair timelines.',
    timeAgo: '2 years ago',
  },
]

const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/e5Rhfo8YY3i8CatM7?g_st=ic'

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
      ))}
    </div>
  )
}

export default function TestimonialCards() {
  return (
    <div>
      <div className="mb-10 flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2">
          <Stars count={5} />
          <span className="text-lg font-bold text-slate-900">4.9</span>
        </div>
        <p className="text-sm text-brandTextMedium">
          From{' '}
          <a href={GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
            1,000+ Google reviews
          </a>
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <article key={t.name} className="rounded-[24px] border border-brandBorder bg-white p-6 shadow-sm">
            <Stars count={t.rating} />
            <p className="mt-4 text-sm leading-7 text-brandTextDark">{t.text}</p>
            <div className="mt-5 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">{t.name}</p>
              <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-brandTextMedium">{t.timeAgo}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 text-center">
        <a
          href={GOOGLE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-brandBorder bg-white px-5 py-3 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary"
        >
          See all reviews on Google
        </a>
      </div>
    </div>
  )
}
