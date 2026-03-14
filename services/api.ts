import type { Client, Product, Order, CreateOrderPayload } from '@/lib/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// -------------------------------------
// GET CATALOG
// -------------------------------------

export async function getProducts(): Promise<Product[]> {

  const res = await fetch(`${API_BASE_URL}/catalog`, {
    cache: "no-store"
  })

  const data = await res.json()

  return data.map((p: any) => ({
    product_id: p.variant_id,
    product_name: p.product,
    variant_id: p.variant_id,
    sku: p.barcode,
    price: p.default_price,
    stock: p.stock,
    product_type: p.product_type,
    image_url: p.image,
    company_id: 3
  }))
}

// -------------------------------------
// LOGIN CLIENT
// -------------------------------------

export async function loginClient(rut: string): Promise<Client | null> {

  const res = await fetch(`${API_BASE_URL}/client/login?rut=${rut}`)

  if (!res.ok) return null

  return res.json()
}

// -------------------------------------
// CREATE ORDER
// -------------------------------------

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {

  const res = await fetch(`${API_BASE_URL}/order/create`, {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify(payload)

  })

  return res.json()
}

// -------------------------------------
// GET CLIENT ORDERS
// -------------------------------------

export async function getClientOrders(clientId: number): Promise<Order[]> {

  const res = await fetch(`${API_BASE_URL}/client/orders?client_id=${clientId}`)

  return res.json()
}
