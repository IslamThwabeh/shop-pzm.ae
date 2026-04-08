import { useState } from 'react'
import { MessageCircle, ShoppingCart } from 'lucide-react'
import type { Product } from '@shared/types'
import { groupVariantsByColorAndStorage, getPrimaryProductImage, isPlaceholderColor } from '../utils/productPresentation'
import RetailImage from './RetailImage'
import { openWhatsAppLead } from '../utils/whatsappLead'
import { useCart } from '../context/CartContext'

interface Props {
  /** Display title for this model group (e.g. "MacBook Air M3") */
  title: string
  /** All product variants that belong to this model group */
  products: Product[]
  /** Condition badge label — defaults to first product's condition */
  condition?: 'new' | 'used'
}

export default function VariantCard({ title, products, condition }: Props) {
  const group = groupVariantsByColorAndStorage(products)
  const { addItem } = useCart()
  const realColors = group.colors.filter((c) => !isPlaceholderColor(c))
  const [selectedColor, setSelectedColor] = useState(realColors[0] ?? group.colors[0] ?? '')
  const [selectedStorage, setSelectedStorage] = useState(group.storages[0] ?? '')

  const activeProduct = group.getProduct(selectedColor, selectedStorage)
  const displayImage = getPrimaryProductImage(activeProduct) || getPrimaryProductImage(products[0])
  const badgeCondition = condition ?? products[0]?.condition ?? 'new'

  const handleWhatsApp = () => {
    const label = `${title} ${selectedStorage} ${selectedColor}`.trim()
    openWhatsAppLead({
      leadType: 'product',
      referenceId: activeProduct?.id,
      referenceLabel: label,
      referencePrice: activeProduct?.price,
      sourcePage: window.location.pathname,
    })
  }

  return (
    <article className="flex flex-col rounded-2xl border border-[#eee] bg-white">
      {/* Image */}
      <div className="product-image-frame relative h-[140px] sm:h-[150px] lg:h-[160px] overflow-hidden rounded-t-2xl border-b border-[#eee]">
        <RetailImage src={displayImage} alt={title} name={title} variant="card" />
        <span className={`absolute left-2.5 top-2.5 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
          badgeCondition === 'new'
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-amber-50 text-amber-700'
        }`}>
          {badgeCondition === 'new' ? 'New' : 'Used'}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3">
        {/* Title + price */}
        <div>
          <h3 className="text-sm font-semibold leading-snug text-slate-900 line-clamp-2">{title}</h3>
          <p className="mt-0.5 text-lg font-bold text-slate-900">
            {activeProduct ? `AED ${activeProduct.price.toFixed(0)}` : `From AED ${group.lowestPrice.toFixed(0)}`}
          </p>
        </div>

        {/* Color swatches */}
        {group.colors.filter((c) => !isPlaceholderColor(c)).length > 0 && (
          <div>
            <p className="mb-1.5 text-[11px] font-medium text-slate-400">Color</p>
            <div className="flex flex-wrap gap-1.5">
              {group.colors.filter((c) => !isPlaceholderColor(c)).map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors ${
                    color === selectedColor
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-[#eee] text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Storage pills */}
        {group.storages.length > 0 && (
          <div>
            <p className="mb-1.5 text-[11px] font-medium text-slate-400">Storage</p>
            <div className="flex flex-wrap gap-1.5">
              {group.storages.map((storage) => (
                <button
                  key={storage}
                  type="button"
                  onClick={() => setSelectedStorage(storage)}
                  className={`rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors ${
                    storage === selectedStorage
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-[#eee] text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {storage}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Availability hint */}
        {!activeProduct && selectedColor && selectedStorage && (
          <p className="text-[11px] text-amber-600">This combo isn't listed — ask us</p>
        )}

        {/* CTA */}
        <div style={{ marginTop: 'auto' }} className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleWhatsApp}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#eee] py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-[#25D366] hover:text-[#25D366]"
          >
            <MessageCircle size={15} className="text-[#25D366]" />
            Order via WhatsApp
          </button>
          {activeProduct && (activeProduct.quantity ?? 0) > 0 && (
            <button
              type="button"
              onClick={() => {
                addItem({
                  id: activeProduct.id,
                  model: title,
                  price: activeProduct.price,
                  quantity: 1,
                  color: selectedColor,
                  storage: selectedStorage,
                  condition: activeProduct.condition,
                })
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2 text-sm font-semibold text-white transition-colors hover:bg-brandGreenDark"
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
