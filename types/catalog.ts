export type SaleType = "ENTERA" | "PARCIAL" | "UNITARIO"

export interface Product {
  id: number
  name: string
  type: string
  image: string
  price: number
  stock: number
  /** Desde API catálogo; opcional en ítems antiguos del carrito. */
  barcode?: string
  /** La API envió una ruta/URL de imagen no vacía. */
  imageFromApi?: boolean
  /** Valor crudo de `image` en la API (antes de resolver URL), para heurísticas. */
  catalogImageRaw?: string
  units_per_box?: number | null
  sale_type?: SaleType | null
  quantity_step?: number | null
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
  is_catalog_admin?: boolean
}

export interface CartItem {
  product: Product
  quantity: number
}
