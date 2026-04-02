import type { Product } from "@/types/catalog"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.quillotana.cl"

export interface LoginClientResponse {
  id: number
  name: string
  city: string
  is_melinka: boolean
}

export interface ApiCatalogItem {
  id: number
  name: string
  barcode: string
  price: number
  stock: number
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
      if (typeof body?.message === "string") message = body.message
      else if (typeof body?.error === "string") message = body.error
    } catch {
      // keep default message
    }
    throw new Error(message)
  }

  return res.json()
}

export function mapApiToProduct(item: ApiCatalogItem, price_list: string): Product {
  return {
    variant_id: item.id,
    product: item.name,
    variant: "",
    product_type: "General",
    barcode: item.barcode,
    prices: {
      [price_list]: item.price,
    },
    default_price: item.price,
    stock: item.stock,
    image: "/placeholder.png",
  }
}

export async function getCatalog(
  price_list: string,
  rut: string,
  in_stock?: boolean
): Promise<Product[]> {
  const params = new URLSearchParams({ price_list, rut })
  if (in_stock) {
    params.set("in_stock", "true")
  }

  const res = await fetch(`${API_URL}/api/catalog?${params.toString()}`)

  if (!res.ok) {
    throw new Error("Error loading catalog")
  }

  const raw: ApiCatalogItem[] = await res.json()
  return raw.map((item) => mapApiToProduct(item, price_list))
}
