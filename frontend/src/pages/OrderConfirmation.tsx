import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle, Home, Copy } from 'lucide-react'
import Seo from '../components/Seo'
import { siteContact } from '../content/siteData'
import { getDeliveryPolicy, getGrossVatBreakdown } from '../utils/orderPricing'

interface OrderConfirmationProps {
  orderId: string
  onContinueShopping: () => void
}

interface OrderDetails {
  orderId: string
  items: Array<{
    id: string
    model: string
    storage: string
    color: string
    condition: string
    price: number
    quantity: number
  }>
  total: number
  customerName: string
  customerEmail: string
  customerAddress?: string
}

export default function OrderConfirmation({ orderId, onContinueShopping }: OrderConfirmationProps) {
  const params = useParams()
  const [copied, setCopied] = useState(false)
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)

  const rawId = orderId || params.id || ''
  // Full ID format: ord-[timestamp]-[random 6 chars]
  // Extract the random part (last segment after the final hyphen)
  const parts = rawId?.split('-')
  const randomPart = parts?.[parts.length - 1] || rawId || '000000'
  const displayOrderId = `PZM-${randomPart}`
  const pricing = orderDetails ? getGrossVatBreakdown(orderDetails.total) : null
  const deliveryPolicy = orderDetails ? getDeliveryPolicy(orderDetails.total, orderDetails.customerAddress) : null

  useEffect(() => {
    // Load order details from localStorage
    const savedDetails = localStorage.getItem('lastOrderDetails')
    if (savedDetails) {
      setOrderDetails(JSON.parse(savedDetails))
      // Clear after loading to avoid showing stale data
      localStorage.removeItem('lastOrderDetails')
    }
  }, [])

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(displayOrderId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Seo
        title="Order Confirmation | PZM Computers & Phones"
        description="Your order has been confirmed."
        canonicalPath="/order/confirmation"
        noindex={true}
      />
      <div className="bg-white rounded-lg shadow-lg p-8 text-center border border-brandBorder">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <CheckCircle size={80} className="text-primary" />
        </div>

        {/* Success Message */}
        <h1 className="text-4xl font-bold text-primary mb-2">Order Confirmed!</h1>
        <p className="text-xl text-brandTextMedium mb-8">
          Thank you for your purchase. Your order has been successfully placed.
        </p>

        {/* Order ID */}
        <div className="bg-green-50 border-2 border-primary rounded-lg p-6 mb-8">
          <p className="text-sm text-primary mb-2">Order ID</p>
          <div className="flex items-center justify-center gap-3">
            <p className="text-2xl font-bold text-primary font-mono">{displayOrderId}</p>
            <button
              onClick={handleCopyOrderId}
              className="p-2 text-primary hover:bg-primary/10 rounded transition-colors border border-primary/20"
              title="Copy order ID"
            >
              <Copy size={20} />
            </button>
          </div>
          {copied && <p className="text-sm text-green-600 mt-2">Copied to clipboard!</p>}
        </div>

        {/* Order Details */}
        {orderDetails && orderDetails.items && orderDetails.items.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left border border-brandBorder">
            <h2 className="text-lg font-bold text-primary mb-4">Order Details</h2>
            {orderDetails.items.map((item, index) => (
              <div key={index} className="mb-4 pb-4 border-b last:border-b-0">
                <h3 className="font-semibold text-brandTextDark mb-2">{item.model}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-brandTextMedium">Storage:</span>
                    <span className="ml-2 font-semibold text-brandTextDark">{item.storage}</span>
                  </div>
                  <div>
                    <span className="text-brandTextMedium">Color:</span>
                    <span className="ml-2 font-semibold text-brandTextDark">{item.color}</span>
                  </div>
                  <div>
                    <span className="text-brandTextMedium">Condition:</span>
                    <span className="ml-2 font-semibold text-brandTextDark">
                      {item.condition === 'new' ? '✨ Brand New' : '📱 Used'}
                    </span>
                  </div>
                  <div>
                    <span className="text-brandTextMedium">Quantity:</span>
                    <span className="ml-2 font-semibold text-brandTextDark">{item.quantity}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t flex justify-between items-center">
                  <span className="text-brandTextMedium">Item Price:</span>
                  <span className="text-lg font-bold text-primary">AED {item.price.toFixed(2)}</span>
                </div>
                {item.quantity > 1 && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-brandTextMedium">Subtotal ({item.quantity} items):</span>
                    <span className="text-lg font-bold text-primary">AED {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                )}
              </div>
            ))}
            <div className="mt-4 pt-4 border-t-2 border-primary flex justify-between items-center">
              <span className="text-brandTextMedium">Delivery</span>
              <span className={`text-sm font-semibold ${deliveryPolicy?.statusToneClass ?? 'text-amber-600'}`}>{deliveryPolicy?.statusLabel ?? 'Confirmed by location'}</span>
            </div>
            <div className="mt-4 pt-4 border-t-2 border-primary flex justify-between items-center">
              <span className="text-xl font-bold text-brandTextDark">{deliveryPolicy?.totalLabel ?? 'Items Total'}:</span>
              <span className="text-2xl font-bold text-primary">AED {pricing?.grossTotal.toFixed(2) ?? orderDetails.total.toFixed(2)}</span>
            </div>
            
            {/* VAT Breakdown */}
            <div className="mt-6 pt-6 border-t bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-primary mb-3 text-sm">Amount Breakdown</h3>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-brandTextMedium">Items Price</span>
                <span className="font-semibold text-brandTextDark">AED {pricing?.subtotalExVat.toFixed(2) ?? orderDetails.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-brandTextMedium">VAT (5%)</span>
                <span className="font-semibold text-brandTextDark">AED {pricing?.vatAmount.toFixed(2) ?? '0.00'}</span>
              </div>
            </div>

            <div className={`mt-4 rounded-lg border p-4 text-sm ${deliveryPolicy?.qualifiesForFreeDelivery ? 'border-green-200 bg-green-50 text-green-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
              {deliveryPolicy?.detailedRule ?? 'Delivery fee will be confirmed based on location before dispatch.'}
            </div>
          </div>
        )}

        {/* What Happens Next */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
          <h2 className="text-lg font-bold text-primary mb-4">What Happens Next?</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white font-bold">
                  1
                </div>
              </div>
              <div>
                <p className="font-semibold text-brandTextDark">Order Confirmation</p>
                <p className="text-sm text-brandTextMedium">
                  You will receive a confirmation email shortly with your order details.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white font-bold">
                  2
                </div>
              </div>
              <div>
                <p className="font-semibold text-brandTextDark">Preparation</p>
                <p className="text-sm text-brandTextMedium">
                  Our team will prepare your iPhone for delivery (usually within 24-48 hours).
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white font-bold">
                  3
                </div>
              </div>
              <div>
                <p className="font-semibold text-brandTextDark">Delivery</p>
                <p className="text-sm text-brandTextMedium">
                  {deliveryPolicy?.qualifiesForFreeDelivery
                    ? 'Your Dubai order qualifies for free delivery. We will confirm the timing before dispatch.'
                    : 'We will confirm delivery timing and any delivery fee based on your location before dispatch.'}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white font-bold">
                  4
                </div>
              </div>
              <div>
                <p className="font-semibold text-brandTextDark">Enjoy</p>
                <p className="text-sm text-brandTextMedium">
                  Unbox your new iPhone and start using it immediately!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* COD Information */}
        <div className="bg-green-50 border-2 border-primary rounded-lg p-6 mb-8">
          <h3 className="font-bold text-primary mb-2">💳 Cash on Delivery Payment</h3>
          <p className="text-sm text-brandTextMedium">
            {deliveryPolicy?.qualifiesForFreeDelivery
              ? `You will pay AED ${pricing?.grossTotal.toFixed(2) ?? orderDetails?.total.toFixed(2) ?? '0.00'} when the delivery person arrives. Delivery is free for this order.`
              : `You will pay the items total of AED ${pricing?.grossTotal.toFixed(2) ?? orderDetails?.total.toFixed(2) ?? '0.00'}. If a delivery fee applies, we will confirm it based on your location before dispatch.`}
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="font-bold text-brandTextDark mb-3">Need Help?</h3>
          <p className="text-sm text-brandTextMedium mb-2">
            If you have any questions about your order, please contact us:
          </p>
          <div className="space-y-1 text-sm">
            <p>
              <strong>WhatsApp:</strong>{' '}
              <a href={siteContact.whatsappSupportHref} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Chat with PZM on WhatsApp
              </a>
            </p>
            <p>
              <strong>Phone:</strong>{' '}
              <a href={siteContact.phoneHref} className="text-primary hover:underline">
                {siteContact.phoneDisplay}
              </a>
            </p>
          </div>
        </div>

        {/* Continue Shopping Button */}
        <button
          onClick={onContinueShopping}
          className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-lg hover:bg-brandGreenDark font-semibold transition-colors"
        >
          <Home size={20} />
          Continue Shopping
        </button>

        {/* Order Summary Note */}
        <p className="text-xs text-brandTextMedium mt-8">
          A detailed order confirmation has been sent to your email address.
          Please save your order ID for reference.
        </p>
      </div>
    </div>
  )
}
