import { LogOut, ChevronDown, Menu, MessageCircle, Phone, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { areaNavigationLinks, serviceNavigationLinks, siteContact, siteIdentity } from '../content/siteData'

interface HeaderProps {
  onNavigate: (page: any) => void
  currentPage?: string
}

export default function Header({ onNavigate, currentPage }: HeaderProps) {
  const { isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const [isShrunk, setIsShrunk] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isHomePage = currentPage === 'home'
  const isServicesPage = location.pathname === '/services' || location.pathname === '/services/'
  const isAreasPage = location.pathname === '/areas' || location.pathname === '/areas/'
  const isBlogPage = currentPage === 'blog'

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
  }, [location.pathname])

  const desktopLinkClass = (active: boolean) =>
    `border-b-2 px-1 py-2 text-sm font-semibold transition-colors ${
      active ? 'border-primary text-slate-950' : 'border-transparent text-brandTextMedium hover:border-primary/40 hover:text-slate-950'
    }`

  return (
    <header className={`sticky top-0 z-50 border-b border-slate-200 bg-white transition-all duration-200 ${isShrunk ? 'py-2' : 'py-3'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex min-w-0 flex-1 items-center gap-3" aria-label="Go to home">
            <img
              src="/images/mini_logo.png"
              alt="PZM logo"
              className={`h-[46px] md:h-[52px] lg:h-[56px] w-auto object-contain transition-all duration-200 ${isShrunk ? 'scale-95' : 'scale-100'}`}
            />

            <div className="min-w-0">
              <p className="text-base font-bold leading-tight text-slate-900 md:text-[1.05rem] lg:text-[1.15rem]">
                {siteIdentity.name}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-600 md:text-xs">
                {siteIdentity.tagline}
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            <Link to="/" className={desktopLinkClass(isHomePage)}>
              Home
            </Link>

            <div className="relative group">
              <button type="button" className={desktopLinkClass(isServicesPage)}>
                <span className="inline-flex items-center gap-2">
                  Services
                  <ChevronDown size={16} />
                </span>
              </button>
              <div className="invisible absolute left-0 top-full mt-3 w-64 rounded-2xl border border-brandBorder bg-white p-3 opacity-0 shadow-xl transition-all duration-150 group-hover:visible group-hover:opacity-100">
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
              <button type="button" className={desktopLinkClass(isAreasPage)}>
                <span className="inline-flex items-center gap-2">
                  Areas
                  <ChevronDown size={16} />
                </span>
              </button>
              <div className="invisible absolute left-0 top-full mt-3 w-64 rounded-2xl border border-brandBorder bg-white p-3 opacity-0 shadow-xl transition-all duration-150 group-hover:visible group-hover:opacity-100">
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

            <Link to={siteContact.blogHref} className={desktopLinkClass(isBlogPage)}>
              Blog
            </Link>
            <a href="/#contact" className={desktopLinkClass(false)}>
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-2 lg:gap-3">
            <div className="hidden lg:flex items-center gap-2">
              <a
                href={siteContact.phoneHref}
                className="inline-flex items-center gap-2 rounded-full border border-brandBorder px-4 py-2 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary"
              >
                <Phone size={16} />
                Call Us
              </a>
              <a
                href={siteContact.whatsappSupportHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brandGreenDark"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen((value) => !value)}
              className="lg:hidden p-3 md:p-2 min-h-[44px] min-w-[44px] text-brandTextMedium hover:text-primary transition-colors"
              aria-label="Toggle navigation"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

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

        <div className={`lg:hidden overflow-hidden transition-all duration-200 ${isMobileMenuOpen ? 'max-h-[80vh] pt-4 pb-2 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
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

            <Link to={siteContact.blogHref} className={`block rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${isBlogPage ? 'bg-primary text-white' : 'text-brandTextDark hover:bg-green-50 hover:text-primary'}`}>
              Blog
            </Link>
            <a href="/#contact" className="block rounded-2xl px-4 py-3 text-sm font-semibold text-brandTextDark hover:bg-green-50 hover:text-primary">
              Contact
            </a>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href={siteContact.phoneHref}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-brandBorder px-4 py-3 text-sm font-semibold text-brandTextDark hover:border-primary hover:text-primary transition-colors"
              >
                <Phone size={16} />
                Call Us
              </a>
              <a
                href={siteContact.whatsappSupportHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brandGreenDark"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
            </div>

          </div>
        </div>
      </div>
    </header>
  )
}
