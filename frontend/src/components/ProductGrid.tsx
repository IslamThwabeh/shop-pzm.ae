import type { ReactNode } from 'react'

interface ProductGridProps {
  children: ReactNode
  className?: string
}

export default function ProductGrid({ children, className = '' }: ProductGridProps) {
  return (
    <div
      className={`grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 ${className}`}
    >
      {children}
    </div>
  )
}
