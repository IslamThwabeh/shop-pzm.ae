import { MessageCircle } from 'lucide-react'
import type { Product } from '@shared/types'
import { getPrimaryProductImage } from '../utils/productPresentation'
import RetailImage from './RetailImage'
import { openWhatsAppLead } from '../utils/whatsappLead'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const handleWhatsApp = () => {
    openWhatsAppLead({
      leadType: 'product',
      referenceId: product.id,
      referenceLabel: `${product.model} ${product.storage} ${product.color}`,
      referencePrice: product.price,
      sourcePage: window.location.pathname,
    })
  }

  return (
    <article className="overflow-hidden rounded-[24px] border border-brandBorder bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="retail-card-media retail-card-media--contain border-b border-brandBorder bg-white">
        <RetailImage
          src={getPrimaryProductImage(product)}
          alt={`${product.model} ${product.storage} ${product.color}`.trim()}
          name={product.model}
          variant="card"
        />
      </div>

      <div className="p-5 md:p-6">
        <h3 className="text-lg font-semibold leading-tight text-brandTextDark md:text-xl">{product.model}</h3>

        <div className="flex justify-between items-start mt-2">
          <div>
            <p className="text-sm text-brandTextMedium leading-relaxed">
              {product.storage} • {product.condition === 'new' ? '✨ Brand New' : '📱 Used'}
            </p>
            <p className="text-sm text-brandTextMedium">{product.color}</p>
          </div>
          <span className="px-2 py-1 bg-green-100 text-primary text-xs font-semibold rounded">
            {product.condition === 'new' ? 'New' : 'Used'}
          </span>
        </div>

        <p className="mt-4 text-2xl font-bold leading-tight text-primary md:text-[1.75rem]">AED {product.price.toFixed(2)}</p>

        <div className="mt-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-primary text-xs font-semibold">
            Cash on Delivery
          </span>
        </div>

        {product.description && (
          <p className="text-sm text-brandTextMedium mt-3 line-clamp-2 leading-relaxed">{product.description}</p>
        )}

        <button
          type="button"
          onClick={handleWhatsApp}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md border border-brandBorder px-4 py-3 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary"
        >
          <MessageCircle size={16} className="text-[#25D366]" />
          Contact us
        </button>

        <p className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-brandTextMedium">
          Message the team for price, color, and device details.
        </p>
      </div>
    </article>
  )
}
