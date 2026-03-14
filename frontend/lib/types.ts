export interface Client {
  client_id: number
  name: string
  price_list_id: number
  phone?: string
  email?: string
  rut: string
  company_id: number
  office_id: number
}

export interface Product {
  product_id: number
  product_name: string
  variant_id: number
  sku: string
  image_url?: string
  price: number
  stock: number
  product_type: string
  company_id: number
}

export interface CartItem {
  variant_id: number
  product_name: string
  sku: string
  price: number
  quantity: number
  image_url?: string
}

export interface Order {
  id: number
  client_id: number
  company_id: number
  office_id: number
  created_at: string
  status: string
  total?: number
  items?: OrderItem[]
}

export interface OrderItem {
  id: number
  order_id: number
  variant_id: number
  product_name?: string
  sku?: string
  quantity: number
  price: number
}

export interface CreateOrderPayload {
  client_id: number
  company_id: number
  office_id: number
  items: {
    variant_id: number
    quantity: number
    price: number
  }[]
}
