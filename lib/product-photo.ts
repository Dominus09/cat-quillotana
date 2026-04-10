import type { Product } from "@/types/catalog"

const PLACEHOLDER_MARKERS = [
  "/icon.svg",
  "/placeholder2.webp",
  "/placeholder.png",
  "/logo-seal.png",
]

/** Nombres/rutas típicas de “imagen genérica” en backends. */
const API_PATH_PLACEHOLDER_HINTS = [
  "placeholder",
  "sin-foto",
  "sin_foto",
  "sinfoto",
  "no-image",
  "noimage",
  "no_foto",
  "nofoto",
  "default",
  "generico",
  "nodisponible",
  "no-disponible",
  "imagen_default",
  "imagen-default",
  "producto_sin",
  "sinimagen",
  "sin_imagen",
]

export function productUsesResolvedPlaceholderImage(image: string): boolean {
  const u = (image ?? "").trim().toLowerCase()
  if (!u) return true
  return PLACEHOLDER_MARKERS.some((m) => u.includes(m))
}

export function apiImagePathLooksLikePlaceholder(
  catalogImageRaw: string | undefined,
  resolvedImageUrl: string
): boolean {
  const combined = `${(catalogImageRaw ?? "").toLowerCase()} ${resolvedImageUrl.toLowerCase()}`
  return API_PATH_PLACEHOLDER_HINTS.some((h) => combined.includes(h))
}

/**
 * Con stock pero sin foto útil para catálogo.
 *
 * - API sin campo imagen → sin foto.
 * - URL resuelta a nuestros placeholders locales → sin foto.
 * - Ruta/URL con nombre típico de genérico → sin foto.
 * - Opcional: ids donde la sonda en el navegador no pudo cargar la imagen (404, timeout),
 *   alineado con lo que hace `ProductCard` al caer en placeholder.
 */
export function productInStockMissingCatalogPhoto(
  product: Product,
  brokenImageIds?: ReadonlySet<number>
): boolean {
  if (product.stock <= 0) return false
  if (brokenImageIds?.has(product.id)) return true
  if (product.imageFromApi === false) return true
  if (productUsesResolvedPlaceholderImage(product.image)) return true
  if (apiImagePathLooksLikePlaceholder(product.catalogImageRaw, product.image)) return true
  return false
}

function escapeCsvField(value: string): string {
  const s = value.replace(/"/g, '""')
  if (/[",\n\r]/.test(s)) return `"${s}"`
  return s
}

export function buildMissingPhotoCsvRows(
  products: Product[],
  brokenImageIds?: ReadonlySet<number>
): string {
  const header = [
    "tipo de producto",
    "codigo de barras",
    "stock",
    "detalle sin foto",
  ]
  const lines = products
    .filter((p) => productInStockMissingCatalogPhoto(p, brokenImageIds))
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
