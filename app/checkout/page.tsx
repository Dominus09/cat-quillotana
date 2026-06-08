"use client"

import { useEffect, useState, useMemo, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LoadingScreen } from "@/components/loading-screen"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  getSession,
  getCart,
  getCartTotal,
  clearCart,
} from "@/lib/session"
import { LOGO_MAIN_SRC } from "@/lib/branding-assets"
import { createOrder } from "@/services/api"
import { buildOrderSuccessMeta, saveOrderSuccessMeta } from "@/lib/order-success"
import { validateCartForCheckout } from "@/lib/sale-quantity"
import { OrderCommercialSummary } from "@/components/order-commercial-summary"
import type { CartItem } from "@/types/catalog"

export default function CheckoutPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [session, setSession] = useState<ReturnType<typeof getSession>>(null)

  const [paymentMethod, setPaymentMethod] = useState("")
  const [documentType, setDocumentType] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [deliveryDate, setDeliveryDate] = useState("")
  const [notes, setNotes] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [quantityErrors, setQuantityErrors] = useState<string[]>([])

  useEffect(() => {
    setMounted(true)
    const s = getSession()
    if (!s) {
      router.replace("/")
      return
    }
    if (!s.price_list?.trim()) {
      router.replace("/select-price-list")
      return
    }
    const c = getCart()
    if (c.length === 0) {
      router.replace("/catalog")
      return
    }
    setSession(s)
    setCart(c)
  }, [router])

  const total = useMemo(() => getCartTotal(cart), [cart])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setQuantityErrors([])

    if (submitting) return

    if (cart.length === 0) {
      setError("El carrito está vacío.")
      return
    }

    const qtyCheck = validateCartForCheckout(cart)
    if (!qtyCheck.valid) {
      setQuantityErrors(qtyCheck.messages)
      setError("Hay productos con cantidades no válidas.")
      return
    }

    const phone = contactPhone.trim()
    if (!phone) {
      setError("El teléfono de contacto es obligatorio.")
      return
    }

    if (!documentType) {
      setError("Selecciona el tipo de documento.")
      return
    }

    if (!paymentMethod) {
      setError("Selecciona la forma de pago.")
      return
    }

    if (!session) {
      setError("Sesión no válida. Vuelve a iniciar sesión.")
      return
    }

    const order = {
      client: {
        id: session.client_id,
        name: session.name,
        rut: session.rut,
      },
      items: cart.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        barcode: item.product.barcode ?? "",
        quantity: item.quantity,
        price: item.product.price,
      })),
      total,
      price_list: session.price_list ?? "",
      payment_method: paymentMethod,
      document_type: documentType,
      contact_name: contactName.trim(),
      contact_phone: phone,
      delivery_date: deliveryDate,
      notes: notes.trim(),
    }

    setSubmitting(true)
    try {
      const res = await createOrder(order)
      saveOrderSuccessMeta(
        buildOrderSuccessMeta(res, {
          clientName: session.name,
          city: session.city,
          priceList: session.price_list ?? "",
          documentType,
          paymentMethod,
        })
      )
      clearCart()
      const orderNum =
        res.id ??
        res.order_id ??
        res.number ??
        (typeof res.order_number === "number" ? res.order_number : undefined)
      const q =
        orderNum !== undefined && orderNum !== null && orderNum !== ""
          ? `?id=${encodeURIComponent(String(orderNum))}`
          : ""
      router.push(`/success${q}`)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al generar pedido"
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (!mounted || !session) {
    return <LoadingScreen />
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="mb-6 text-center">
          <Image
            src={LOGO_MAIN_SRC}
            alt="Distribuidora La Quillotana"
            width={160}
            height={80}
            className="object-contain mx-auto mb-4"
          />
          <h1 className="text-xl font-bold text-foreground">Checkout</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Confirma los datos para generar tu pedido
          </p>
        </div>

        <div
          className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 shadow-sm"
          role="note"
        >
          <p className="font-semibold text-amber-900 mb-1.5 flex items-start gap-1.5">
            <span className="shrink-0" aria-hidden>
              ⚠️
            </span>
            <span>IMPORTANTE:</span>
          </p>
          <p className="leading-snug text-[13px] sm:text-sm text-amber-950/95">
            Los precios mostrados son referenciales. Los precios finales pueden
            variar según volumen de compra y acuerdos comerciales. Un vendedor
            enviará la orden de compra definitiva con precios actualizados.
          </p>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 mb-6 space-y-2 text-sm">
          <p className="font-medium text-foreground">
            Total:{" "}
            <span className="text-primary font-bold">
              ${total.toLocaleString("es-CL")}
            </span>
          </p>
          <p className="text-muted-foreground">
            {cart.length} línea{cart.length !== 1 ? "s" : ""} en el carrito
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="document_type">Tipo de documento *</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger id="document_type" className="w-full">
                <SelectValue placeholder="Selecciona tipo de documento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="factura">Factura</SelectItem>
                <SelectItem value="boleta">Boleta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">Forma de pago *</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="payment_method" className="w-full">
                <SelectValue placeholder="Selecciona forma de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transferencia">Transferencia</SelectItem>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="tarjeta">Tarjeta</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_name">Nombre de contacto</Label>
            <Input
              id="contact_name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Nombre quien recibe / coordina"
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_phone">Teléfono *</Label>
            <Input
              id="contact_phone"
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+56 9 1234 5678"
              required
              autoComplete="tel"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_date">Fecha de entrega deseada</Label>
            <Input
              id="delivery_date"
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Indicaciones adicionales para el pedido"
              rows={3}
              className="resize-none"
            />
          </div>

          {error && (
            <div className="space-y-2">
              <p className="text-sm text-destructive text-center">{error}</p>
              {quantityErrors.length > 0 ? (
                <ul className="text-sm text-destructive/90 list-disc pl-5 space-y-1">
                  {quantityErrors.map((msg) => (
                    <li key={msg}>{msg}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}

          <OrderCommercialSummary
            variant="checkout"
            clientName={session.name}
            city={session.city}
            priceList={session.price_list}
            documentType={documentType}
            paymentMethod={paymentMethod}
          />

          <Button
            type="submit"
            className="w-full h-12 font-semibold bg-primary text-primary-foreground hover:bg-[#c90510]"
            disabled={submitting || cart.length === 0}
          >
            {submitting ? "Generando pedido…" : "Generar pedido"}
          </Button>

          <Button type="button" variant="outline" className="w-full" asChild>
            <Link href="/catalog">Volver al catálogo</Link>
          </Button>
        </form>
      </div>
    </main>
  )
}
