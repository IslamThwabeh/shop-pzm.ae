import { useState } from 'react'
import { CheckCircle, Home, Copy } from 'lucide-react'

interface OrderConfirmationProps {
  orderId: string
  onContinueShopping: () => void
}

export default function OrderConfirmation({ orderId, onContinueShopping }: OrderConfirmationProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <CheckCircle size={80} className="text-green-500" />
        </div>

        {/* Success Message */}
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-xl text-gray-600 mb-8">
          Thank you for your purchase. Your order has been successfully placed.
        </p>

        {/* Order ID */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
          <p className="text-sm text-gray-600 mb-2">Order ID</p>
          <div className="flex items-center justify-center gap-3">
            <p className="text-2xl font-bold text-blue-600 font-mono">{orderId}</p>
            <button
              onClick={handleCopyOrderId}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
              title="Copy order ID"
            >
              <Copy size={20} />
            </button>
          </div>
          {copied && <p className="text-sm text-green-600 mt-2">Copied to clipboard!</p>}
        </div>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
          <h2 className="text-lg font-bold text-gray-900 mb-4">What Happens Next?</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-bold">
                  1
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Order Confirmation</p>
                <p className="text-sm text-gray-600">
                  You will receive a confirmation email shortly with your order details.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-bold">
                  2
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Preparation</p>
                <p className="text-sm text-gray-600">
                  Our team will prepare your iPhone for delivery (usually within 24-48 hours).
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-bold">
                  3
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Delivery</p>
                <p className="text-sm text-gray-600">
                  Your order will be delivered to your address. You can pay via cash on delivery.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-bold">
                  4
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Enjoy</p>
                <p className="text-sm text-gray-600">
                  Unbox your new iPhone and start using it immediately!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* COD Information */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-8">
          <h3 className="font-bold text-green-900 mb-2">💳 Cash on Delivery Payment</h3>
          <p className="text-sm text-green-800">
            You will pay the full amount when the delivery person arrives at your address.
            Please have the exact amount ready for a smooth transaction.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="font-bold text-gray-900 mb-3">Need Help?</h3>
          <p className="text-sm text-gray-600 mb-2">
            If you have any questions about your order, please contact us:
          </p>
          <div className="space-y-1 text-sm">
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:support@pzm.ae" className="text-blue-600 hover:underline">
                support@pzm.ae
              </a>
            </p>
            <p>
              <strong>Phone:</strong>{' '}
              <a href="tel:+971501234567" className="text-blue-600 hover:underline">
                +971 50 123 4567
              </a>
            </p>
          </div>
        </div>

        {/* Continue Shopping Button */}
        <button
          onClick={onContinueShopping}
          className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
        >
          <Home size={20} />
          Continue Shopping
        </button>

        {/* Order Summary Note */}
        <p className="text-xs text-gray-500 mt-8">
          A detailed order confirmation has been sent to your email address.
          Please save your order ID for reference.
        </p>
      </div>
    </div>
  )
}
