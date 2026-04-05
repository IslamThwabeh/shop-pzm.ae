import { useState, useEffect } from 'react'
import { ArrowLeft, MessageCircle, Image } from 'lucide-react'
import type { Product } from '@shared/types'
import { apiService } from '../services/api'
import { openWhatsAppLead } from '../utils/whatsappLead'
import ImageGallery from '../components/ImageGallery'
import Seo from '../components/Seo'
import { buildSiteUrl, toAbsoluteSiteUrl } from '../utils/siteConfig'

interface ProductDetailProps {
  productId: string
  onBack: () => void
  onCheckout?: () => void
}

export default function ProductDetail({ productId, onBack }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showGallery, setShowGallery] = useState(false)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        const data = await apiService.getProduct(productId)
        if (data) {
          setProduct(data)
          setError(null)
        } else {
          setError('Product not found')
        }
      } catch (err) {
        setError('Failed to load product')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [productId])

  const handleWhatsApp = () => {
    if (product) {
      openWhatsAppLead({
        leadType: 'product',
        referenceId: product.id,
        referenceLabel: `${product.model} ${product.storage} ${product.color}`,
        referencePrice: product.price,
        sourcePage: `/product/${product.id}`,
      })
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading product...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 text-primary hover:opacity-90"
        >
          <ArrowLeft size={20} />
          Back to Products
        </button>
      </div>
    )
  }

  return (
    <div>
      <Seo
        title={`${product.model} | PZM Computers & Phones`}
        description={product.description || `Buy ${product.model} in ${product.color} with ${product.storage} storage. Cash on Delivery available in Dubai.`}
        canonicalPath={`/product/${product.id}`}
        imageUrl={product.images?.[0]}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.model,
          description: product.description || `${product.model} in ${product.color} with ${product.storage} storage.`,
          sku: product.id,
          brand: {
            '@type': 'Brand',
            name: 'Apple',
          },
          offers: {
            '@type': 'Offer',
            url: buildSiteUrl(`/product/${product.id}`),
            priceCurrency: 'AED',
            price: product.price,
            availability: product.quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            itemCondition: product.condition === 'new' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
          },
          image: (product.images || []).map((image) => toAbsoluteSiteUrl(image)),
        }}
      />
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-primary hover:opacity-90 mb-6"
      >
        <ArrowLeft size={20} />
        Back to Products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-lg shadow p-8">
        {/* Product Image */}
        <div className="flex flex-col gap-4">
          {product.images && product.images.length > 0 ? (
            <>
              <ImageGallery 
                images={product.images} 
                productName={product.model}
              />
              {product.images.length > 1 && (
                <button
                  onClick={() => setShowGallery(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-primary text-white rounded-lg hover:bg-brandGreenDark transition-colors text-sm font-medium"
                >
                  <Image size={18} />
                  View All Images
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center bg-green-50 rounded-lg h-96">
              <div className="text-center">
                <p className="text-gray-500">No image available</p>
              </div>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-primary mb-2">{product.model}</h1>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                product.condition === 'new'
                  ? 'bg-green-100 text-primary'
                  : 'bg-green-100 text-primary'
              }`}>
                {product.condition === 'new' ? '✨ Brand New' : '📱 Used'}
              </span>
              <span className="text-brandTextMedium">{product.color}</span>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-primary mb-3">Specifications</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-brandTextMedium">Storage:</span>
                <span className="font-semibold text-brandTextDark">{product.storage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brandTextMedium">Condition:</span>
                <span className="font-semibold text-brandTextDark capitalize">{product.condition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brandTextMedium">Color:</span>
                <span className="font-semibold text-brandTextDark">{product.color}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brandTextMedium">Stock:</span>
                <span className={`font-semibold ${product.quantity > 0 ? 'text-brandGreenDark' : 'text-brandRed'}`}>
                  {product.quantity > 0 ? `${product.quantity} available` : 'Out of stock'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-primary mb-2">Description</h3>
              <p className="text-brandTextMedium">{product.description}</p>
            </div>
          )}

          {/* Price */}
          <div className="mb-6">
            <p className="text-brandTextMedium">Price</p>
            <p className="text-3xl font-bold text-primary">AED {product.price.toFixed(2)}</p>
          </div>

          {/* WhatsApp Button */}
          <button
            onClick={handleWhatsApp}
            disabled={product.quantity === 0}
            className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
              product.quantity === 0
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-[#25D366] text-white hover:bg-[#1da851]'
            }`}
          >
            <MessageCircle size={20} />
            {product.quantity === 0 ? 'Out of Stock' : 'Order via WhatsApp'}
          </button>

          {/* COD Info */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-primary">
            <p className="text-sm text-primary font-semibold">
              ✓ Cash on Delivery Available - Pay when you receive your order
            </p>
          </div>
        </div>
      </div>

      {/* Image Gallery Modal */}
      {showGallery && product && product.images && (
        <ImageGallery
          images={product.images}
          productName={product.model}
          isModal={true}
          onClose={() => setShowGallery(false)}
        />
      )}

    </div>
  )
}
