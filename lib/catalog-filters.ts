import type { Product } from "@/types/catalog"

/** Normaliza `type` del catálogo (mayúsculas, acentos, separadores) para comparar. */
export function normalizeCatalogCategoryType(type: string): string {
  return type
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s*\/\s*/g, "/")
    .replace(/\s+/g, " ")
}

export type CatalogStockFilter = "all" | "available" | "low"

export interface CatalogClientFilters {
  searchQuery: string
  selectedCategory: string | null
  stockFilter: CatalogStockFilter
}

export function matchesCatalogSearch(product: Product, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    product.name.toLowerCase().includes(q) ||
    product.type.toLowerCase().includes(q) ||
    (product.barcode ?? "").toLowerCase().includes(q)
  )
}

export function hasActiveCatalogFilters(filters: CatalogClientFilters): boolean {
  return !!(
    filters.searchQuery.trim() ||
    filters.selectedCategory ||
    filters.stockFilter !== "all"
  )
}

export function filterCatalogProducts(
  products: Product[],
  filters: CatalogClientFilters
): Product[] {
  const q = filters.searchQuery.trim().toLowerCase()
  if (!q && !filters.selectedCategory && filters.stockFilter === "all") return products
  return products.filter(p => {
    if (filters.selectedCategory && p.type !== filters.selectedCategory) return false
    if (filters.stockFilter === "available" && !(p.stock > 10)) return false
    if (filters.stockFilter === "low" && !(p.stock > 0 && p.stock <= 10)) return false
    return !q || p.name.toLowerCase().includes(q) || p.type.toLowerCase().includes(q) || (p.barcode ?? "").toLowerCase().includes(q)
  })
}

export function getCatalogStockFilterLabel(
  stockFilter: CatalogStockFilter
): string | null {
  if (stockFilter === "available") return "Disponibles"
  if (stockFilter === "low") return "Últimas unidades"
  return null
}
