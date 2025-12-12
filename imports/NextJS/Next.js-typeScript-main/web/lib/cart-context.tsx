'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { CartItem, PaymentMethod, ApiProduct } from '@/lib/types'

interface CartContextType {
  cart: CartItem[]
  paymentMethod: PaymentMethod
  isCartOpen: boolean
  addToCart: (productId: string, product?: ApiProduct) => void
  updateQuantity: (productId: string, newQuantity: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  setPaymentMethod: (method: PaymentMethod) => void
  setIsCartOpen: (open: boolean) => void
  subtotal: number
  tax: number
  total: number
  cartItemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

interface CartProviderProps {
  children: ReactNode
}

// Load cart from localStorage
function loadCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem('zenith-cart')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Save cart to localStorage
function saveCartToStorage(cart: CartItem[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('zenith-cart', JSON.stringify(cart))
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error)
  }
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    setCart(loadCartFromStorage())
    setIsHydrated(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      saveCartToStorage(cart)
    }
  }, [cart, isHydrated])

  const addToCart = (productId: string, product?: ApiProduct) => {
    if (!product) {
      console.error('Product data is required to add to cart')
      return
    }
    
    if (!product.price_cents) return

    const existingItem = cart.find(item => item.clover_item_id === productId)
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.clover_item_id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, {
        clover_item_id: product.clover_item_id,
        name: product.name,
        price: product.price_cents,
        quantity: 1,
        category: product.category_id,
        sku: product.sku
      }])
    }
    
    // Auto-open cart when adding first item
    if (cart.length === 0 || !isCartOpen) {
      setIsCartOpen(true)
    }
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }
    
    setCart(cart.map(item =>
      item.clover_item_id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ))
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.clover_item_id !== productId))
  }

  const clearCart = () => {
    setCart([])
  }

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = Math.round(subtotal * 0.0875) // 8.75% tax
  const total = subtotal + tax
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        paymentMethod,
        isCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        setPaymentMethod,
        setIsCartOpen,
        subtotal,
        tax,
        total,
        cartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
