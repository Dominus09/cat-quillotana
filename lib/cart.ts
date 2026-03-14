import type { CartItem } from './types'

const CART_KEY = 'quillotana_cart'

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  const cart = localStorage.getItem(CART_KEY)
  return cart ? JSON.parse(cart) : []
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export function addToCart(item: CartItem): CartItem[] {
  const cart = getCart()
  const existingIndex = cart.findIndex((i) => i.variant_id === item.variant_id)
  
  if (existingIndex >= 0) {
    cart[existingIndex].quantity += item.quantity
  } else {
    cart.push(item)
  }
  
  saveCart(cart)
  return cart
}

export function updateCartQuantity(variantId: number, quantity: number): CartItem[] {
  const cart = getCart()
  const index = cart.findIndex((i) => i.variant_id === variantId)
  
  if (index >= 0) {
    if (quantity <= 0) {
      cart.splice(index, 1)
    } else {
      cart[index].quantity = quantity
    }
  }
  
  saveCart(cart)
  return cart
}

export function removeFromCart(variantId: number): CartItem[] {
  const cart = getCart().filter((i) => i.variant_id !== variantId)
  saveCart(cart)
  return cart
}

export function clearCart(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CART_KEY)
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export function getCartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}
