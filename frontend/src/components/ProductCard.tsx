import { Eye, MessageCircle, ShoppingCart } from 'lucide-react'
import type { Product } from '@shared/types'
import { getPrimaryProductImage } from '../utils/productPresentation'
import RetailImage from './RetailImage'
import { openWhatsAppLead } from '../utils/whatsappLead'
import { useCart } from '../context/CartContext'

interface Props {
  product: Product
  onViewDetails?: (product: Product) => void
}

export default function ProductCard({ product, onViewDetails }: Props) {
  const { addItem } = useCart()
  const inStock = (product.quantity ?? 0) > 0

  const handleAddToCart = () => {
    if (!inStock) return
    addItem({
      id: product.id,
      model: product.model,
      price: product.price,
      quantity: 1,
      color: product.color,
      storage: product.storage,
      condition: product.condition,
    })
  }

  const handleWhatsApp = () => {
    openWhatsAppLead({
      leadType: 'product',
      referenceId: product.id,
      referenceLabel: `${product.model} ${product.storage} ${product.color}`.trim(),
      referencePrice: product.price,
      sourcePage: window.location.pathname,
    })
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#eee] bg-white transition-shadow hover:shadow-md">
      {/* Image frame */}
      <div className="product-image-frame relative h-[140px] sm:h-[150px] lg:h-[160px] border-b border-[#eee]">
        <RetailImage
          src={getPrimaryProductImage(product)}
          alt={`${product.model} ${product.storage} ${product.color}`.trim()}
          name={product.model}
          variant="card"
        />

        {/* Eye icon — show on hover / always on touch */}
        {onViewDetails && (
          <button
            type="button"
            onClick={() => onViewDetails(product)}
            className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-400 shadow-sm backdrop-blur transition-all hover:text-slate-700 sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="View details"
          >
            <Eye size={16} />
          </button>
        )}

        {/* Condition badge */}
        <span className={`absolute left-2.5 top-2.5 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
          product.condition === 'new'
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-amber-50 text-amber-700'
        }`}>
          {product.condition === 'new' ? 'New' : 'Used'}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3">
        <h3 className="text-sm font-semibold leading-snug text-slate-900 line-clamp-2">
          {product.model}
        </h3>

        {product.storage && (
          <p className="mt-1 text-xs text-slate-400">{product.storage}</p>
        )}

        <p className="mt-auto pt-3 text-lg font-bold text-slate-900">
          AED {product.price.toFixed(0)}
        </p>

        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleWhatsApp}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#eee] py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-[#25D366] hover:text-[#25D366]"
          >
            <MessageCircle size={15} className="text-[#25D366]" />
            Order via WhatsApp
          </button>
          {inStock && (
            <button
              type="button"
              onClick={handleAddToCart}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brandGreenDark"
            >
              <ShoppingCart size={15} />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
