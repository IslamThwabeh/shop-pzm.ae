import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle, Home, Copy } from 'lucide-react'
import GoogleCustomerReviewsOptIn from '../components/GoogleCustomerReviewsOptIn'
import Seo from '../components/Seo'
import { siteContact } from '../content/siteData'
import { getDeliveryPolicy, getGrossVatBreakdown } from '../utils/orderPricing'

interface OrderConfirmationProps {
  orderId: string
  onContinueShopping: () => void
}

interface OrderDetails {
  orderId: string
  placedAt?: string
  items: Array<{
    id: string
    model: string
    storage: string
    color: string
    condition: string
    price: number
    quantity: number
  }>
  itemsTotal?: number
  deliveryFee?: number | null
  totalPrice?: number
  total?: number
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
  const itemsTotal = orderDetails?.itemsTotal ?? orderDetails?.total ?? 0
  const deliveryFee = orderDetails?.deliveryFee
  const totalPrice = orderDetails?.totalPrice ?? orderDetails?.total ?? 0
  const pricing = orderDetails ? getGrossVatBreakdown(itemsTotal) : null
  const deliveryPolicy = orderDetails ? getDeliveryPolicy(itemsTotal, orderDetails.customerAddress) : null
  const deliveryLabel = typeof deliveryFee === 'number'
    ? deliveryFee === 0
      ? 'Free'
      : `AED ${deliveryFee.toFixed(2)}`
    : deliveryPolicy?.statusLabel ?? 'Confirmed by location'
  const orderItems = orderDetails?.items ?? []
  const primaryOrderLabel = orderItems.length === 1 ? orderItems[0].model : 'your order'
  const deliveryStepText = typeof deliveryFee === 'number'
    ? deliveryFee === 0
      ? 'Your Dubai order qualifies for free delivery. We will confirm the timing before dispatch.'
      : `Your Dubai delivery fee is fixed at AED ${deliveryFee.toFixed(2)}. We will confirm the timing before dispatch.`
    : 'We will confirm delivery timing and any delivery fee based on your location before dispatch.'
  const paymentSummaryText = typeof deliveryFee === 'number'
    ? deliveryFee === 0
      ? `You will pay AED ${totalPrice.toFixed(2)} when the delivery person arrives. Delivery is free for this order.`
      : `You will pay AED ${totalPrice.toFixed(2)} when the delivery person arrives. This includes the AED ${deliveryFee.toFixed(2)} Dubai delivery fee.`
    : `You will pay the items total of AED ${itemsTotal.toFixed(2)}. If a delivery fee applies, we will confirm it based on your location before dispatch.`

  const orderSteps = [
    {
      title: 'Confirmation',
      description: 'A confirmation email will be sent shortly with your order details and reference number.',
    },
    {
      title: 'Preparation',
      description: `Our team will prepare ${primaryOrderLabel} and confirm dispatch timing as soon as it is ready.`,
    },
    {
      title: 'Delivery',
      description: deliveryStepText,
    },
  ]

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
    <div className="mx-auto max-w-xl px-4 py-6 sm:px-6 sm:py-8">
      {orderDetails?.customerEmail && (orderDetails.orderId || rawId) && (
        <GoogleCustomerReviewsOptIn
          orderId={orderDetails.orderId || rawId}
          email={orderDetails.customerEmail}
          address={orderDetails.customerAddress}
          placedAt={orderDetails.placedAt}
        />
      )}
      <Seo
        title="Order Confirmation | PZM Computers & Phones"
        description="Your order has been confirmed."
        canonicalPath="/order/confirmation"
        noindex={true}
      />
      <div className="rounded-[30px] border border-[#eee] bg-white p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50">
          <CheckCircle size={36} className="text-primary" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 sm:text-[2rem]">Order Confirmed!</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500 sm:text-base">
          Thank you for your purchase. Your order has been successfully placed.
        </p>

        <p className="mx-auto mt-4 max-w-md text-xs leading-5 text-slate-400">
          If enabled for this order, Google may show a short review prompt after this page finishes loading.
        </p>

        <div className="mt-6 rounded-2xl border border-[#d8ece4] bg-[#f6fcf9] p-4 sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Order ID</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <p className="text-[1.7rem] font-bold tracking-[0.04em] text-primary font-mono">{displayOrderId}</p>
            <button
              onClick={handleCopyOrderId}
              className="rounded-xl border border-primary/20 p-2 text-primary transition-colors hover:bg-primary/10"
              title="Copy order ID"
            >
              <Copy size={18} />
            </button>
          </div>
          {copied && <p className="mt-2 text-xs text-green-600">Copied to clipboard!</p>}
        </div>

        {orderDetails && orderDetails.items && orderDetails.items.length > 0 && (
          <div className="mt-5 rounded-[28px] border border-[#eee] bg-[#fafafa] p-5 text-left shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">Order Details</h2>
            {orderDetails.items.map((item, index) => (
              <div key={index} className="border-b border-[#e7e7e7] py-4 last:border-b-0 last:pb-0">
                <h3 className="text-base font-semibold text-slate-900">{item.model}</h3>
                <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div>
                    <span className="text-slate-500">Storage:</span>
                    <span className="ml-2 font-semibold text-slate-800">{item.storage}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Color:</span>
                    <span className="ml-2 font-semibold text-slate-800">{item.color}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Condition:</span>
                    <span className="ml-2 font-semibold text-slate-800">
                      {item.condition === 'new' ? '✨ Brand New' : '📱 Used'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Quantity:</span>
                    <span className="ml-2 font-semibold text-slate-800">{item.quantity}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-[#ececec] pt-3">
                  <span className="text-sm text-slate-500">Item Price</span>
                  <span className="text-base font-bold text-slate-900">AED {item.price.toFixed(2)}</span>
                </div>
                {item.quantity > 1 && (
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm text-slate-500">Subtotal ({item.quantity} items)</span>
                    <span className="text-base font-bold text-slate-900">AED {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                )}
              </div>
            ))}
            <div className="mt-4 flex items-center justify-between border-t border-[#e3e3e3] pt-4">
              <span className="text-sm text-slate-500">Delivery</span>
              <span className={`text-sm font-semibold ${deliveryPolicy?.statusToneClass ?? 'text-amber-600'}`}>{deliveryLabel}</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-[#e3e3e3] pt-4">
              <span className="text-lg font-bold text-slate-900">{deliveryPolicy?.totalLabel ?? 'Items Total'}</span>
              <span className="text-2xl font-bold text-primary">AED {totalPrice.toFixed(2)}</span>
            </div>

            <div className="mt-4 rounded-2xl border border-[#e7eef6] bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-900">Amount Breakdown</h3>
              <div className="mt-3 flex justify-between text-sm">
                <span className="text-slate-500">Items Subtotal</span>
                <span className="font-semibold text-slate-800">AED {pricing?.subtotalExVat.toFixed(2) ?? itemsTotal.toFixed(2)}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-slate-500">VAT (5%)</span>
                <span className="font-semibold text-slate-800">AED {pricing?.vatAmount.toFixed(2) ?? '0.00'}</span>
              </div>
              {typeof deliveryFee === 'number' && (
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-slate-500">Delivery Fee</span>
                  <span className="font-semibold text-slate-800">{deliveryFee === 0 ? 'Free' : `AED ${deliveryFee.toFixed(2)}`}</span>
                </div>
              )}
            </div>

            <div className={`mt-4 rounded-2xl border px-4 py-3 text-xs leading-5 ${deliveryPolicy?.qualifiesForFreeDelivery ? 'border-green-200 bg-green-50 text-green-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
              {deliveryPolicy?.detailedRule ?? 'Delivery fee will be confirmed based on location before dispatch.'}
            </div>
          </div>
        )}

        <div className="mt-5 rounded-[28px] border border-[#eee] bg-white p-5 text-left shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">What Happens Next?</h2>
          <div className="mt-4 space-y-4">
            {orderSteps.map((step, index) => (
              <div key={step.title} className="flex gap-3">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-[#d8ece4] bg-[#f6fcf9] p-4 text-left sm:p-5">
          <h3 className="text-sm font-bold text-slate-900">Cash on Delivery</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {paymentSummaryText}
          </p>
        </div>

        <div className="mt-5 rounded-2xl border border-[#eee] bg-[#fafafa] p-5 text-left sm:p-6">
          <h3 className="text-base font-bold text-slate-900">Need Help?</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            If you have any questions about your order, please contact us:
          </p>
          <div className="mt-3 space-y-1 text-sm">
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

        <button
          onClick={onContinueShopping}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brandGreenDark"
        >
          <Home size={18} />
          Continue Shopping
        </button>

        <p className="mt-6 text-xs leading-5 text-slate-400">
          A detailed order confirmation has been sent to your email address.
          Please save your order ID for reference.
        </p>
      </div>
    </div>
  )
}
