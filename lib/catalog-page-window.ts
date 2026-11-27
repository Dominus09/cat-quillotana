import type { CatalogClientFilters } from "./catalog-filters"

export const CATALOG_PAGE_SIZE = 48

export function catalogFilterKey(filters: CatalogClientFilters, inStockOnly: boolean): string {
  return JSON.stringify([filters.searchQuery, filters.selectedCategory, filters.stockFilter, inStockOnly])
}

/** Bound mounted cards; full data and full search/count stay independent of the page. */
export function catalogPageWindow<T>(items: readonly T[], requestedPage: number) {
  const pageCount = Math.max(1, Math.ceil(items.length / CATALOG_PAGE_SIZE))
  const safePage = Number.isFinite(requestedPage) ? Math.trunc(requestedPage) : 0
  const page = Math.max(0, Math.min(safePage, pageCount - 1))
  const start = page * CATALOG_PAGE_SIZE
  const end = Math.min(items.length, start + CATALOG_PAGE_SIZE)
  return { page, pageCount, start, end, items: items.slice(start, end) }
}
