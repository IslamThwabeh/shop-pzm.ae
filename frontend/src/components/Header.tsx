import { LogOut, ChevronDown, Menu, MessageCircle, Phone, ShoppingCart, X, Wrench } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { Product } from '@shared/types'
import CartFeedbackLayer from './CartFeedbackLayer'
import HeaderSearch from './HeaderSearch'
import {
  megaMenuCategories,
  megaMenuShopSections,
  siteContact,
} from '../content/siteData'
import { formatCartCount, replayAnimationClass } from '../utils/cartFeedback'
import { buildSearchIndex } from '../utils/storefrontSearch'
import { getLanguageSwitchPath, toSupportedLocalizedPath, useLanguage } from '../context/LanguageContext'

interface HeaderProps {
  onNavigate: (page: any) => void
  currentPage?: string
  products?: Product[]
  onSearchActivate?: () => void
}

export default function Header({ onNavigate, products = [], onSearchActivate }: HeaderProps) {
  const { isAuthenticated, logout } = useAuth()
  const { itemCount, lastAddedTick } = useCart()
  const { lang, t } = useLanguage()
  const location = useLocation()
  const searchIndex = useMemo(() => buildSearchIndex(products), [products])
  const localeAwarePath = useCallback((path: string) => toSupportedLocalizedPath(path, lang), [lang])
  const currentRoute = `${location.pathname}${location.search}${location.hash}`
  const languageSwitchHref = getLanguageSwitchPath(currentRoute)

  // Build translated mega-menu items from the base siteData + translation record.
  const categoryLabelKeys = ['catPhones', 'catLaptops', 'catGaming', 'catPro'] as const
  const categorySubtitleKeys = ['catPhonesSubtitle', 'catLaptopsSubtitle', 'catGamingSubtitle', 'catProSubtitle'] as const
  const shopLabelKeys = ['shopBrandNew', 'shopUsed', 'shopBuyIphone', 'shopSell', 'shopAccessories'] as const
  const shopSubtitleKeys = ['shopBrandNewSubtitle', 'shopUsedSubtitle', 'shopBuyIphoneSubtitle', 'shopSellSubtitle', 'shopAccessoriesSubtitle'] as const
  const translatedCategories = megaMenuCategories.map((item, i) => ({
    ...item,
    label: t(categoryLabelKeys[i]),
    subtitle: t(categorySubtitleKeys[i]),
    to: localeAwarePath(item.to),
  }))
  const translatedShopSections = megaMenuShopSections.map((item, i) => ({
    ...item,
    label: t(shopLabelKeys[i]),
    subtitle: t(shopSubtitleKeys[i]),
    to: localeAwarePath(item.to),
  }))
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMegaOpen, setIsMegaOpen] = useState(false)
  const megaRef = useRef<HTMLDivElement>(null)
  const megaTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const desktopCartRef = useRef<HTMLAnchorElement>(null)
  const mobileCartRef = useRef<HTMLAnchorElement>(null)

  const isRepairPage = location.pathname.startsWith('/services/repair')
  const cartItemWord = itemCount === 1
    ? (lang === 'ar' ? 'عنصر' : 'item')
    : (lang === 'ar' ? 'عناصر' : 'items')
  const badgeToneClass = itemCount > 0
    ? 'bg-primary text-white shadow-[0_6px_14px_rgba(0,167,111,0.28)]'
    : 'bg-slate-200 text-slate-500'

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

  useEffect(() => {
    if (!lastAddedTick || typeof window === 'undefined' || window.innerWidth < 1024) {
      return undefined
    }

    const cartTargets = [desktopCartRef.current]

    cartTargets.forEach((target) => replayAnimationClass(target, 'cart-icon-bounce'))

    const timer = window.setTimeout(() => {
      cartTargets.forEach((target) => target?.classList.remove('cart-icon-bounce'))
    }, 760)

    return () => {
      window.clearTimeout(timer)
      cartTargets.forEach((target) => target?.classList.remove('cart-icon-bounce'))
    }
  }, [lastAddedTick])

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
          <Link to={localeAwarePath('/')} className="flex shrink-0 items-center" aria-label="PZM home">
            <img
              src="/images/brand/pzm-header-logo.png"
              alt="PZM"
              width={516}
              height={293}
              className="h-8 w-auto object-contain sm:h-9 lg:h-10"
            />
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
                {t('navProducts')}
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
                      {t('navCategories')}
                    </p>
                    <div className="space-y-1">
                      {translatedCategories.map((item) => {
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
                      {t('navShop')}
                    </p>
                    <div className="space-y-1">
                      {translatedShopSections.map((item) => {
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
              to={localeAwarePath('/services/repair')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                isRepairPage
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Wrench size={15} />
              {t('navRepair')}
            </Link>
          </nav>

          {/* ── Desktop search (primary header element) ─── */}
          <HeaderSearch searchIndex={searchIndex} variant="desktop" onActivate={onSearchActivate} />

          {/* ── Right actions ─────────────────────────── */}
          <div className="flex items-center gap-2">
            {/* Desktop CTA icons */}
            <div className="hidden lg:flex items-center gap-2">
              <Link
                to={languageSwitchHref}
                className="inline-flex h-9 items-center justify-center rounded-full border border-[#eee] px-3 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
              >
                {t('langSwitchLabel')}
              </Link>
              <a
                href={siteContact.phoneHref}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#eee] text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700"
                aria-label={t('navCallAriaLabel')}
              >
                <Phone size={16} />
              </a>
              <a
                href={siteContact.whatsappSupportHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white transition-opacity hover:opacity-90"
                aria-label={t('navWhatsAppAriaLabel')}
              >
                <MessageCircle size={16} />
              </a>
              <Link
                ref={desktopCartRef}
                to="/cart"
                data-cart-feedback-target="desktop"
                className="cart-icon-button relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#eee] text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700"
                aria-label={t('navCartAriaLabel', { count: itemCount, itemWord: cartItemWord })}
              >
                <ShoppingCart size={16} />
                <span
                  key={`desktop-${itemCount}-${lastAddedTick}`}
                  className={`cart-count-badge absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-bold ring-2 ring-white ${badgeToneClass}`}
                >
                  {formatCartCount(itemCount)}
                </span>
              </Link>
            </div>

            {/* Mobile cart + hamburger */}
            <div className="flex lg:hidden items-center gap-1">
              <Link
                ref={mobileCartRef}
                to="/cart"
                data-cart-feedback-target="mobile-header"
                className="cart-icon-button relative flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
                aria-label={t('navCartAriaLabel', { count: itemCount, itemWord: cartItemWord })}
              >
                <ShoppingCart size={20} />
                <span
                  key={`mobile-${itemCount}-${lastAddedTick}`}
                  className={`cart-count-badge absolute right-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-bold ring-2 ring-white ${badgeToneClass}`}
                >
                  {formatCartCount(itemCount)}
                </span>
              </Link>
              <button
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
              aria-label={t('navToggleAriaLabel')}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            </div>

            {/* Admin logout */}
            {isAuthenticated && (
              <button
                onClick={() => {
                  logout()
                  onNavigate({ type: 'home' })
                }}
                className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 transition-colors hover:text-red-500"
                aria-label={t('navLogoutAriaLabel')}
              >
                <LogOut size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile search row (always visible under top bar) ─ */}
      <div className="lg:hidden border-t border-[#eee] bg-white px-4 py-2.5">
        <HeaderSearch searchIndex={searchIndex} variant="mobile" onActivate={onSearchActivate} onAfterNavigate={() => setIsMobileMenuOpen(false)} />
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
              {t('navProducts')}
              <ChevronDown size={16} className="text-slate-400 transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-2 pb-3">
              <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">{t('navCategories')}</p>
              {translatedCategories.map((item) => {
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

              <p className="mt-2 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">{t('navShop')}</p>
              {translatedShopSections.map((item) => {
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
            to={localeAwarePath('/services/repair')}
            className="flex items-center gap-2.5 rounded-xl border border-[#eee] px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
          >
            <Wrench size={16} className="text-slate-400" />
            {t('navRepair')}
          </Link>

          <Link
            to={languageSwitchHref}
            className="flex items-center justify-center rounded-xl border border-[#eee] px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
          >
            {t('langSwitchLabel')}
          </Link>

          {/* Contact row */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <a
              href={siteContact.phoneHref}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#eee] py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300"
            >
              <Phone size={16} />
              {t('contactCardCallLabel')}
            </a>
            <a
              href={siteContact.whatsappSupportHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <MessageCircle size={16} />
              {t('contactCardWhatsappLabel')}
            </a>
          </div>
        </div>
      </div>

      <CartFeedbackLayer />
    </header>
  )
}
