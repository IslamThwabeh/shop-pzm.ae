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
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className="text-sm md:text-2xl font-bold text-primary hover:opacity-90 whitespace-normal break-words max-w-[70%] text-left"
            >
              PZM Computers & Phones Store -Buy•Sell•Fix•Used•PC•Build
            </button>
          </div>

          <div className="flex items-center gap-4">

            {currentPage !== 'admin' && (
              <button
                onClick={() => onNavigate({ type: 'cart' })}
                className="relative p-3 md:p-2 min-h-[44px] min-w-[44px] text-gray-600 hover:text-gray-900"
                aria-label="Open cart"
              >
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {isAuthenticated && (
              <button
                onClick={() => {
                  logout()
                  onNavigate({ type: 'home' })
                }}
                className="p-3 md:p-2 min-h-[44px] min-w-[44px] text-gray-600 hover:text-gray-900"
                aria-label="Logout"
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
