import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, ShoppingCart } from 'lucide-react'
import type { Product } from '@shared/types'
import type { BuyIphoneFamily } from '../content/buyIphoneCatalog'
import { groupVariantsByColorAndStorage, getPrimaryProductImage, isPlaceholderColor } from '../utils/productPresentation'
import RetailImage from './RetailImage'
import { openWhatsAppLead } from '../utils/whatsappLead'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'
import { triggerCartAddFeedback } from '../utils/cartFeedback'

interface Props {
  family: BuyIphoneFamily
  products: Product[]
  id?: string
  highlighted?: boolean
}

export default function IphoneFamilyCard({ family, products, id, highlighted = false }: Props) {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'
  const group = groupVariantsByColorAndStorage(products)
  const { addItem } = useCart()
  const realColors = group.colors.filter((c) => !isPlaceholderColor(c))
  const [selectedColor, setSelectedColor] = useState(realColors[0] ?? group.colors[0] ?? '')
  const [selectedStorage, setSelectedStorage] = useState(group.storages[0] ?? '')

  const activeProduct = group.getProduct(selectedColor, selectedStorage)
  const displayImage = getPrimaryProductImage(activeProduct) || family.imageUrl

  const handleWhatsApp = () => {
    const label = `${family.title} ${selectedStorage} ${selectedColor}`.trim()
    openWhatsAppLead({
      leadType: 'product',
      referenceId: activeProduct?.id,
      referenceLabel: label,
      referencePrice: activeProduct?.price,
      sourcePage: window.location.pathname,
    })
  }

  const handleAddToCart = (sourceElement: HTMLButtonElement) => {
    if (!activeProduct || (activeProduct.quantity ?? 0) <= 0) {
      return
    }

    addItem({
      id: activeProduct.id,
      model: family.title,
      price: activeProduct.price,
      quantity: 1,
      color: selectedColor,
      storage: selectedStorage,
      condition: activeProduct.condition,
    })

    triggerCartAddFeedback(sourceElement)
  }

  if (products.length === 0) {
    return (
      <article id={id} className={`rounded-2xl border bg-white p-5 transition-shadow ${highlighted ? 'border-primary ring-2 ring-primary/30 shadow-md' : 'border-[#eee]'}`}>
        <div className="h-[140px] overflow-hidden rounded-xl bg-slate-50">
          <RetailImage src={family.imageUrl} alt={family.imageAlt} name={family.title} variant="card" />
        </div>
        <h3 className="mt-3 text-base font-bold text-slate-900">{family.title}</h3>
        <p className="mt-1 text-xs text-slate-400">{family.description}</p>
        <span className="mt-3 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
          {isAr ? 'اسألنا عن التوفر' : 'Ask us for availability'}
        </span>
      </article>
    )
  }

  return (
    <article id={id} data-cart-feedback-root className={`flex flex-col rounded-2xl border bg-white transition-shadow ${highlighted ? 'border-primary ring-2 ring-primary/30 shadow-md' : 'border-[#eee]'}`}>
      {/* Image */}
      <div className="relative h-[200px] sm:h-[210px] overflow-hidden rounded-t-2xl border-b border-[#eee] bg-white">
        <div data-cart-feedback-image className="flex h-full w-full items-center justify-center p-4">
          <RetailImage src={displayImage} alt={family.imageAlt} name={family.title} variant="card" className="max-h-full w-full object-contain" />
        </div>
        <span className="absolute left-2.5 top-2.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
          {isAr ? 'جديد' : 'New'}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Title + price */}
        <div>
          <h3 className="text-sm font-bold text-slate-900">{family.title}</h3>
          <p className="mt-0.5 text-lg font-bold text-slate-900">
            {activeProduct ? `AED ${activeProduct.price.toFixed(0)}` : `From AED ${group.lowestPrice.toFixed(0)}`}
          </p>
        </div>

        {/* Color swatches */}
        {realColors.length > 0 && (
          <div>
            <p className="mb-1.5 text-[11px] font-medium text-slate-400">{isAr ? 'اللون' : 'Color'}</p>
            <div className="flex flex-wrap gap-1.5">
              {realColors.map((color) => (
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
            <p className="mb-1.5 text-[11px] font-medium text-slate-400">{isAr ? 'السعة' : 'Storage'}</p>
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
          <p className="text-[11px] text-amber-600">{isAr ? 'هذه التركيبة غير معروضة حالياً، راسلنا مباشرة' : "This combo isn't listed — ask us"}</p>
        )}

        {/* CTA */}
        <div className="mt-auto flex flex-col gap-2">
          <button
            type="button"
            onClick={handleWhatsApp}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#eee] py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-[#25D366] hover:text-[#25D366]"
          >
            <MessageCircle size={15} className="text-[#25D366]" />
            {isAr ? 'اطلب عبر واتساب' : 'Order via WhatsApp'}
          </button>
          {activeProduct && (activeProduct.quantity ?? 0) > 0 && (
            <button
              type="button"
              onClick={(event) => handleAddToCart(event.currentTarget)}
              className="cart-add-button inline-flex w-full items-center justify-center rounded-xl bg-primary py-2 text-sm font-semibold text-white transition-colors hover:bg-brandGreenDark"
            >
              <span className="cart-add-button__content">
                <ShoppingCart size={15} />
                {isAr ? 'أضف إلى السلة' : 'Add to Cart'}
              </span>
            </button>
          )}
        </div>

        {/* SEO-visible link to product detail page */}
        {products[0] && (
          <div className="border-t border-[#eee] pt-2 text-end">
            <Link
              to={`/product/${activeProduct?.id ?? products[0].id}`}
              className="text-[11px] text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
            >
              {isAr ? 'عرض التفاصيل' : 'View details'}
            </Link>
          </div>
        )}
      </div>
    </article>
  )
}
