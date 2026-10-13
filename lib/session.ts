import type { ClientSession, CartItem, Product } from "@/types/catalog"
import {
  clampValidQuantity,
  withCommercialDefaults,
} from "@/lib/sale-quantity"
import {
  hasValidCatalogPrice,
  normalizeSessionPriceList,
} from "@/lib/price-list"

const SESSION_KEY = "quillotana_session"
const CART_KEY = "quillotana_cart"
/** Lista con la que se cotizaron los precios guardados en el carrito. */
const CART_PRICE_LIST_KEY = "quillotana_cart_price_list"

export function getSession(): ClientSession | null {
  if (typeof window === "undefined") return null
  const data = sessionStorage.getItem(SESSION_KEY)
  if (!data) return null
  let parsed: ClientSession
  try {
    parsed = JSON.parse(data)
  } catch {
    sessionStorage.removeItem(SESSION_KEY)
    return null
  }
  const { session, changed } = normalizeSessionPriceList(parsed)
  if (changed) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }
  return session
}

export function setSession(session: ClientSession): void {
  if (typeof window === "undefined") return
  const { session: normalized } = normalizeSessionPriceList(session)
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(normalized))
}

export function clearSession(): void {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(CART_KEY)
  sessionStorage.removeItem(CART_PRICE_LIST_KEY)
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

export function getCartPriceList(): string | null {
  if (typeof window === "undefined") return null
  return sessionStorage.getItem(CART_PRICE_LIST_KEY)
}

function setCartPriceList(priceList: string | undefined): void {
  if (typeof window === "undefined") return
  if (priceList) sessionStorage.setItem(CART_PRICE_LIST_KEY, priceList)
  else sessionStorage.removeItem(CART_PRICE_LIST_KEY)
}

/** Carrito con precios de otra lista (o sin etiqueta, p. ej. cotizado bajo COMODITI). */
export function cartNeedsReprice(sessionPriceList: string | undefined): boolean {
  if (!sessionPriceList) return false
  if (getCart().length === 0) return false
  return getCartPriceList() !== sessionPriceList
}

export interface CartRepriceResult {
  cart: CartItem[]
  changed: { name: string; oldPrice: number; newPrice: number }[]
  removed: string[]
}

/** Actualiza precios del carrito desde la lista vigente; quita ítems sin precio válido. */
export function repriceCart(
  products: Product[],
  priceList: string
): CartRepriceResult {
  const byId = new Map<number, Product>()
  for (const p of products) {
    if (!byId.has(p.id)) byId.set(p.id, p)
  }

  const changed: CartRepriceResult["changed"] = []
  const removed: string[] = []
  const next: CartItem[] = []

  for (const item of getCart()) {
    const fresh = byId.get(item.product.id)
    if (!fresh || !hasValidCatalogPrice(fresh.price)) {
      removed.push(item.product.name)
      continue
    }
    if (fresh.price !== item.product.price) {
      changed.push({
        name: fresh.name,
        oldPrice: item.product.price,
        newPrice: fresh.price,
      })
    }
    const p = withCommercialDefaults(fresh)
    next.push({ product: p, quantity: clampValidQuantity(item.quantity, p) })
  }

  setCart(next)
  setCartPriceList(next.length > 0 ? priceList : undefined)
  return { cart: next, changed, removed }
}

export function addToCart(product: Product, quantity: number = 1): CartItem[] {
  if (!hasValidCatalogPrice(product.price)) return getCart()
  const cart = getCart()
  const wasEmpty = cart.length === 0
  const p = withCommercialDefaults(product)
  const qty = clampValidQuantity(quantity, p)
  const existingIndex = cart.findIndex((item) => item.product.id === p.id)

  if (existingIndex >= 0) {
    const merged = cart[existingIndex].quantity + qty
    cart[existingIndex].quantity = clampValidQuantity(merged, p)
    cart[existingIndex].product = p
  } else {
    cart.push({ product: p, quantity: qty })
  }

  setCart(cart)
  if (wasEmpty) setCartPriceList(getSession()?.price_list)
  return cart
}

export function updateCartItem(productId: number, quantity: number): CartItem[] {
  const cart = getCart()
  const index = cart.findIndex((item) => item.product.id === productId)

  if (index >= 0) {
    const p = withCommercialDefaults(cart[index].product)
    if (quantity <= 0) {
      cart.splice(index, 1)
    } else {
      cart[index].quantity = clampValidQuantity(quantity, p)
      cart[index].product = p
    }
  }

  setCart(cart)
  return cart
}

export function removeFromCart(productId: number): CartItem[] {
  const cart = getCart().filter((item) => item.product.id !== productId)
  setCart(cart)
  if (cart.length === 0) setCartPriceList(undefined)
  return cart
}

export function clearCart(): void {
  setCart([])
  setCartPriceList(undefined)
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
