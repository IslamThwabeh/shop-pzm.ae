import type { LucideIcon } from 'lucide-react'
import {
  Gamepad2,
  Globe,
  Headphones,
  Laptop,
  Monitor,
  Newspaper,
  Package,
  ShieldCheck,
  Smartphone,
  Store,
  Tablet,
  Wrench,
} from 'lucide-react'

type RetailMediaPlaceholderProps = {
  name: string
  variant?: 'card' | 'panel' | 'thumb' | 'article'
  className?: string
}

type PlaceholderTone = 'amber' | 'emerald' | 'sky' | 'slate' | 'violet'

const iconSizeByVariant = {
  card: 34,
  panel: 42,
  thumb: 24,
  article: 38,
} satisfies Record<NonNullable<RetailMediaPlaceholderProps['variant']>, number>

const iconShellByVariant = {
  card: 'h-16 w-16 md:h-[4.5rem] md:w-[4.5rem]',
  panel: 'h-20 w-20 md:h-24 md:w-24',
  thumb: 'h-12 w-12 md:h-14 md:w-14',
  article: 'h-18 w-18 md:h-[5rem] md:w-[5rem]',
} satisfies Record<NonNullable<RetailMediaPlaceholderProps['variant']>, string>

const toneClasses: Record<PlaceholderTone, string> = {
  amber: 'from-amber-50 via-white to-yellow-100 text-amber-700',
  emerald: 'from-emerald-50 via-white to-green-100 text-emerald-700',
  sky: 'from-sky-50 via-white to-sky-100 text-sky-700',
  slate: 'from-slate-50 via-white to-slate-100 text-slate-700',
  violet: 'from-violet-50 via-white to-fuchsia-100 text-violet-700',
}

function resolveIcon(name: string): LucideIcon {
  const normalized = name.toLowerCase()

  if (normalized.includes('repair') || normalized.includes('maintenance') || normalized.includes('fix') || normalized.includes('service')) {
    return Wrench
  }

  if (normalized.includes('iphone') || normalized.includes('phone') || normalized.includes('mobile') || normalized.includes('smart')) {
    return Smartphone
  }

  if (normalized.includes('ipad') || normalized.includes('tablet')) {
    return Tablet
  }

  if (normalized.includes('macbook') || normalized.includes('laptop') || normalized.includes('mac') || normalized.includes('computer')) {
    return Laptop
  }

  if (normalized.includes('pc') || normalized.includes('monitor')) {
    return Monitor
  }

  if (normalized.includes('gaming') || normalized.includes('console')) {
    return Gamepad2
  }

  if (normalized.includes('accessor') || normalized.includes('audio') || normalized.includes('airpod') || normalized.includes('headphone')) {
    return Headphones
  }

  if (normalized.includes('used') || normalized.includes('pre-owned') || normalized.includes('secondhand') || normalized.includes('certified')) {
    return ShieldCheck
  }

  if (normalized.includes('blog') || normalized.includes('guide') || normalized.includes('article') || normalized.includes('market') || normalized.includes('news')) {
    return Newspaper
  }

  if (normalized.includes('website') || normalized.includes('web') || normalized.includes('design')) {
    return Globe
  }

  if (normalized.includes('brand') || normalized.includes('latest') || normalized.includes('store')) {
    return Store
  }

  return Package
}

function resolveTone(name: string): PlaceholderTone {
  const normalized = name.toLowerCase()

  if (normalized.includes('repair') || normalized.includes('maintenance') || normalized.includes('fix') || normalized.includes('used') || normalized.includes('pre-owned') || normalized.includes('secondhand')) {
    return 'amber'
  }

  if (normalized.includes('gaming')) {
    return 'violet'
  }

  if (normalized.includes('brand') || normalized.includes('latest') || normalized.includes('accessor')) {
    return 'emerald'
  }

  if (normalized.includes('blog') || normalized.includes('guide') || normalized.includes('article') || normalized.includes('market') || normalized.includes('news')) {
    return 'slate'
  }

  return 'sky'
}

export default function RetailMediaPlaceholder({
  name,
  variant = 'card',
  className = '',
}: RetailMediaPlaceholderProps) {
  const Icon = resolveIcon(name)
  const toneClass = toneClasses[resolveTone(name)]

  return (
    <div
      aria-hidden="true"
      className={[
        'relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br',
        toneClass,
        className,
      ].filter(Boolean).join(' ')}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_transparent_62%)]" />
      <div className="relative flex h-full w-full items-center justify-center p-4 md:p-5">
        <span
          className={[
            'inline-flex items-center justify-center rounded-full border border-white/80 bg-white/90 shadow-sm ring-1 ring-black/5',
            iconShellByVariant[variant],
          ].join(' ')}
        >
          <Icon size={iconSizeByVariant[variant]} strokeWidth={1.8} />
        </span>
      </div>
    </div>
  )
}