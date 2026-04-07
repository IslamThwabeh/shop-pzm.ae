import { LogOut, ChevronDown, Menu, MessageCircle, Phone, X, Wrench } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  megaMenuCategories,
  megaMenuShopSections,
  siteContact,
} from '../content/siteData'

interface HeaderProps {
  onNavigate: (page: any) => void
  currentPage?: string
}

export default function Header({ onNavigate }: HeaderProps) {
  const { isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMegaOpen, setIsMegaOpen] = useState(false)
  const megaRef = useRef<HTMLDivElement>(null)
  const megaTimerRef = useRef<ReturnType<typeof setTimeout>>()

  const isRepairPage = location.pathname.startsWith('/services/repair')

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsMegaOpen(false)
  }, [location.pathname])

  // Close mega-menu on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setIsMegaOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  // Close mega-menu on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsMegaOpen(false)
        setIsMobileMenuOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const openMega = useCallback(() => {
    clearTimeout(megaTimerRef.current)
    setIsMegaOpen(true)
  }, [])

  const closeMegaDelayed = useCallback(() => {
    megaTimerRef.current = setTimeout(() => setIsMegaOpen(false), 180)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-[#eee] bg-white/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* ── Logo ─────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="Home">
            <img
              src="/images/mini_logo.png"
              alt="PZM logo"
              className="h-10 w-auto object-contain"
            />
            <span className="text-lg font-bold tracking-tight text-slate-900 hidden sm:inline">
              PZM
            </span>
          </Link>

          {/* ── Desktop Nav (center) ──────────────────── */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Products mega-menu trigger */}
            <div ref={megaRef} className="relative" onMouseEnter={openMega} onMouseLeave={closeMegaDelayed}>
              <button
                type="button"
                onClick={() => setIsMegaOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                aria-expanded={isMegaOpen}
              >
                Products
                <ChevronDown size={15} className={`transition-transform duration-200 ${isMegaOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mega-menu panel */}
              <div
                className={`absolute left-1/2 top-full mt-3 -translate-x-1/2 w-[540px] rounded-2xl border border-[#eee] bg-white p-5 shadow-xl transition-all duration-200 ${
                  isMegaOpen
                    ? 'pointer-events-auto translate-y-0 opacity-100'
                    : 'pointer-events-none -translate-y-2 opacity-0'
                }`}
              >
                <div className="grid grid-cols-2 gap-6">
                  {/* Left column — Device Categories */}
                  <div>
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      Categories
                    </p>
                    <div className="space-y-1">
                      {megaMenuCategories.map((item) => {
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.label}
                            to={item.to}
                            className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50"
                          >
                            <Icon size={18} className="mt-0.5 shrink-0 text-slate-400" />
                            <div>
                              <p className="text-sm font-medium text-slate-800">{item.label}</p>
                              <p className="text-xs text-slate-400">{item.subtitle}</p>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>

                  {/* Right column — Shop Sections */}
                  <div>
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      Shop
                    </p>
                    <div className="space-y-1">
                      {megaMenuShopSections.map((item) => {
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.label}
                            to={item.to}
                            className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50"
                          >
                            <Icon size={18} className="mt-0.5 shrink-0 text-slate-400" />
                            <div>
                              <p className="text-sm font-medium text-slate-800">{item.label}</p>
                              <p className="text-xs text-slate-400">{item.subtitle}</p>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Repair — top-level link */}
            <Link
              to="/services/repair"
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                isRepairPage
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Wrench size={15} />
              Repair
            </Link>
          </nav>

          {/* ── Right actions ─────────────────────────── */}
          <div className="flex items-center gap-2">
            {/* Desktop CTA icons */}
            <div className="hidden lg:flex items-center gap-2">
              <a
                href={siteContact.phoneHref}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#eee] text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700"
                aria-label="Call us"
              >
                <Phone size={16} />
              </a>
              <a
                href={siteContact.whatsappSupportHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white transition-opacity hover:opacity-90"
                aria-label="WhatsApp"
              >
                <MessageCircle size={16} />
              </a>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              className="lg:hidden flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
              aria-label="Toggle navigation"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Admin logout */}
            {isAuthenticated && (
              <button
                onClick={() => {
                  logout()
                  onNavigate({ type: 'home' })
                }}
                className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 transition-colors hover:text-red-500"
                aria-label="Logout"
              >
                <LogOut size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile menu ────────────────────────────── */}
      <div
        className={`lg:hidden overflow-hidden border-t border-[#eee] bg-white transition-all duration-250 ${
          isMobileMenuOpen
            ? 'max-h-[85vh] opacity-100'
            : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
          {/* Products accordion */}
          <details className="group rounded-xl border border-[#eee]">
            <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold text-slate-800 [&::-webkit-details-marker]:hidden">
              Products
              <ChevronDown size={16} className="text-slate-400 transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-2 pb-3">
              <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">Categories</p>
              {megaMenuCategories.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <Icon size={16} className="text-slate-400" />
                    {item.label}
                  </Link>
                )
              })}

              <p className="mt-2 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">Shop</p>
              {megaMenuShopSections.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <Icon size={16} className="text-slate-400" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </details>

          {/* Repair direct link */}
          <Link
            to="/services/repair"
            className="flex items-center gap-2.5 rounded-xl border border-[#eee] px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
          >
            <Wrench size={16} className="text-slate-400" />
            Repair
          </Link>

          {/* Contact row */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <a
              href={siteContact.phoneHref}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#eee] py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300"
            >
              <Phone size={16} />
              Call
            </a>
            <a
              href={siteContact.whatsappSupportHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
