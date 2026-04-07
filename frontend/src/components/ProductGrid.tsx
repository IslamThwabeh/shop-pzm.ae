import type { ReactNode } from 'react'

interface ProductGridProps {
  children: ReactNode
  className?: string
}

export default function ProductGrid({ children, className = '' }: ProductGridProps) {
  return (
    <div
      className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}
    >
      {children}
    </div>
  )
}
