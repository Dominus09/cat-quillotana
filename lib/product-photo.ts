import type { Product } from "@/types/catalog"

const PLACEHOLDER_MARKERS = [
  "/icon.svg",
  "/placeholder2.webp",
  "/placeholder.png",
  "/logo-seal.png",
]

export function productUsesResolvedPlaceholderImage(image: string): boolean {
  const u = (image ?? "").trim().toLowerCase()
  if (!u) return true
  return PLACEHOLDER_MARKERS.some((m) => u.includes(m))
}

/** Con stock en catálogo pero sin imagen en API o con URL resuelta a placeholder. */
export function productInStockMissingCatalogPhoto(product: Product): boolean {
  if (product.stock <= 0) return false
  if (product.imageFromApi === false) return true
  if (product.imageFromApi === true) return false
  return productUsesResolvedPlaceholderImage(product.image)
}

function escapeCsvField(value: string): string {
  const s = value.replace(/"/g, '""')
  if (/[",\n\r]/.test(s)) return `"${s}"`
  return s
}

export function buildMissingPhotoCsvRows(products: Product[]): string {
  const header = [
    "tipo de producto",
    "codigo de barras",
    "stock",
    "detalle sin foto",
  ]
  const lines = products
    .filter(productInStockMissingCatalogPhoto)
    .map((p) =>
      [
        escapeCsvField(p.type),
        escapeCsvField(p.barcode ?? ""),
        String(p.stock),
        escapeCsvField(p.name),
      ].join(",")
    )
  return [header.join(","), ...lines].join("\r\n")
}
