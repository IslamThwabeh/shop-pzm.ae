import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Search, X } from 'lucide-react'
import type { Product } from '@shared/types'
import {
  buildSearchIndex,
  searchStorefront,
  type RankedSuggestion,
} from '../utils/storefrontSearch'
import { buildWhatsAppHref } from '../utils/contact'
import { trackWhatsAppLead } from '../utils/analytics'

interface HeaderSearchProps {
  products: Product[]
  variant: 'desktop' | 'mobile'
  /** Called after navigation, e.g. so a parent mobile menu can close. */
  onAfterNavigate?: () => void
}

const SUGGESTION_LIMIT = 8

function buildWhatsAppMessage(query: string): string {
  const term = query.trim()
  return term
    ? `Hi PZM, I'm looking for "${term}". Can you help me find it?`
    : 'Hi PZM, I need help finding a device.'
}

export default function HeaderSearch({ products, variant, onAfterNavigate }: HeaderSearchProps) {
  const navigate = useNavigate()
  const inputId = useId()
  const listboxId = `${inputId}-listbox`
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const index = useMemo(() => buildSearchIndex(products), [products])

  const suggestions: RankedSuggestion[] = useMemo(() => {
    const trimmed = query.trim()
    if (trimmed.length < 1) return []
    return searchStorefront(trimmed, index, { limit: SUGGESTION_LIMIT })
  }, [query, index])

  const showDropdown = isOpen && query.trim().length >= 1
  const hasSuggestions = suggestions.length > 0

  // Outside click closes.
  useEffect(() => {
    if (!showDropdown) return undefined
    function onPointerDown(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
    }
  }, [showDropdown])

  // Reset activeIndex when results change.
  useEffect(() => {
    setActiveIndex(hasSuggestions ? 0 : -1)
  }, [query, hasSuggestions])

  const closeAndBlur = useCallback(() => {
    setIsOpen(false)
    setActiveIndex(-1)
  }, [])

  const openWhatsAppFallback = useCallback(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      return
    }

    trackWhatsAppLead({
      leadType: 'generic',
      referenceLabel: trimmed,
      sourcePage: window.location.pathname,
    })
    window.open(buildWhatsAppHref(buildWhatsAppMessage(trimmed)), '_blank', 'noopener,noreferrer')
    closeAndBlur()
  }, [closeAndBlur, query])

  const goTo = useCallback(
    (destination: string) => {
      navigate(destination)
      closeAndBlur()
      onAfterNavigate?.()
    },
    [navigate, closeAndBlur, onAfterNavigate],
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      if (!hasSuggestions) return
      e.preventDefault()
      setIsOpen(true)
      setActiveIndex((i) => (i + 1) % suggestions.length)
      return
    }
    if (e.key === 'ArrowUp') {
      if (!hasSuggestions) return
      e.preventDefault()
      setIsOpen(true)
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
      return
    }
    if (e.key === 'Home' && hasSuggestions) {
      e.preventDefault()
      setActiveIndex(0)
      return
    }
    if (e.key === 'End' && hasSuggestions) {
      e.preventDefault()
      setActiveIndex(suggestions.length - 1)
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (hasSuggestions) {
        const target = suggestions[activeIndex >= 0 ? activeIndex : 0]
        if (target) goTo(target.destination)
        return
      }
      // No suggestions -> open WhatsApp fallback.
      if (query.trim().length > 0) {
        openWhatsAppFallback()
      }
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      closeAndBlur()
    }
  }

  const handleClear = () => {
    setQuery('')
    setIsOpen(false)
    setActiveIndex(-1)
    inputRef.current?.focus()
  }

  const placeholderText = variant === 'desktop'
    ? 'Search iPhones, MacBooks, Galaxy, PS5…'
    : 'Search devices'

  const wrapperClass = variant === 'desktop'
    ? 'hidden lg:flex flex-1 max-w-xl mx-4 relative'
    : 'lg:hidden relative w-full'

  const activeOptionId = activeIndex >= 0 && suggestions[activeIndex]
    ? `${listboxId}-opt-${activeIndex}`
    : undefined

  return (
    <div ref={containerRef} className={wrapperClass}>
      <div
        role="combobox"
        aria-haspopup="listbox"
        aria-owns={listboxId}
        aria-expanded={showDropdown}
        className="relative w-full"
      >
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Search size={16} aria-hidden="true" />
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => {
            if (query.trim().length >= 1) setIsOpen(true)
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          aria-label="Search devices"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-xl border border-[#eee] bg-white py-2.5 pl-9 pr-9 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm transition-colors focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
        {query.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-[#eee] bg-white shadow-lg"
          role="presentation"
        >
          <ul
            id={listboxId}
            role="listbox"
            aria-label="Device suggestions"
            className="max-h-[60vh] overflow-y-auto py-1"
          >
            {hasSuggestions ? (
              suggestions.map((item, idx) => {
                const isActive = idx === activeIndex
                return (
                  <li
                    key={item.family.key}
                    id={`${listboxId}-opt-${idx}`}
                    role="option"
                    aria-selected={isActive}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseDown={(e) => {
                      // Prevent input blur before navigation handler runs.
                      e.preventDefault()
                    }}
                    onClick={() => goTo(item.destination)}
                    className={`flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm ${
                      isActive ? 'bg-slate-50 text-slate-900' : 'text-slate-700'
                    }`}
                  >
                    <Search size={14} className="shrink-0 text-slate-400" aria-hidden="true" />
                    <span className="font-medium truncate">{item.family.label}</span>
                  </li>
                )
              })
            ) : (
              <li role="option" aria-selected={false} className="px-3 py-3">
                <p className="text-sm text-slate-700">
                  No matches for <span className="font-semibold">"{query.trim()}"</span>.
                </p>
                <a
                  href={buildWhatsAppHref(buildWhatsAppMessage(query))}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => closeAndBlur()}
                  className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                >
                  <MessageCircle size={14} aria-hidden="true" />
                  Ask on WhatsApp
                </a>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
