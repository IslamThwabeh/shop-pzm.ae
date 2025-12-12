import { ShoppingCart, LogOut } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

interface HeaderProps {
  onNavigate: (page: any) => void
  currentPage?: string
}

export default function Header({ onNavigate, currentPage }: HeaderProps) {
  const { items } = useCart()
  const { isAuthenticated, logout } = useAuth()

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className="text-2xl font-bold text-blue-600 hover:text-blue-700"
            >
              PZM iPhone Store
            </button>
          </div>

          <div className="flex items-center gap-4">
            {currentPage !== 'admin' && currentPage !== 'admin-login' && (
              <button
                onClick={() => onNavigate({ type: 'admin-login' })}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700"
              >
                Admin
              </button>
            )}

            <button
              onClick={() => onNavigate({ type: 'cart' })}
              className="relative p-2 text-gray-600 hover:text-gray-900"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {isAuthenticated && (
              <button
                onClick={() => {
                  logout()
                  onNavigate({ type: 'home' })
                }}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut size={24} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
