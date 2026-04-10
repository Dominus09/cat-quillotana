import type { Product } from "@/types/catalog"

/** Normaliza `type` del catálogo para comparar con la lista de exclusiones. */
export function normalizeCatalogCategoryType(type: string): string {
  return type
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s*\/\s*/g, "/")
    .replace(/\s+/g, " ")
}

/**
 * Categorías que no aplican a lista comoditi (solo IVA u otras reglas en backend).
 * Nombres alineados al negocio; la API puede variar mayúsculas / acentos.
 */
const COMODITI_EXCLUDED_LABELS = [
  "abarrotes",
  "agua mineral",
  "aguas minerales",
  "alimento mascotas",
  "aseo/hogar",
  "bazar",
  "bazar/paqueteria/escritorio",
  "confiteria",
  "galletas",
  "isotonic",
  "isotonicas",
  "isotonicos",
  "lacteos",
  "nectar/jugos liq",
  "otros",
  "perfum/belleza",
  "perfume/belleza",
  "perfum/belleza/farmacia",
  "snacks",
] as const

const COMODITI_EXCLUDED_TYPES = new Set(
  COMODITI_EXCLUDED_LABELS.map((s) => normalizeCatalogCategoryType(s))
)

function isComoditiExcludedType(type: string): boolean {
  return COMODITI_EXCLUDED_TYPES.has(normalizeCatalogCategoryType(type))
}

/**
 * Lista **comoditi**:
 * - Se ocultan categorías que no llevan precio comoditi real (abarrotes, aguas, etc.).
 * - Se ocultan productos con precio $1 (marcador solo IVA en API).
 */
export function filterProductsForPriceList(
  products: Product[],
  priceList: string | undefined
): Product[] {
  if (priceList?.trim().toLowerCase() !== "comoditi") return products
  return products.filter((p) => {
    if (p.price === 1) return false
    if (isComoditiExcludedType(p.type)) return false
    return true
  })
}
