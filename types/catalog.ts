export interface Product {
  id: number
  name: string
  type: string
  image: string
  price: number
  stock: number
  /** Desde API catálogo; opcional en ítems antiguos del carrito. */
  barcode?: string
}

export interface ClientSession {
  client_id: number
  name: string
  /** Solo tras elegir factura/comoditi o si es cliente Melinka ("melinka"). */
  price_list?: string
  rut: string
  city: string
  is_melinka: boolean
  isTestMode?: boolean
}

export interface CartItem {
  product: Product
  quantity: number
}
