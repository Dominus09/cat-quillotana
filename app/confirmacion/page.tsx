'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle, ShoppingBag, FileText, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getSession } from '@/lib/session'

interface OrderData {
  id: number
  total: number
  created_at: string
  items: {
    variant_id: number
    product_name: string
    sku: string
    quantity: number
    price: number
  }[]
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

export default function ConfirmacionPage() {
  const router = useRouter()
  const [orderData, setOrderData] = useState<OrderData | null>(null)

  useEffect(() => {
    const session = getSession()
    if (!session) {
      router.push('/')
      return
    }

    const savedOrder = localStorage.getItem('quillotana_last_order')
    if (savedOrder) {
      setOrderData(JSON.parse(savedOrder))
    } else {
      router.push('/catalog')
    }
  }, [router])

  if (!orderData) {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--quillotana-light)] relative">
      {/* Background watermark */}
      <div className="fixed inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none z-0">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%201-gJM6SQT6MRQSxwUtV0PzXsCUPapEMO.png"
          alt=""
          width={600}
          height={600}
          className="w-[600px] h-[600px] object-contain"
        />
      </div>

      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Success header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--quillotana-blue)] mb-2">
              Pedido recibido correctamente
            </h1>
            <p className="text-muted-foreground">
              Tu pedido ha sido registrado y será procesado a la brevedad.
            </p>
          </div>

          {/* Order details card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-[var(--quillotana-blue)] flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detalles del pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Número de pedido</p>
                  <p className="font-semibold text-[var(--quillotana-blue)]">#{orderData.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium">{formatDate(orderData.created_at)}</p>
                </div>
              </div>

              <Separator />

              {/* Order items */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Productos</h4>
                {orderData.items.map((item) => (
                  <div key={item.variant_id} className="flex justify-between items-center py-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        SKU: {item.sku} | Cantidad: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-sm">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-[var(--quillotana-blue)]">Total</span>
                <span className="text-[var(--quillotana-red)]">{formatCurrency(orderData.total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              className="flex-1 bg-[var(--quillotana-red)] hover:bg-[var(--quillotana-red-dark)] text-white"
            >
              <Link href="/catalog">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Seguir comprando
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/mis-pedidos">
                <FileText className="h-4 w-4 mr-2" />
                Ver mis pedidos
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
