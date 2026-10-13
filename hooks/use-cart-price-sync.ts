"use client"

import { useEffect, useState } from "react"
import { getCatalog } from "@/services/api"
import {
  cartNeedsReprice,
  repriceCart,
  type CartRepriceResult,
} from "@/lib/session"
import type { CartItem } from "@/types/catalog"

export type CartPriceNoticeData = Pick<CartRepriceResult, "changed" | "removed">

/** Recotiza el carrito guardado con los precios vigentes de `priceList`. */
export async function syncCartWithPriceList(
  priceList: string
): Promise<CartRepriceResult> {
  const products = await getCatalog(priceList)
  return repriceCart(products, priceList)
}

/**
 * Si el carrito fue cotizado con otra lista (p. ej. COMODITI en sesiones antiguas),
 * recalcula sus precios con la lista vigente del cliente y devuelve qué cambió.
 */
export function useCartPriceSync(
  priceList: string | undefined,
  onCartUpdated: (cart: CartItem[]) => void
): CartPriceNoticeData | null {
  const [notice, setNotice] = useState<CartPriceNoticeData | null>(null)

  useEffect(() => {
    if (!priceList || !cartNeedsReprice(priceList)) return
    let cancelled = false

    syncCartWithPriceList(priceList)
      .then((result) => {
        if (cancelled) return
        onCartUpdated(result.cart)
        if (result.changed.length > 0 || result.removed.length > 0) {
          setNotice({ changed: result.changed, removed: result.removed })
        }
      })
      .catch(() => {
        // Sin conexión: el carrito queda marcado como pendiente y el checkout lo bloquea.
      })

    return () => {
      cancelled = true
    }
  }, [priceList, onCartUpdated])

  return notice
}
