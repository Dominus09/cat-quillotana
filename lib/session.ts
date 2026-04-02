import type { ClientSession, CartItem, Product } from "@/types/catalog"

const SESSION_KEY = "quillotana_session"
const CART_KEY = "quillotana_cart"

export function getSession(): ClientSession | null {
  if (typeof window === "undefined") return null
  const data = sessionStorage.getItem(SESSION_KEY)
  return data ? JSON.parse(data) : null
}

export function setSession(session: ClientSession): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function updateSessionPriceList(price_list: string): void {
  const s = getSession()
  if (!s) return
  setSession({ ...s, price_list })
}

export function clearSession(): void {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(CART_KEY)
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return []
  const data = sessionStorage.getItem(CART_KEY)
  return data ? JSON.parse(data) : []
}

export function setCart(cart: CartItem[]): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(CART_KEY, JSON.stringify(cart))
}

export function addToCart(product: Product, quantity: number = 1): CartItem[] {
  const cart = getCart()
  const existingIndex = cart.findIndex((item) => item.product.id === product.id)

  if (existingIndex >= 0) {
    cart[existingIndex].quantity += quantity
  } else {
    cart.push({ product, quantity })
  }

  setCart(cart)
  return cart
}

export function updateCartItem(productId: number, quantity: number): CartItem[] {
  const cart = getCart()
  const index = cart.findIndex((item) => item.product.id === productId)

  if (index >= 0) {
    if (quantity <= 0) {
      cart.splice(index, 1)
    } else {
      cart[index].quantity = quantity
    }
  }

  setCart(cart)
  return cart
}

export function removeFromCart(productId: number): CartItem[] {
  const cart = getCart().filter((item) => item.product.id !== productId)
  setCart(cart)
  return cart
}

export function clearCart(): void {
  setCart([])
}

export function getCartTotal(cart: CartItem[]): number {
  return cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  )
}

export function getCartItemCount(cart: CartItem[]): number {
  return cart.reduce((count, item) => count + item.quantity, 0)
}
