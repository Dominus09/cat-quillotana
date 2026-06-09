"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { X, Trash2, ShoppingBag } from "lucide-react"
import { SecQuantityControl } from "@/components/sec-quantity-control"
import { getSaleRuleLabel, withCommercialDefaults } from "@/lib/sale-quantity"
import {
  buildProductKeyContext,
  getProductReactKey,
} from "@/lib/product-key"
import type { CartItem } from "@/types/catalog"

interface CartPanelProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  onUpdateQuantity: (productId: number, quantity: number) => void
  onRemoveItem: (productId: number) => void
  onClearCart: () => void
}

/** Estructura lista para envío futuro (WhatsApp, API, etc.) */
export function buildOrderSummary(items: CartItem[]): {
  lines: string[]
  total: number
  text: string
} {
  const lines = items.map((i) => `${i.product.name} x ${i.quantity}`)
  const total = items.reduce(
    (s, i) => s + i.product.price * i.quantity,
    0
  )
  const text = `${lines.join("\n")}\n\nTotal: $${total.toLocaleString("es-CL")}`
  return { lines, total, text }
}

export function CartPanel({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartPanelProps) {
  const router = useRouter()

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  const itemCount = items.reduce((count, item) => count + item.quantity, 0)

  const cartKeyContext = useMemo(
    () => buildProductKeyContext(items.map((item) => item.product)),
    [items]
  )

  const handleContinueOrder = () => {
    onClose()
    router.push("/checkout")
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={onClose}
        />
      )}

      <div
        className={`
          fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border z-50 transform transition-transform duration-300 flex flex-col
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <ShoppingBag className="w-5 h-5 text-primary shrink-0" />
            <h2 className="font-semibold text-foreground truncate">
              Carrito ({itemCount} {itemCount === 1 ? "unidad" : "unidades"})
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingBag className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Tu carrito está vacío</p>
              <p className="text-sm text-muted-foreground mt-1">
                Agrega productos desde el catálogo
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => {
                const product = withCommercialDefaults(item.product)
                const subtotal = product.price * item.quantity
                return (
                  <div
                    key={getProductReactKey(item.product, index, cartKeyContext)}
                    className="flex gap-3 p-3 bg-muted rounded-lg"
                  >
                    <div className="w-16 h-16 rounded-md bg-neutral-100 overflow-hidden flex-shrink-0 ring-1 ring-black/[0.05] dark:bg-zinc-800 dark:ring-white/[0.08] dark:shadow-[inset_0_0_12px_rgba(0,0,0,0.25)]">
                      <Image
                        src={product.image || "/icon.svg"}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-contain p-1 dark:mix-blend-multiply dark:brightness-[0.96]"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/icon.svg"
                          target.className =
                            "w-full h-full object-contain opacity-40 p-2 dark:opacity-50"
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <div className="flex justify-between gap-2 items-start">
                        <div className="min-w-0">
                          <h4 className="font-medium text-foreground text-sm leading-snug line-clamp-2">
                            {product.name}
                          </h4>
                          <p className="text-[11px] text-muted-foreground uppercase tracking-wide line-clamp-1 mt-0.5">
                            {product.type}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {getSaleRuleLabel(product)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Precio unit.:{" "}
                            <span className="font-semibold text-foreground">
                              ${product.price.toLocaleString("es-CL")}
                            </span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.product.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive shrink-0 rounded-md hover:bg-background"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex flex-col gap-2 mt-1">
                        <SecQuantityControl
                          product={product}
                          quantity={item.quantity}
                          onQuantityChange={(qty) =>
                            onUpdateQuantity(item.product.id, qty)
                          }
                          disabled={product.stock <= 0}
                          showAdjustHint
                          containerClassName="flex items-stretch border border-border rounded-md bg-card overflow-hidden w-full max-w-none"
                          inputClassName="h-9 w-full min-w-[3rem] border-0 text-center text-sm font-semibold tabular-nums px-2 shadow-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                      </div>

                      <p className="text-sm font-semibold text-primary text-right">
                        Subtotal: ${subtotal.toLocaleString("es-CL")}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="shrink-0 border-t border-border p-4 space-y-4 bg-card">
            <div className="flex items-center justify-between text-lg font-bold">
              <span className="text-foreground">Total</span>
              <span className="text-primary">
                ${total.toLocaleString("es-CL")}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                className="w-full h-11 font-semibold bg-primary text-primary-foreground hover:bg-[#c90510]"
                onClick={handleContinueOrder}
              >
                Continuar pedido
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                onClick={onClearCart}
              >
                Vaciar carrito
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
