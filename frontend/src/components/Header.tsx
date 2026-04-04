import { ShoppingCart, LogOut, ChevronDown, MapPin, Menu, Phone, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { areaNavigationLinks, serviceNavigationLinks, siteContact, siteIdentity } from '../content/siteData'

interface HeaderProps {
  onNavigate: (page: any) => void
  currentPage?: string
}

export default function Header({ onNavigate, currentPage }: HeaderProps) {
  const { items } = useCart()
  const { isAuthenticated, logout } = useAuth()
  const [isShrunk, setIsShrunk] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isAdminPage = currentPage === 'admin'
  const isShopPage = ['shop', 'product', 'cart', 'checkout', 'order'].includes(currentPage || '')
  const isPoliciesPage = ['terms', 'return-policy'].includes(currentPage || '')
  const isBlogPage = currentPage === 'blog'

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

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [currentPage])

  const desktopLinkClass = (active: boolean) =>
    `rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
      active ? 'bg-primary text-white' : 'text-brandTextMedium hover:bg-green-50 hover:text-primary'
    }`

  return (
    <header className={`sticky top-0 z-50 border-b border-brandBorder bg-white/95 backdrop-blur transition-all duration-200 ${isShrunk ? 'py-1' : 'py-3'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex min-w-0 flex-1 items-center gap-3" aria-label="Go to home">
            <img
              src="/images/mini_logo.png"
              alt="PZM logo"
              className={`h-[56px] md:h-[64px] lg:h-[72px] w-auto object-contain transition-all duration-200 ${isShrunk ? 'scale-95' : 'scale-100'}`}
            />

            <div className="min-w-0">
              <span className={`block md:hidden text-sm font-bold text-primary leading-tight transition-all duration-200 ${isShrunk ? 'opacity-0 max-h-0 overflow-hidden pointer-events-none' : 'opacity-100'}`}>
                PZM Store
              </span>
              <span className={`hidden md:block text-xl font-bold text-brandTextDark leading-snug transition-all duration-200 ${isShrunk ? 'opacity-0 max-h-0 overflow-hidden pointer-events-none' : 'opacity-100 max-w-[560px] whitespace-normal break-words'}`}>
                {siteIdentity.name} - {siteIdentity.tagline}
              </span>
            </div>
          </Link>

          {!isAdminPage && (
            <nav className="hidden xl:flex items-center gap-2">
              <Link to="/" className={desktopLinkClass(currentPage === 'home')}>
                Home
              </Link>

              <div className="relative group">
                <button className={desktopLinkClass(currentPage === 'services')}>
                  <span className="inline-flex items-center gap-2">
                    Services
                    <ChevronDown size={16} />
                  </span>
                </button>
                <div className="invisible absolute left-0 top-full mt-2 w-64 rounded-2xl border border-brandBorder bg-white p-3 opacity-0 shadow-xl transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  {serviceNavigationLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="block rounded-xl px-3 py-2 text-sm font-medium text-brandTextDark hover:bg-green-50 hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="relative group">
                <button className={desktopLinkClass(currentPage === 'areas')}>
                  <span className="inline-flex items-center gap-2">
                    Areas
                    <ChevronDown size={16} />
                  </span>
                </button>
                <div className="invisible absolute left-0 top-full mt-2 w-64 rounded-2xl border border-brandBorder bg-white p-3 opacity-0 shadow-xl transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <Link to="/areas" className="block rounded-xl px-3 py-2 text-sm font-medium text-brandTextDark hover:bg-green-50 hover:text-primary">
                    All Areas
                  </Link>
                  {areaNavigationLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="block rounded-xl px-3 py-2 text-sm font-medium text-brandTextDark hover:bg-green-50 hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <Link to="/shop" className={desktopLinkClass(isShopPage)}>
                Shop
              </Link>
              <Link to={siteContact.blogHref} className={desktopLinkClass(isBlogPage)}>
                Blog
              </Link>
              <Link to="/return-policy" className={desktopLinkClass(isPoliciesPage)}>
                Policies
              </Link>
            </nav>
          )}

          <div className="flex items-center gap-2 lg:gap-3">
            {!isAdminPage && (
              <div className="hidden lg:flex items-center gap-2">
                <a
                  href={siteContact.phoneHref}
                  className="inline-flex items-center gap-2 rounded-full border border-brandBorder px-4 py-2 text-sm font-semibold text-brandTextDark hover:border-primary hover:text-primary transition-colors"
                >
                  <Phone size={16} />
                  Call Us
                </a>
                <a
                  href={siteContact.mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-brandBorder px-4 py-2 text-sm font-semibold text-brandTextDark hover:border-primary hover:text-primary transition-colors"
                >
                  <MapPin size={16} />
                  Directions
                </a>
              </div>
            )}

            {!isAdminPage && (
              <button
                onClick={() => onNavigate({ type: 'cart' })}
                className="relative p-3 md:p-2 min-h-[44px] min-w-[44px] text-brandTextMedium hover:text-primary transition-colors"
                aria-label="Open cart"
              >
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brandRed text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {!isAdminPage && (
              <button
                onClick={() => setIsMobileMenuOpen((value) => !value)}
                className="xl:hidden p-3 md:p-2 min-h-[44px] min-w-[44px] text-brandTextMedium hover:text-primary transition-colors"
                aria-label="Toggle navigation"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}

            {isAuthenticated && (
              <button
                onClick={() => {
                  logout()
                  onNavigate({ type: 'home' })
                }}
                className="p-3 md:p-2 min-h-[44px] min-w-[44px] text-brandTextMedium hover:text-primary transition-colors"
                aria-label="Logout"
              >
                <LogOut size={24} />
              </button>
            )}
          </div>
        </div>

        {!isAdminPage && (
          <div className={`xl:hidden overflow-hidden transition-all duration-200 ${isMobileMenuOpen ? 'max-h-[80vh] pt-4 pb-2 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
            <div className="space-y-3 border-t border-brandBorder pt-4">
              <Link to="/" className="block rounded-2xl px-4 py-3 text-sm font-semibold text-brandTextDark hover:bg-green-50 hover:text-primary">
                Home
              </Link>

              <details className="rounded-2xl border border-brandBorder px-4 py-3">
                <summary className="list-none flex cursor-pointer items-center justify-between text-sm font-semibold text-brandTextDark">
                  Services
                  <ChevronDown size={16} />
                </summary>
                <div className="mt-3 grid gap-2">
                  {serviceNavigationLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="rounded-xl px-3 py-2 text-sm text-brandTextMedium hover:bg-green-50 hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </details>

              <details className="rounded-2xl border border-brandBorder px-4 py-3">
                <summary className="list-none flex cursor-pointer items-center justify-between text-sm font-semibold text-brandTextDark">
                  Areas
                  <ChevronDown size={16} />
                </summary>
                <div className="mt-3 grid gap-2">
                  <Link to="/areas" className="rounded-xl px-3 py-2 text-sm text-brandTextMedium hover:bg-green-50 hover:text-primary">
                    All Areas
                  </Link>
                  {areaNavigationLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="rounded-xl px-3 py-2 text-sm text-brandTextMedium hover:bg-green-50 hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </details>

              <Link to="/shop" className="block rounded-2xl px-4 py-3 text-sm font-semibold text-brandTextDark hover:bg-green-50 hover:text-primary">
                Shop
              </Link>
              <Link to="/return-policy" className="block rounded-2xl px-4 py-3 text-sm font-semibold text-brandTextDark hover:bg-green-50 hover:text-primary">
                Return Policy
              </Link>
              <Link to="/terms" className="block rounded-2xl px-4 py-3 text-sm font-semibold text-brandTextDark hover:bg-green-50 hover:text-primary">
                Terms
              </Link>
              <Link to={siteContact.blogHref} className={`block rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${isBlogPage ? 'bg-primary text-white' : 'text-brandTextDark hover:bg-green-50 hover:text-primary'}`}>
                Blog
              </Link>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <a
                  href={siteContact.phoneHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-brandBorder px-4 py-3 text-sm font-semibold text-brandTextDark hover:border-primary hover:text-primary transition-colors"
                >
                  <Phone size={16} />
                  Call Us
                </a>
                <a
                  href={siteContact.mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-brandBorder px-4 py-3 text-sm font-semibold text-brandTextDark hover:border-primary hover:text-primary transition-colors"
                >
                  <MapPin size={16} />
                  Directions
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
