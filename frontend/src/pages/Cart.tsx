import { Trash2, ArrowLeft } from 'lucide-react'
import { useCart } from '../context/CartContext'

interface CartProps {
  onContinueShopping: () => void
  onCheckout: () => void
}

export default function Cart({ onContinueShopping, onCheckout }: CartProps) {
  const { items, removeItem, updateQuantity, total } = useCart()

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-600 mb-6">Your cart is empty</p>
        <button
          onClick={onContinueShopping}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-brandGreenDark"
        >
          <ArrowLeft size={20} />
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {items.map((item) => (
              <div
                key={item.id}
                className="border-b last:border-b-0 p-6 flex justify-between items-start hover:bg-gray-50"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.model}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {item.storage} • {item.color}
                  </p>
                  <p className="text-lg font-bold text-primary mt-2">AED {item.price.toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 font-bold text-lg"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-gray-900 font-semibold"
                    />
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 font-bold text-lg"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right min-w-[100px]">
                    <p className="text-sm text-gray-600">Subtotal</p>
                    <p className="text-lg font-semibold">AED {(item.price * item.quantity).toFixed(2)}</p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onContinueShopping}
            className="mt-4 inline-flex items-center gap-2 text-primary hover:opacity-90"
          >
            <ArrowLeft size={20} />
            Continue Shopping
          </button>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-lg shadow p-6 sticky top-20">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6 pb-6 border-b">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>AED {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>AED 0.00</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold">Total</span>
              <span className="text-3xl font-bold text-primary">AED {total.toFixed(2)}</span>
            </div>

            <button
              onClick={onCheckout}
              className="w-full py-3 bg-primary text-white rounded-lg hover:bg-brandGreenDark font-semibold transition-colors"
            >
              Proceed to Checkout
            </button>

            <div className="mt-4 p-3 bg-green-50 rounded border border-primary">
              <p className="text-xs text-primary font-semibold">
                <strong>✓ Cash on Delivery</strong> - Pay when you receive your order
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
