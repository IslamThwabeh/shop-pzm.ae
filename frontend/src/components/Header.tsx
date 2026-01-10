import { ShoppingCart, LogOut } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'

interface HeaderProps {
  onNavigate: (page: any) => void
  currentPage?: string
}

export default function Header({ onNavigate, currentPage }: HeaderProps) {
  const { items } = useCart()
  const { isAuthenticated, logout } = useAuth()
  const [isShrunk, setIsShrunk] = useState(false)

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    // Only enable shrink behavior on small screens
    function onScrollOrResize() {
      if (typeof window === 'undefined') return
      const small = window.matchMedia('(max-width: 768px)').matches
      if (!small) {
        setIsShrunk(false)
        return
      }
      setIsShrunk(window.scrollY > 40)
    }

    onScrollOrResize()
    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [])

  return (
    <header className={`bg-white shadow sticky top-0 z-50 transition-all duration-200 ${isShrunk ? 'py-1' : 'py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className="flex items-center gap-3"
              aria-label="Go to home"
            >
              <img src="/images/mini_logo.png" alt="PZM logo" className={`w-8 h-8 md:w-10 md:h-10 transition-all duration-200 ${isShrunk ? 'scale-90' : 'scale-100'}`} />

              <span className={`ml-2 block md:hidden text-base font-bold text-primary transition-all duration-200 ${isShrunk ? 'opacity-0 max-w-0 overflow-hidden pointer-events-none' : 'opacity-100 max-w-full'}`}>
                PZM Store
              </span>

              <span className={`ml-2 hidden md:block text-2xl font-bold text-primary transition-all duration-200 ${isShrunk ? 'opacity-0 max-w-0 overflow-hidden pointer-events-none' : 'opacity-100 max-w-[70%] whitespace-normal break-words'}`}>
                PZM Computers & Phones Store -Buy•Sell•Fix•Used•PC•Build
              </span>
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
