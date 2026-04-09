import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatCartCount, replayAnimationClass } from '../utils/cartFeedback'

export default function CartFeedbackLayer() {
  const { itemCount, lastAddedMessage, lastAddedTick } = useCart()
  const location = useLocation()
  const floatingCartRef = useRef<HTMLAnchorElement>(null)
  const badgeToneClass = itemCount > 0 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'
  const hideFloatingCart = (
    location.pathname === '/cart' ||
    location.pathname === '/checkout' ||
    location.pathname.startsWith('/order/')
  )
  const showFloatingCart = !hideFloatingCart && itemCount > 0

  useEffect(() => {
    if (!lastAddedTick) {
      return undefined
    }

    replayAnimationClass(floatingCartRef.current, 'cart-icon-bounce')

    const timer = window.setTimeout(() => {
      floatingCartRef.current?.classList.remove('cart-icon-bounce')
    }, 760)

    return () => {
      window.clearTimeout(timer)
      floatingCartRef.current?.classList.remove('cart-icon-bounce')
    }
  }, [lastAddedTick])

  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <>
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-[70] flex justify-center px-4 md:inset-x-auto md:bottom-auto md:right-5 md:top-[5.25rem] md:px-0"
      >
        {lastAddedMessage && (
          <div
            key={lastAddedTick}
            className="cart-toast pointer-events-auto flex w-full max-w-[21rem] items-center gap-3 rounded-[20px] border border-[#ececec] bg-white/95 px-4 py-3 text-sm font-semibold text-slate-800 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur md:w-auto"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm">
              <ShoppingCart size={16} />
            </span>
            <span>{lastAddedMessage}</span>
          </div>
        )}
      </div>

      {showFloatingCart && (
        <div className="pointer-events-none fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] right-3 z-[65] lg:hidden sm:bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:right-4">
          <Link
            ref={floatingCartRef}
            to="/cart"
            data-cart-feedback-target="mobile-floating"
            aria-label={`Shopping cart, ${itemCount} item${itemCount === 1 ? '' : 's'}`}
            className="cart-floating-button pointer-events-auto relative inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#e8ecef] bg-white/96 p-0 text-slate-900 shadow-[0_14px_34px_rgba(15,23,42,0.16)] backdrop-blur transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.18)] sm:min-h-[3.5rem] sm:w-auto sm:justify-start sm:gap-3 sm:pl-3 sm:pr-4"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm sm:h-10 sm:w-10">
              <ShoppingCart size={18} />
            </span>
            <span className="hidden pr-3 text-sm font-semibold sm:inline">Cart</span>
            <span
              key={`floating-${itemCount}-${lastAddedTick}`}
              className={`cart-count-badge absolute -right-1 -top-1 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-1.5 text-[11px] font-bold shadow-sm ring-2 ring-white ${badgeToneClass}`}
            >
              {formatCartCount(itemCount)}
            </span>
          </Link>
        </div>
      )}
    </>
    ,
    document.body,
  )
}
