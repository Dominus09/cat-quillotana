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
  let filtered = products

  if (filters.searchQuery.trim()) {
    filtered = filtered.filter((p) =>
      matchesCatalogSearch(p, filters.searchQuery)
    )
  }

  if (filters.selectedCategory) {
    filtered = filtered.filter((p) => p.type === filters.selectedCategory)
  }

  if (filters.stockFilter === "available") {
    filtered = filtered.filter((p) => p.stock > 10)
  } else if (filters.stockFilter === "low") {
    filtered = filtered.filter((p) => p.stock > 0 && p.stock <= 10)
  }

  return filtered
}

export function getCatalogStockFilterLabel(
  stockFilter: CatalogStockFilter
): string | null {
  if (stockFilter === "available") return "Disponibles"
  if (stockFilter === "low") return "Últimas unidades"
  return null
}
