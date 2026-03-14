'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Empty } from '@/components/ui/empty'
import { getCart, updateCartQuantity, removeFromCart, clearCart, getCartTotal } from '@/lib/cart'
import { getSession } from '@/lib/session'
import { createOrder } from '@/services/api'
import type { CartItem } from '@/lib/types'
import { toast } from 'sonner'

interface CartPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function CartPanel({ open, onOpenChange }: CartPanelProps) {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setItems(getCart())
    }
  }, [open])

  useEffect(() => {
    const handleCartUpdate = () => {
      setItems(getCart())
    }
    
    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [])

  const handleUpdateQuantity = (variantId: number, newQuantity: number) => {
    const updated = updateCartQuantity(variantId, newQuantity)
    setItems(updated)
    window.dispatchEvent(new CustomEvent('cartUpdated'))
  }

  const handleRemove = (variantId: number) => {
    const updated = removeFromCart(variantId)
    setItems(updated)
    window.dispatchEvent(new CustomEvent('cartUpdated'))
    toast.info('Producto eliminado del carrito')
  }

  const handleClearCart = () => {
    clearCart()
    setItems([])
    window.dispatchEvent(new CustomEvent('cartUpdated'))
    toast.info('Carrito vaciado')
  }

  const handleConfirmOrder = async () => {
    const session = getSession()
    if (!session) {
      router.push('/')
      return
    }

    setIsSubmitting(true)

    try {
      const order = await createOrder({
        client_id: session.client_id,
        company_id: 3,
        office_id: 1,
        items: items.map((item) => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.price,
        })),
      })

      // Store order info for confirmation page
      localStorage.setItem('quillotana_last_order', JSON.stringify({
        id: order.id,
        total: getCartTotal(items),
        created_at: order.created_at,
        items: items,
      }))

      clearCart()
      setItems([])
      window.dispatchEvent(new CustomEvent('cartUpdated'))
      onOpenChange(false)
      router.push('/confirmacion')
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Error al crear el pedido. Intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const total = getCartTotal(items)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-[var(--quillotana-blue)] flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Carrito de compras
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <Empty
              icon={ShoppingBag}
              title="Tu carrito está vacío"
              description="Agrega productos para comenzar tu pedido"
            />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.variant_id} className="flex gap-3 bg-muted/50 rounded-lg p-3">
                    <div className="w-16 h-16 bg-card rounded-md overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.product_name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%201-gJM6SQT6MRQSxwUtV0PzXsCUPapEMO.png"
                            alt="Quillotana"
                            width={32}
                            height={32}
                            className="opacity-30"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-[var(--quillotana-blue)] line-clamp-2">
                        {item.product_name}
                      </h4>
                      <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                      <p className="text-sm font-semibold text-[var(--quillotana-red)] mt-1">
                        {formatCurrency(item.price)}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-border rounded-md bg-card">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleUpdateQuantity(item.variant_id, item.quantity - 1)}
                            aria-label="Disminuir cantidad"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleUpdateQuantity(item.variant_id, item.quantity + 1)}
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleRemove(item.variant_id)}
                            aria-label="Eliminar producto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <div className="flex items-center justify-between text-lg font-bold">
                <span className="text-[var(--quillotana-blue)]">Total</span>
                <span className="text-[var(--quillotana-red)]">{formatCurrency(total)}</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleClearCart}
                  disabled={isSubmitting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Vaciar carrito
                </Button>
                <Button
                  className="flex-1 bg-[var(--quillotana-red)] hover:bg-[var(--quillotana-red-dark)] text-white"
                  onClick={handleConfirmOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Spinner className="h-4 w-4" />
                      Procesando...
                    </span>
                  ) : (
                    'Confirmar pedido'
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
