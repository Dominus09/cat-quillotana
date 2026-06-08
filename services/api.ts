import { parseSaleType } from "@/lib/sale-quantity"
import type { Product, SaleType } from "@/types/catalog"

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://api.quillotana.cl"
).replace(/\/+$/, "")

const IMAGE_FALLBACK = "/icon.svg"

export interface LoginClientResponse {
  id: number
  name: string
  city: string
  is_melinka: boolean
  is_catalog_admin?: boolean
}

export interface ApiCatalogItem {
  id: number
  name: string
  type: string
  barcode: string | null
  stock: number
  image: string | null
  price: number | null
  units_per_box?: number | null
  sale_type?: string | null
  quantity_step?: number | null
}

export interface CatalogHealthSummary {
  title: string
  total: number
  sin_fotografia: number
  sin_sec: number
  sin_tipo_venta: number
  sec_sin_quantity_step: number
  unitario_por_falta_sec: number
}

export type CatalogHealthStatus = "completo" | "incompleto" | "advertencia" | "critico"

export interface CatalogHealthDetailItem {
  variant_id: number
  barcode: string | null
  product_name: string
  has_photo: boolean
  sec: number | null
  sale_type: SaleType
  quantity_step: number
  auto_unitario_no_sec?: boolean
  missing_sale_type?: boolean
  missing_quantity_step?: boolean
  status: CatalogHealthStatus
  status_label: string
}

export interface CatalogHealthDetailResponse {
  items: CatalogHealthDetailItem[]
  limit: number
  offset: number
  count: number
}

function parseLoginErrorMessage(body: unknown): string | null {
  if (!body || typeof body !== "object") return null
  const o = body as Record<string, unknown>
  if (typeof o.detail === "string") return o.detail
  if (Array.isArray(o.detail) && o.detail[0] && typeof o.detail[0] === "object") {
    const first = o.detail[0] as Record<string, unknown>
    if (typeof first.msg === "string") return first.msg
  }
  if (typeof o.message === "string") return o.message
  if (typeof o.error === "string") return o.error
  return null
}

function parseOptionalPositiveInt(raw: unknown): number | null {
  if (raw == null || raw === "") return null
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return null
  return Math.floor(n)
}

function parseCreateOrderErrorMessage(body: unknown): string | null {
  if (!body || typeof body !== "object") return null
  const o = body as Record<string, unknown>
  const detail = o.detail
  if (detail && typeof detail === "object" && !Array.isArray(detail)) {
    const d = detail as Record<string, unknown>
    if (d.error === "Cantidad inválida") {
      if (typeof d.message === "string" && d.message.trim()) return d.message.trim()
      const product = typeof d.product === "string" ? d.product : "Producto"
      const step = d.required_step
      if (step != null) {
        return `${product} se vende en múltiplos de ${step} unidades`
      }
    }
    if (typeof d.message === "string" && d.message.trim()) return d.message.trim()
    if (typeof d.error === "string" && d.error.trim()) return d.error.trim()
  }
  if (typeof detail === "string" && detail.trim()) return detail.trim()
  if (typeof o.message === "string" && o.message.trim()) return o.message.trim()
  return null
}

export async function loginClient(rut: string): Promise<LoginClientResponse> {
  const res = await fetch(`${API_URL}/login-client`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rut }),
  })

  if (!res.ok) {
    let message = "No pudimos validar tu RUT. Verifica e intenta de nuevo."
    try {
      const body = await res.json()
      const parsed = parseLoginErrorMessage(body)
      if (parsed) message = parsed
    } catch {
      // keep default message
    }
    throw new Error(message)
  }

  return res.json()
}

/** Relativo → base API; absoluta → tal cual. */
function resolveImageUrl(imageFromApi: string | null | undefined): string {
  const t = imageFromApi?.trim()
  if (!t) return IMAGE_FALLBACK
  if (t.startsWith("http://") || t.startsWith("https://")) return t
  const path = t.startsWith("/") ? t : `/${t}`
  return `${API_URL}${path}`
}

export function mapApiToProduct(item: ApiCatalogItem): Product {
  const raw = (item.image ?? "").trim()
  return {
    id: item.id,
    name: (item.name ?? "").trim() || "Sin nombre",
    type: (item.type ?? "").trim() || "Sin categoría",
    image: resolveImageUrl(item.image),
    price: item.price ?? 0,
    stock: item.stock,
    barcode: (item.barcode ?? "").trim() || undefined,
    imageFromApi: !!raw,
    catalogImageRaw: raw || undefined,
    units_per_box: parseOptionalPositiveInt(item.units_per_box),
    sale_type: item.sale_type ? parseSaleType(item.sale_type) : "UNITARIO",
    quantity_step: parseOptionalPositiveInt(item.quantity_step) ?? 1,
  }
}

export async function getCatalog(
  price_list: string,
  in_stock?: boolean
): Promise<Product[]> {
  const params = new URLSearchParams({ price_list })
  if (in_stock) {
    params.set("in_stock", "true")
  }

  const res = await fetch(`${API_URL}/api/catalog?${params.toString()}`)

  if (!res.ok) {
    throw new Error("Error loading catalog")
  }

  const raw: ApiCatalogItem[] = await res.json()
  return raw.map(mapApiToProduct)
}

export interface CreateOrderClient {
  id: number
  name: string
  rut: string
}

export interface CreateOrderItem {
  id: number
  name: string
  barcode: string
  quantity: number
  price: number
}

export interface CreateOrderPayload {
  client: CreateOrderClient
  items: CreateOrderItem[]
  total: number
  price_list: string
  payment_method: string
  document_type: string
  contact_name: string
  contact_phone: string
  delivery_date: string
  notes: string
}

export type CreateOrderResponse = Record<string, unknown> & {
  id?: number
  order_id?: number
  number?: string | number
  order_number?: string | number
  /** Campos opcionales si el backend los incluye */
  vendedor?: string | { name?: string; nombre?: string }
  vendedor_asignado?: string | { name?: string; nombre?: string }
  city?: string
  ciudad?: string
  client?: { name?: string; city?: string; ciudad?: string }
}

export async function createOrder(
  orderData: CreateOrderPayload
): Promise<CreateOrderResponse> {
  const res = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  })

  if (!res.ok) {
    let message = "Error al crear pedido"
    try {
      const body = await res.json()
      const parsed = parseCreateOrderErrorMessage(body)
      if (parsed) message = parsed
    } catch {
      // keep default message
    }
    throw new Error(message)
  }

  return res.json()
}

export async function getCatalogHealthSummary(
  rut: string
): Promise<CatalogHealthSummary> {
  const qs = new URLSearchParams({ rut: rut.trim() })
  const res = await fetch(
    `${API_URL}/api/catalog/admin/health-summary?${qs.toString()}`
  )
  if (!res.ok) {
    throw new Error("No se pudo cargar el estado del catálogo")
  }
  return res.json()
}

export async function getCatalogHealthDetail(
  rut: string,
  params?: { limit?: number; offset?: number }
): Promise<CatalogHealthDetailResponse> {
  const qs = new URLSearchParams({ rut: rut.trim() })
  if (params?.limit != null) qs.set("limit", String(params.limit))
  if (params?.offset != null) qs.set("offset", String(params.offset))
  const res = await fetch(
    `${API_URL}/api/catalog/admin/health-detail?${qs.toString()}`
  )
  if (!res.ok) {
    throw new Error("No se pudo cargar el detalle del catálogo")
  }
  return res.json()
}
