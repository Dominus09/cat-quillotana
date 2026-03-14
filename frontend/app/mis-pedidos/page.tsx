'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, FileText, Download, Eye, ShoppingBag, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Empty } from '@/components/ui/empty'
import { ClientHeader } from '@/components/client-header'
import { CartPanel } from '@/components/cart-panel'
import { LoadingScreen } from '@/components/loading-screen'
import { getSession } from '@/lib/session'
import { getClientOrders } from '@/services/api'
import type { Order } from '@/lib/types'

interface OrderWithItems extends Order {
  items?: {
    variant_id: number
    product_name?: string
    sku?: string
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
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString))
}

function formatDateLong(dateString: string): string {
  return new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

function getStatusBadge(status: string) {
  switch (status.toUpperCase()) {
    case 'PENDIENTE':
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pendiente</Badge>
    case 'PROCESANDO':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Procesando</Badge>
    case 'COMPLETADO':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completado</Badge>
    case 'CANCELADO':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelado</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function MisPedidosPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => {
    const session = getSession()
    if (!session) {
      router.push('/')
      return
    }

    async function loadOrders() {
      try {
        const data = await getClientOrders(session!.client_id)
        setOrders(data)
      } catch (error) {
        console.error('Error loading orders:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadOrders()
  }, [router])

  const handleViewDetail = (order: OrderWithItems) => {
    setSelectedOrder(order)
    setDetailOpen(true)
  }

  const handleDownloadCSV = (order: OrderWithItems) => {
    if (!order.items) return

    const headers = ['SKU', 'Producto', 'Cantidad', 'Precio Unitario', 'Subtotal']
    const rows = order.items.map((item) => [
      item.sku || '',
      item.product_name || `Producto ${item.variant_id}`,
      item.quantity.toString(),
      item.price.toString(),
      (item.price * item.quantity).toString(),
    ])

    const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    rows.push(['', '', '', 'TOTAL', total.toString()])

    const csvContent = [
      `Pedido #${order.id}`,
      `Fecha: ${formatDateLong(order.created_at)}`,
      '',
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `pedido-${order.id}.csv`
    link.click()
  }

  if (isLoading) {
    return <LoadingScreen />
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

      <ClientHeader onCartClick={() => setCartOpen(true)} />

      <main className="container mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button asChild variant="ghost" size="icon">
            <Link href="/catalog">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--quillotana-blue)]">Mis pedidos</h1>
            <p className="text-muted-foreground">Historial de pedidos realizados</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <Empty
                icon={Package}
                title="No tienes pedidos"
                description="Aún no has realizado ningún pedido. Explora nuestro catálogo para comenzar."
              >
                <Button asChild className="mt-4 bg-[var(--quillotana-red)] hover:bg-[var(--quillotana-red-dark)] text-white">
                  <Link href="/catalog">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Ir al catálogo
                  </Link>
                </Button>
              </Empty>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-[var(--quillotana-blue)] flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Historial de pedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Pedido</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{formatDate(order.created_at)}</TableCell>
                        <TableCell className="font-semibold text-[var(--quillotana-red)]">
                          {formatCurrency(order.total || order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0)}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(order)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                            {order.items && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadCSV(order)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                CSV
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-[var(--quillotana-blue)]">#{order.id}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{formatDate(order.created_at)}</p>
                    <p className="font-bold text-[var(--quillotana-red)] mb-3">
                      {formatCurrency(order.total || order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0)}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewDetail(order)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver detalle
                      </Button>
                      {order.items && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadCSV(order)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Order detail dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[var(--quillotana-blue)]">
              Pedido #{selectedOrder?.id}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium">{formatDateLong(selectedOrder.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
              </div>

              <Separator />

              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">Productos</h4>
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {item.product_name || `Producto ${item.variant_id}`}
                        </p>
                        {item.sku && (
                          <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Cantidad: {item.quantity} x {formatCurrency(item.price)}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No hay detalles disponibles para este pedido.</p>
              )}

              <Separator />

              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-[var(--quillotana-blue)]">Total</span>
                <span className="text-[var(--quillotana-red)]">
                  {formatCurrency(
                    selectedOrder.total ||
                    selectedOrder.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ||
                    0
                  )}
                </span>
              </div>

              {selectedOrder.items && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleDownloadCSV(selectedOrder)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar pedido (CSV)
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cart panel */}
      <CartPanel open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  )
}
