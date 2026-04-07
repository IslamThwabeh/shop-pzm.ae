import { ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import RetailImage from './RetailImage'

interface CategoryCardProps {
  title: string
  subtitle?: string
  to: string
  imageUrl?: string
  icon?: LucideIcon
}

export default function CategoryCard({ title, subtitle, to, imageUrl, icon: Icon }: CategoryCardProps) {
  return (
    <Link
      to={to}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[#eee] bg-white transition-shadow hover:shadow-md"
    >
      {/* Image frame */}
      <div className="product-image-frame h-[140px] sm:h-[160px] lg:h-[170px] border-b border-[#eee]">
        {imageUrl ? (
          <RetailImage
            src={imageUrl}
            alt={title}
            name={title}
            variant="card"
            className="transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : Icon ? (
          <Icon size={36} className="text-slate-300" />
        ) : null}
      </div>

      {/* Label */}
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{title}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-400 truncate">{subtitle}</p>
          )}
        </div>
        <ArrowRight size={15} className="shrink-0 text-slate-300 transition-colors group-hover:text-slate-600" />
      </div>
    </Link>
  )
}
