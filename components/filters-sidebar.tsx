"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { X, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface FiltersSidebarProps {
  categories: string[]
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
  stockFilter: "all" | "available" | "low"
  onStockFilterChange: (filter: "all" | "available" | "low") => void
  apiInStockOnly: boolean
  onApiInStockOnlyChange: (value: boolean) => void
  isOpen: boolean
  onClose: () => void
  /** Drawer móvil: pie con Aplicar / Limpiar y sin cerrar al tocar un filtro */
  isMobileDrawer?: boolean
  onClearFilters?: () => void
}

export function FiltersSidebar({
  categories,
  selectedCategory,
  onCategoryChange,
  stockFilter,
  onStockFilterChange,
  apiInStockOnly,
  onApiInStockOnlyChange,
  isOpen,
  onClose,
  isMobileDrawer = false,
  onClearFilters,
}: FiltersSidebarProps) {
  const [categorySearch, setCategorySearch] = useState("")

  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  )

  const handleClear = () => {
    onClearFilters?.()
  }

  const filterBody = (
    <>
      {/* 1. Stock */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">Stock</h3>

        <div className="flex items-start gap-2 py-2 px-1 mb-3 rounded-md hover:bg-muted/80">
          <Checkbox
            id="catalog-show-without-stock"
            checked={!apiInStockOnly}
            onCheckedChange={(checked: boolean | "indeterminate") =>
              onApiInStockOnlyChange(checked !== true)
            }
            className="mt-0.5"
          />
          <Label
            htmlFor="catalog-show-without-stock"
            className="text-sm text-foreground/90 font-normal leading-snug cursor-pointer"
          >
            Visualizar productos sin stock
          </Label>
        </div>

        <RadioGroup
          value={stockFilter}
          onValueChange={(v: string) =>
            onStockFilterChange(v as "all" | "available" | "low")
          }
          className="gap-2"
        >
          <div className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/80">
            <RadioGroupItem value="all" id="stock-all" />
            <Label htmlFor="stock-all" className="font-normal cursor-pointer flex-1 text-foreground/90">
              Todos
            </Label>
          </div>
          <div className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/80">
            <RadioGroupItem value="available" id="stock-avail" />
            <Label htmlFor="stock-avail" className="font-normal cursor-pointer flex-1 flex items-center gap-2 text-foreground/90">
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0 dark:bg-green-400" />
              Disponibles
            </Label>
          </div>
          <div className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/80">
            <RadioGroupItem value="low" id="stock-low" />
            <Label htmlFor="stock-low" className="font-normal cursor-pointer flex-1 flex items-center gap-2 text-foreground/90">
              <span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0 dark:bg-yellow-400" />
              Últimas unidades
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* 2. Categorías (accordion) */}
      <Accordion
        type="single"
        collapsible
        defaultValue="categories"
        className="border-0"
      >
        <AccordionItem value="categories" className="border-border">
          <AccordionTrigger className="py-3 text-sm font-semibold text-foreground hover:no-underline">
            Categorías
          </AccordionTrigger>
          <AccordionContent>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar categoría"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="pl-9 h-9 text-sm bg-background border-border dark:bg-zinc-900/60"
              />
            </div>
            <div className="max-h-64 overflow-y-auto rounded-md border border-border bg-muted/25 pr-1 space-y-0.5 dark:bg-zinc-900/35 dark:border-zinc-700/50">
              <button
                type="button"
                onClick={() => onCategoryChange(null)}
                className={cn(
                  "w-full text-left py-2 px-3 rounded-md text-sm transition-colors",
                  selectedCategory === null
                    ? "bg-primary/12 text-primary font-semibold ring-1 ring-inset ring-primary/25 dark:bg-primary/18 dark:text-primary dark:ring-primary/35"
                    : "text-muted-foreground hover:bg-muted/90 hover:text-foreground"
                )}
              >
                Todas las categorías
              </button>
              {filteredCategories.map((category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() => onCategoryChange(category)}
                  className={cn(
                    "w-full text-left py-2 px-3 rounded-md text-sm transition-colors",
                    selectedCategory === category
                      ? "bg-primary/12 text-primary font-semibold ring-1 ring-inset ring-primary/25 dark:bg-primary/18 dark:text-primary dark:ring-primary/35"
                      : "text-muted-foreground hover:bg-muted/90 hover:text-foreground"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  )

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden dark:bg-black/70"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-card text-card-foreground border-r border-border z-50 flex flex-col shadow-lg transition-transform duration-300 lg:relative lg:shadow-none lg:max-h-none",
          "w-[min(100vw,20rem)] sm:max-w-sm lg:w-[240px] lg:max-w-[260px]",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0 lg:hidden">
          <h2 className="text-base font-semibold text-foreground">Filtrar</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div
          className={cn(
            "flex-1 min-h-0 overflow-y-auto p-4",
            isMobileDrawer && "pb-2"
          )}
        >
          <div className="hidden lg:block mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground">Filtros</h2>
          </div>
          {filterBody}
        </div>

        {isMobileDrawer && (
          <div className="shrink-0 border-t border-border bg-card p-3 space-y-2 lg:hidden">
            <Button
              type="button"
              className="w-full h-11 font-semibold bg-primary text-primary-foreground hover:bg-[#c90510]"
              onClick={onClose}
            >
              Aplicar filtros
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full h-11"
              onClick={handleClear}
            >
              Limpiar filtros
            </Button>
          </div>
        )}

        {!isMobileDrawer && onClearFilters ? (
          <div className="hidden lg:block shrink-0 border-t border-border p-4 pt-3">
            <Button
              type="button"
              variant="outline"
              className="w-full h-9 text-sm"
              onClick={handleClear}
            >
              Limpiar filtros
            </Button>
          </div>
        ) : null}
      </aside>
    </>
  )
}
