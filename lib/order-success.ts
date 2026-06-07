import type { CreateOrderResponse } from "@/services/api"

export interface OrderSuccessMeta {
  clientName: string
  city?: string
  vendedor?: string
  priceList?: string
  documentType?: string
  paymentMethod?: string
}

const STORAGE_KEY = "quillotana_order_success"

function readNameLike(value: unknown): string | undefined {
  if (typeof value === "string") {
    const t = value.trim()
    return t || undefined
  }
  if (value && typeof value === "object") {
    const o = value as Record<string, unknown>
    for (const key of ["name", "nombre", "full_name", "label"]) {
      const v = o[key]
      if (typeof v === "string" && v.trim()) return v.trim()
    }
  }
  return undefined
}

function readStringField(
  body: Record<string, unknown>,
  keys: string[]
): string | undefined {
  for (const key of keys) {
    const v = body[key]
    if (typeof v === "string" && v.trim()) return v.trim()
  }
  return undefined
}

/** Extrae vendedor asignado si el backend lo incluye en POST /orders. */
export function extractAssignedSeller(
  response: CreateOrderResponse
): string | undefined {
  const body = response as Record<string, unknown>
  for (const key of [
    "vendedor",
    "vendedor_asignado",
    "assigned_seller",
    "seller",
    "vendor",
    "salesman",
    "assigned_vendor",
    "seller_name",
    "nombre_vendedor",
  ]) {
    const found = readNameLike(body[key])
    if (found) return found
  }
  return undefined
}

/** Ciudad desde respuesta de pedido (si el backend la devuelve). */
export function extractOrderCity(response: CreateOrderResponse): string | undefined {
  const body = response as Record<string, unknown>
  const direct = readStringField(body, [
    "city",
    "ciudad",
    "client_city",
    "customer_city",
  ])
  if (direct) return direct

  for (const nestedKey of ["client", "cliente", "customer"]) {
    const nested = body[nestedKey]
    if (nested && typeof nested === "object") {
      const c = nested as Record<string, unknown>
      const fromClient = readStringField(c, ["city", "ciudad"])
      if (fromClient) return fromClient
    }
  }
  return undefined
}

function extractClientNameFromResponse(
  response: CreateOrderResponse
): string | undefined {
  const body = response as Record<string, unknown>
  for (const nestedKey of ["client", "cliente", "customer"]) {
    const nested = body[nestedKey]
    const name = readNameLike(nested)
    if (name) return name
  }
  return readStringField(body, ["client_name", "nombre_cliente"])
}

export function buildOrderSuccessMeta(
  response: CreateOrderResponse,
  checkout: {
    clientName: string
    city: string
    priceList: string
    documentType: string
    paymentMethod: string
  }
): OrderSuccessMeta {
  const cityFromApi = extractOrderCity(response)
  const sessionCity = checkout.city.trim()

  return {
    clientName:
      extractClientNameFromResponse(response) ?? checkout.clientName.trim(),
    city: cityFromApi ?? (sessionCity || undefined),
    vendedor: extractAssignedSeller(response),
    priceList: checkout.priceList.trim() || undefined,
    documentType: checkout.documentType || undefined,
    paymentMethod: checkout.paymentMethod || undefined,
  }
}

export function saveOrderSuccessMeta(meta: OrderSuccessMeta): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(meta))
}

export function getOrderSuccessMeta(): OrderSuccessMeta | null {
  if (typeof window === "undefined") return null
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as OrderSuccessMeta
  } catch {
    return null
  }
}

const PRICE_LIST_LABELS: Record<string, string> = {
  factura: "Ruta Factura",
  comoditi: "Comoditi Boletas",
  melinka: "Melinka",
}

const DOCUMENT_LABELS: Record<string, string> = {
  factura: "Factura",
  boleta: "Boleta",
}

const PAYMENT_LABELS: Record<string, string> = {
  transferencia: "Transferencia",
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  cheque: "Cheque",
  otro: "Otro",
}

export function formatPriceListLabel(value: string | undefined): string {
  if (!value?.trim()) return "—"
  const key = value.trim().toLowerCase()
  return PRICE_LIST_LABELS[key] ?? value
}

export function formatDocumentTypeLabel(value: string | undefined): string {
  if (!value?.trim()) return "—"
  const key = value.trim().toLowerCase()
  return DOCUMENT_LABELS[key] ?? value
}

export function formatPaymentMethodLabel(value: string | undefined): string {
  if (!value?.trim()) return "—"
  const key = value.trim().toLowerCase()
  return PAYMENT_LABELS[key] ?? value
}
