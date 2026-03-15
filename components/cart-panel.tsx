"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react"
import type { CartItem } from "@/types/catalog"

interface CartPanelProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  priceList: string
  onUpdateQuantity: (variantId: number, quantity: number) => void
  onRemoveItem: (variantId: number) => void
  onClearCart: () => void
}

export function CartPanel({
  isOpen,
  onClose,
  items,
  priceList,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartPanelProps) {
  const total = items.reduce((sum, item) => {
    const price = item.product.prices[priceList] || item.product.default_price
    return sum + price * item.quantity
  }, 0)

  const itemCount = items.reduce((count, item) => count + item.quantity, 0)

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border z-50 transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">
                Carrito ({itemCount} {itemCount === 1 ? "item" : "items"})
              </h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Tu carrito está vacío</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Agrega productos desde el catálogo
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const price =
                    item.product.prices[priceList] || item.product.default_price
                  return (
                    <div
                      key={item.product.variant_id}
                      className="flex gap-3 p-3 bg-muted rounded-lg"
                    >
                      {/* Product Image */}
                      <div className="w-16 h-16 rounded-md bg-card overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.image}
                          alt={item.product.product}
                          width={64}
                          height={64}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/logo-seal.png"
                            target.className = "w-full h-full object-contain opacity-30 p-2"
                          }}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground text-sm line-clamp-1">
                          {item.product.product}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {item.product.variant}
                        </p>
                        <p className="text-sm font-semibold text-primary mt-1">
                          ${price.toLocaleString("es-CL")} c/u
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-border rounded-md bg-card">
                            <button
                              onClick={() =>
                                onUpdateQuantity(
                                  item.product.variant_id,
                                  item.quantity - 1
                                )
                              }
                              className="p-1 text-muted-foreground hover:text-foreground"
                              aria-label="Disminuir cantidad"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                onUpdateQuantity(
                                  item.product.variant_id,
                                  item.quantity + 1
                                )
                              }
                              disabled={item.quantity >= item.product.stock}
                              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
                              aria-label="Aumentar cantidad"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.product.variant_id)}
                            className="p-1 text-muted-foreground hover:text-destructive"
                            aria-label="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 border-t border-border space-y-4">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span className="text-foreground">Total:</span>
                <span className="text-primary">
                  ${total.toLocaleString("es-CL")}
                </span>
              </div>

              <div className="space-y-2">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-[#c90510]">
                  Finalizar pedido
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={onClearCart}
                >
                  Vaciar carrito
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
