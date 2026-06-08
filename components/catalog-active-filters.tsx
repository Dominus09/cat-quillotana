"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  getCatalogStockFilterLabel,
  hasActiveCatalogFilters,
  type CatalogClientFilters,
  type CatalogStockFilter,
} from "@/lib/catalog-filters"

interface CatalogActiveFiltersProps {
  filters: CatalogClientFilters
  onSearchChange: (query: string) => void
  onCategoryChange: (category: string | null) => void
  onStockFilterChange: (filter: CatalogStockFilter) => void
  onClearAll: () => void
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <Badge
      variant="outline"
      className="gap-1.5 pl-2.5 pr-1 py-1 text-xs font-medium bg-muted/40 border-border"
    >
      <span className="max-w-[12rem] truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-sm p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
        aria-label={`Quitar filtro ${label}`}
      >
        <X className="w-3 h-3" />
      </button>
    </Badge>
  )
}

export function CatalogActiveFilters({
  filters,
  onSearchChange,
  onCategoryChange,
  onStockFilterChange,
  onClearAll,
}: CatalogActiveFiltersProps) {
  if (!hasActiveCatalogFilters(filters)) return null

  const stockLabel = getCatalogStockFilterLabel(filters.stockFilter)
  const search = filters.searchQuery.trim()

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {search ? (
        <FilterChip
          label={`Búsqueda: "${search}"`}
          onRemove={() => onSearchChange("")}
        />
      ) : null}

      {filters.selectedCategory ? (
        <FilterChip
          label={`Categoría: ${filters.selectedCategory}`}
          onRemove={() => onCategoryChange(null)}
        />
      ) : null}

      {stockLabel ? (
        <FilterChip
          label={`Stock: ${stockLabel}`}
          onRemove={() => onStockFilterChange("all")}
        />
      ) : null}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
        onClick={onClearAll}
      >
        Limpiar todo
      </Button>
    </div>
  )
}

export function getCatalogResultsLabel(
  count: number,
  filters: CatalogClientFilters
): string {
  const noun = count === 1 ? "producto" : "productos"
  if (hasActiveCatalogFilters(filters)) {
    const found = count === 1 ? "encontrado" : "encontrados"
    return `${count} ${noun} ${found} con los filtros actuales`
  }
  const avail = count === 1 ? "disponible" : "disponibles"
  return `${count} ${noun} ${avail}`
}
