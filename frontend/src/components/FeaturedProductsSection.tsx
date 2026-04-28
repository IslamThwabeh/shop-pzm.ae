import { Link } from 'react-router-dom'
import type { Product } from '@shared/types'
import RetailImage from './RetailImage'
import { buildProductDisplayLabel, buildProductRichDescription, getKnownProductBrand, getPrimaryProductImage } from '../utils/productPresentation'
import { getProductBrowsePath } from '../utils/productRouting'

interface FeaturedProductsSectionProps {
  title: string
  description: string
  products: Product[]
  eyebrow?: string
  animated?: boolean
  collectionHref?: string
  collectionLabel?: string
}

function getConditionLabel(product: Product) {
  return product.condition === 'used' ? 'Pre-Owned' : 'Brand New'
}

export default function FeaturedProductsSection({
  title,
  description,
  products,
  eyebrow = 'Featured devices',
  animated = false,
  collectionHref,
  collectionLabel = 'Open category',
}: FeaturedProductsSectionProps) {
  if (products.length === 0) {
    return null
  }

  const sectionClassName = animated
    ? 'reveal-on-scroll border-t border-[#eee] bg-[#fafafa] px-4 py-12 sm:px-6 lg:px-8 lg:py-14'
    : 'border-t border-[#eee] bg-[#fafafa] px-4 py-12 sm:px-6 lg:px-8 lg:py-14'
  const useAnchorNavigation = Boolean(collectionHref?.startsWith('#'))

  return (
    <section className={sectionClassName}>
      <div className="mx-auto max-w-7xl rounded-[30px] border border-[#eee] bg-white p-6 shadow-sm sm:p-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{eyebrow}</p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900 sm:text-[1.75rem]">{title}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">{description}</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const descriptionText = buildProductRichDescription(product)
            const collectionPath = collectionHref ?? getProductBrowsePath(product)
            const imageUrl = getPrimaryProductImage(product)

            return (
              <article key={product.id} className="overflow-hidden rounded-[26px] border border-[#eee] bg-white shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
                <div className="flex min-h-[184px] items-center justify-center border-b border-[#eee] bg-white px-5 py-6">
                  <RetailImage
                    src={imageUrl}
                    alt={product.model}
                    name={product.model}
                    variant="card"
                    className="max-h-[152px] w-full object-contain"
                  />
                </div>

                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    <span>{getConditionLabel(product)}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>{getKnownProductBrand(product) || 'Devices'}</span>
                  </div>

                  <h3 className="mt-3 text-lg font-bold leading-7 text-slate-950">{product.model}</h3>
                  <p className="mt-2 text-sm font-medium text-slate-500">{buildProductDisplayLabel(product)}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600 line-clamp-5 sm:min-h-[66px] sm:line-clamp-4 lg:line-clamp-none">
                    {descriptionText || `${getConditionLabel(product)} ${product.model} available from the PZM Dubai team.`}
                  </p>

                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Store price</p>
                      <p className="mt-1 text-xl font-bold text-slate-950">AED {product.price.toFixed(0)}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {useAnchorNavigation ? (
                        <a
                          href={collectionPath}
                          className="inline-flex items-center rounded-full border border-[#e5e7eb] px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
                        >
                          {collectionLabel}
                        </a>
                      ) : (
                        <Link
                          to={collectionPath}
                          className="inline-flex items-center rounded-full border border-[#e5e7eb] px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
                        >
                          {collectionLabel}
                        </Link>
                      )}
                      <Link
                        to={`/product/${product.id}`}
                        className="text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                      >
                        View details
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}