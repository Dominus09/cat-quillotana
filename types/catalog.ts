export interface Product {
  variant_id: number
  product_type: string
  product: string
  variant: string
  barcode: string
  stock: number
  prices: Record<string, number>
  default_price: number
  image: string
}

export interface ClientSession {
  client_id: number
  name: string
  price_list: string
  rut: string
  isTestMode: boolean
}

export interface CartItem {
  product: Product
  quantity: number
}
