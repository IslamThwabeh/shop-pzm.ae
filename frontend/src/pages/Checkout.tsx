import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useCart } from '../context/CartContext'

interface CheckoutProps {
  onBack: () => void
  onSuccess: (orderId: string) => void
}

export default function Checkout({ onBack, onSuccess }: CheckoutProps) {
  const { items, total, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    notes: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.customerName.trim()) return 'Name is required'
    if (!formData.customerEmail.trim()) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) return 'Invalid email format'
    if (!formData.customerPhone.trim()) return 'Phone is required'
    if (!/^\+?[\d\s\-()]{7,}$/.test(formData.customerPhone)) return 'Invalid phone format'
    if (!formData.customerAddress.trim()) return 'Address is required'
    if (!/dubai/i.test(formData.customerAddress)) return 'We currently only deliver to Dubai. Please enter a Dubai address.'
    if (items.length === 0) return 'Cart is empty'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Prepare items array for backend
      const orderItems = items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
      }))

      const response = await fetch('https://test.pzm.ae/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          customer_phone: formData.customerPhone,
          customer_address: formData.customerAddress,
          items: orderItems, // Send all items
          total_price: total,
          notes: formData.notes,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create order')
      }

      const data = await response.json()
      const orderId = data.data?.id || data.id

      // Save order details to localStorage for confirmation page
      localStorage.setItem('lastOrderDetails', JSON.stringify({
        orderId,
        items,
        total,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
      }))

      clearCart()
      onSuccess(orderId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-600 mb-6">Your cart is empty</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-brandGreenDark transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Cart
        </button>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-primary hover:opacity-90 mb-6"
      >
        <ArrowLeft size={20} />
        Back to Cart
      </button>

      <h1 className="text-3xl font-bold mb-8 text-primary">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 border border-brandBorder">
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <h2 className="text-2xl font-bold text-primary mb-6">Delivery Information</h2>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2 border border-brandBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-brandTextDark placeholder-brandTextMedium"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-brandBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-brandTextDark placeholder-brandTextMedium"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  placeholder="+971 50 123 4567"
                  className="w-full px-4 py-2 border border-brandBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-brandTextDark placeholder-brandTextMedium"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Delivery Address (Dubai) *
                </label>
                <textarea
                  name="customerAddress"
                  value={formData.customerAddress}
                  onChange={handleChange}
                  placeholder="Enter your full delivery address in Dubai"
                  rows={3}
                  className="w-full px-4 py-2 border border-brandBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-brandTextDark placeholder-brandTextMedium"
                  required
                />
                <p className="text-xs text-orange-600 mt-2">⚠️ We currently only deliver within Dubai</p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Order Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any special instructions or notes"
                  rows={2}
                  className="w-full px-4 py-2 border border-brandBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-brandTextDark placeholder-brandTextMedium"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="mt-8 pt-8 border-t">
              <h2 className="text-2xl font-bold text-primary mb-6">Payment Method</h2>
              <div className="p-4 bg-green-50 border-2 border-primary rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      defaultChecked
                      className="w-4 h-4"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-primary">Cash on Delivery (COD)</p>
                    <p className="text-sm text-brandTextMedium mt-1">
                      Pay when you receive your order. No advance payment required.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full py-3 bg-primary text-white rounded-lg hover:bg-brandGreenDark disabled:bg-gray-300 disabled:text-gray-600 font-semibold transition-colors"
            >
              {loading ? 'Processing...' : 'Place Order (Cash on Delivery)'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-lg shadow p-6 border border-brandBorder sticky top-20">
            <h2 className="text-xl font-bold text-primary mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6 pb-6 border-b">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-brandTextMedium">
                    {item.model} x {item.quantity}
                  </span>
                  <span className="font-semibold text-brandTextDark">AED {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-6 pb-6 border-b">
              <div className="flex justify-between text-brandTextMedium">
                <span>Subtotal</span>
                <span>AED {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-brandTextMedium">
                <span>Shipping</span>
                <span className="text-primary font-semibold">Free</span>
              </div>
            </div>

            {/* VAT Breakdown */}
            <div className="space-y-2 mb-6 pb-6 border-b bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-primary mb-3 text-sm">Amount Breakdown</h3>
              <div className="flex justify-between text-sm">
                <span className="text-brandTextMedium">Mobile Price (95%)</span>
                <span className="font-semibold text-brandTextDark">AED {(total * 0.95).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-brandTextMedium">VAT (5%)</span>
                <span className="font-semibold text-brandTextDark">AED {(total * 0.05).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-brandTextDark">Total</span>
              <span className="text-3xl font-bold text-primary">AED {total.toFixed(2)}</span>
            </div>

            <div className="mt-6 p-3 bg-green-50 rounded border border-primary">
              <p className="text-xs text-primary font-semibold">
                ✓ Secure Checkout - Your information is safe with us
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
