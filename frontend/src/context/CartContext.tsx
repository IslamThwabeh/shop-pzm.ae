import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

export interface CartItem {
  id: string
  model: string
  price: number
  quantity: number
  color: string
  storage: string
  condition?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  total: number
  itemCount: number
  /** Brief message shown after addItem — auto-clears after ~2.5 s */
  lastAddedMessage: string | null
  lastAddedTick: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([])
  const [lastAddedMessage, setLastAddedMessage] = useState<string | null>(null)
  const [lastAddedTick, setLastAddedTick] = useState(0)
  const lastAddedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('cart')
    if (saved) {
      try {
        setItems(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load cart:', e)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  useEffect(() => {
    return () => {
      if (lastAddedTimeoutRef.current) {
        clearTimeout(lastAddedTimeoutRef.current)
      }
    }
  }, [])

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        )
      }
      return [...prev, item]
    })
    setLastAddedTick((current) => current + 1)
    setLastAddedMessage('Added to cart')

    if (lastAddedTimeoutRef.current) {
      clearTimeout(lastAddedTimeoutRef.current)
    }

    lastAddedTimeoutRef.current = setTimeout(() => {
      setLastAddedMessage(null)
      lastAddedTimeoutRef.current = null
    }, 2500)
  }, [])

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount, lastAddedMessage, lastAddedTick }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
