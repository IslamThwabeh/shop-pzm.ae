import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MessageCircle, ShoppingCart, ShieldCheck, Truck, CreditCard } from 'lucide-react'
import type { Product } from '@shared/types'
import { useCart } from '../context/CartContext'
import { getPrimaryProductImage } from '../utils/productPresentation'
import { getProductBrowsePath } from '../utils/productRouting'
import { openWhatsAppLead } from '../utils/whatsappLead'
import { toAbsoluteSiteUrl } from '../utils/siteConfig'
import RetailImage from '../components/RetailImage'
import Seo from '../components/Seo'

interface ProductDetailsProps {
  products: Product[]
}

export default function ProductDetails({ products }: ProductDetailsProps) {
  const { id } = useParams<{ id: string }>()
  const { addItem } = useCart()

  const product = useMemo(
    () => products.find((p) => p.id === id),
    [products, id],
  )

  if (!product) {
    return (
      <div className="rounded-[28px] border border-brandBorder bg-white px-6 py-10 text-center shadow-sm md:px-8">
        <Seo
          title="Product Not Found | PZM"
          description="This product could not be found."
          canonicalPath={`/product/${id ?? ''}`}
          noindex
        />
        <h1 className="text-2xl font-bold text-slate-950">Product not found</h1>
        <p className="mt-3 text-brandTextMedium">
          This product may have been removed or is temporarily unavailable.
        </p>
        <Link
          to="/services/brand-new"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-brandGreenDark transition-colors"
        >
          <ArrowLeft size={16} />
          Browse Products
        </Link>
      </div>
    )
  }

  const image = getPrimaryProductImage(product)
  const inStock = (product.quantity ?? 0) > 0
  const browsePath = getProductBrowsePath(product)
  const label = `${product.model} ${product.storage ?? ''} ${product.color ?? ''}`.trim()

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
      referenceLabel: label,
      referencePrice: product.price,
      sourcePage: window.location.pathname,
    })
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: label,
    description: product.description || `${label} available at PZM Computers & Phones in Dubai.`,
    image: image ? [toAbsoluteSiteUrl(image)] : [],
    sku: product.id,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'AED',
      price: product.price,
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition:
        product.condition === 'new'
          ? 'https://schema.org/NewCondition'
          : 'https://schema.org/UsedCondition',
    },
  }

  return (
    <div className="space-y-8">
      <Seo
        title={`${label} | PZM Computers & Phones`}
        description={product.description || `Buy ${label} in Dubai with Cash on Delivery from PZM.`}
        canonicalPath={`/product/${product.id}`}
        imageUrl={image}
        jsonLd={jsonLd}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-brandTextMedium">
        <Link to={browsePath} className="font-semibold text-primary hover:underline flex items-center gap-1">
          <ArrowLeft size={14} />
          Back to catalog
        </Link>
      </nav>

      {/* Product card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 rounded-[28px] border border-brandBorder bg-white p-6 shadow-sm md:p-8">
        {/* Image */}
        <div className="flex items-center justify-center rounded-2xl border border-[#eee] bg-slate-50 p-6 min-h-[280px]">
          <RetailImage src={image} alt={label} name={label} variant="panel" />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div>
            <span className={`inline-block rounded-md px-2.5 py-0.5 text-xs font-semibold ${
              product.condition === 'new'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-amber-50 text-amber-700'
            }`}>
              {product.condition === 'new' ? 'Brand New' : 'Used'}
            </span>
            <h1 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">{product.model}</h1>
            {product.description && (
              <p className="mt-2 text-sm leading-relaxed text-brandTextMedium">{product.description}</p>
            )}
          </div>

          {/* Specs */}
          <div className="flex flex-wrap gap-2">
            {product.storage && (
              <span className="rounded-full border border-[#eee] bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                {product.storage}
              </span>
            )}
            {product.color && (
              <span className="rounded-full border border-[#eee] bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                {product.color}
              </span>
            )}
          </div>

          {/* Price */}
          <div>
            <p className="text-3xl font-bold text-slate-900">AED {product.price.toFixed(0)}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-brandTextMedium">
              {inStock ? `${product.quantity} in stock` : 'Out of stock'} · Cash on Delivery
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleWhatsApp}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#eee] px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-[#25D366] hover:text-[#25D366]"
            >
              <MessageCircle size={16} className="text-[#25D366]" />
              Order via WhatsApp
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!inStock}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors ${
                inStock
                  ? 'bg-primary text-white hover:bg-brandGreenDark'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCart size={16} />
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>

          {/* Trust signals */}
          <div className="grid grid-cols-3 gap-3 border-t border-[#eee] pt-5">
            <div className="text-center">
              <Truck size={18} className="mx-auto text-primary" />
              <p className="mt-1.5 text-[11px] font-medium text-slate-500">Free Delivery</p>
            </div>
            <div className="text-center">
              <ShieldCheck size={18} className="mx-auto text-primary" />
              <p className="mt-1.5 text-[11px] font-medium text-slate-500">Warranty</p>
            </div>
            <div className="text-center">
              <CreditCard size={18} className="mx-auto text-primary" />
              <p className="mt-1.5 text-[11px] font-medium text-slate-500">COD Available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
