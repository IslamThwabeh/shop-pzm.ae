import { useEffect, useRef } from 'react'
import { MessageCircle, X, Truck, ShieldCheck, Banknote } from 'lucide-react'
import type { Product } from '@shared/types'
import RetailImage from './RetailImage'
import { buildProductDisplayLabel, getPrimaryProductImage, getProductDetailRows } from '../utils/productPresentation'
import { openWhatsAppLead } from '../utils/whatsappLead'

interface ProductDetailDrawerProps {
  product: Product | null
  onClose: () => void
}

export default function ProductDetailDrawer({ product, onClose }: ProductDetailDrawerProps) {
  const backdropRef = useRef<HTMLDivElement>(null)

  // Lock body scroll when open
  useEffect(() => {
    if (!product) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [product])

  // Close on Escape
  useEffect(() => {
    if (!product) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [product, onClose])

  if (!product) return null

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose()
  }

  const handleWhatsApp = () => {
    openWhatsAppLead({
      leadType: 'product',
      referenceId: product.id,
      referenceLabel: buildProductDisplayLabel(product),
      referencePrice: product.price,
      sourcePage: window.location.pathname,
    })
  }

  const specs = [
    product.condition && {
      label: 'Condition',
      value: product.condition === 'new' ? 'Brand New' : 'Certified Used',
    },
    ...getProductDetailRows(product),
  ].filter(Boolean) as { label: string; value: string }[]
  const warrantyLabel = product.warranty || (product.condition === 'new' ? 'Official Warranty' : 'Inspected & Tested')

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 backdrop-blur-[2px] transition-opacity duration-200 sm:items-center sm:justify-end"
    >
      {/* Drawer panel */}
      <div className="relative flex w-full max-h-[92vh] flex-col overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-md sm:rounded-2xl sm:m-4 animate-slide-up sm:animate-slide-in">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur text-slate-400 transition-colors hover:text-slate-700"
          aria-label="Close details"
        >
          <X size={18} />
        </button>

        {/* Image */}
        <div className="product-image-frame mx-4 mt-4 aspect-square max-h-[320px]">
          <RetailImage
            src={getPrimaryProductImage(product)}
            alt={buildProductDisplayLabel(product)}
            name={product.model}
            variant="panel"
            loading="eager"
          />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-5">
          {/* Title */}
          <h2 className="text-xl font-bold text-slate-900">{product.model}</h2>

          {/* Price */}
          <p className="mt-2 text-2xl font-bold text-slate-900">
            AED {product.price.toFixed(0)}
          </p>

          {/* Specs */}
          {specs.length > 0 && (
            <div className="mt-4 space-y-2">
              {specs.map((s) => (
                <div key={s.label} className="flex items-center justify-between border-b border-[#eee] pb-2 text-sm">
                  <span className="text-slate-500">{s.label}</span>
                  <span className="font-medium text-slate-800">{s.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          {product.description && (
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              {product.description}
            </p>
          )}

          {/* Badges */}
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              <Banknote size={14} />
              Cash on Delivery
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              <Truck size={14} />
              Fast Delivery
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              <ShieldCheck size={14} />
              {warrantyLabel}
            </span>
          </div>

          {/* WhatsApp CTA */}
          <button
            type="button"
            onClick={handleWhatsApp}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <MessageCircle size={18} />
            Inquire on WhatsApp
          </button>
        </div>
      </div>
    </div>
  )
}
