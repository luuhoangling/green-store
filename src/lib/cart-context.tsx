'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './auth-context'

interface CartItem {
  id: number
  qty: number
  unitPriceSnapshot: number
  product: {
    id: number
    name: string
    slug: string
    imageUrl: string | null
  }
}

interface Cart {
  id: number
  items: CartItem[]
}

interface CartContextType {
  cart: Cart | null
  cartItemCount: number
  refreshCart: () => Promise<void>
  addToCart: (productId: number, qty: number) => Promise<boolean>
  updateCartItem: (itemId: number, qty: number) => Promise<boolean>
  removeFromCart: (itemId: number) => Promise<boolean>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [cartItemCount, setCartItemCount] = useState(0)
  const { token } = useAuth()

  const fetchCart = async () => {
    // Don't fetch cart if not logged in
    if (!token) {
      setCart(null)
      setCartItemCount(0)
      return
    }

    try {
      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`
      }
      
      const response = await fetch('/api/cart', { headers })
      const data = await response.json()
      
      if (data.success) {
        setCart(data.data)
        // Calculate total item count
        const totalItems = data.data.items.reduce((sum: number, item: CartItem) => sum + item.qty, 0)
        setCartItemCount(totalItems)
      } else {
        // If cart fetch fails (e.g., unauthorized), clear cart
        setCart(null)
        setCartItemCount(0)
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
      setCart(null)
      setCartItemCount(0)
    }
  }

  const refreshCart = async () => {
    await fetchCart()
  }

  const addToCart = async (productId: number, qty: number): Promise<boolean> => {
    // Require authentication
    if (!token) {
      console.error('Must be logged in to add to cart')
      return false
    }

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
      
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          productId,
          qty
        })
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchCart() // Refresh cart after adding
        return true
      }
      return false
    } catch (error) {
      console.error('Error adding to cart:', error)
      return false
    }
  }

  const updateCartItem = async (itemId: number, qty: number): Promise<boolean> => {
    // Require authentication
    if (!token) {
      console.error('Must be logged in to update cart')
      return false
    }

    try {
      const cartItem = cart?.items.find(item => item.id === itemId)
      if (!cartItem) return false

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }

      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          productId: cartItem.product.id,
          qty
        })
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchCart() // Refresh cart after updating
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating cart item:', error)
      return false
    }
  }

  const removeFromCart = async (itemId: number): Promise<boolean> => {
    // Require authentication
    if (!token) {
      console.error('Must be logged in to remove from cart')
      return false
    }

    try {
      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`
      }
      
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
        headers
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchCart() // Refresh cart after removing
        return true
      }
      return false
    } catch (error) {
      console.error('Error removing from cart:', error)
      return false
    }
  }

  // Fetch cart on mount and when token changes
  useEffect(() => {
    if (token) {
      fetchCart()
    } else {
      // Clear cart when logged out
      setCart(null)
      setCartItemCount(0)
    }
  }, [token])

  return (
    <CartContext.Provider value={{
      cart,
      cartItemCount,
      refreshCart,
      addToCart,
      updateCartItem,
      removeFromCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
