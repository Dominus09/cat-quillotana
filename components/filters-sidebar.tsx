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
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Stock</h3>

        <div className="flex items-start gap-2 py-2 px-1 mb-3 rounded-md hover:bg-gray-50">
          <Checkbox
            id="catalog-in-stock-api"
            checked={apiInStockOnly}
            onCheckedChange={(checked: boolean | "indeterminate") =>
              onApiInStockOnlyChange(checked === true)
            }
            className="mt-0.5"
          />
          <Label
            htmlFor="catalog-in-stock-api"
            className="text-sm text-gray-700 font-normal leading-snug cursor-pointer"
          >
            Solo productos con stock
          </Label>
        </div>

        <RadioGroup
          value={stockFilter}
          onValueChange={(v: string) =>
            onStockFilterChange(v as "all" | "available" | "low")
          }
          className="gap-2"
        >
          <div className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-gray-50">
            <RadioGroupItem value="all" id="stock-all" />
            <Label htmlFor="stock-all" className="font-normal cursor-pointer flex-1">
              Todos
            </Label>
          </div>
          <div className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-gray-50">
            <RadioGroupItem value="available" id="stock-avail" />
            <Label htmlFor="stock-avail" className="font-normal cursor-pointer flex-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              Disponibles
            </Label>
          </div>
          <div className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-gray-50">
            <RadioGroupItem value="low" id="stock-low" />
            <Label htmlFor="stock-low" className="font-normal cursor-pointer flex-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
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
        <AccordionItem value="categories" className="border-gray-200">
          <AccordionTrigger className="py-3 text-sm font-semibold text-gray-800 hover:no-underline">
            Categorías
          </AccordionTrigger>
          <AccordionContent>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar categoría"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="pl-9 h-9 text-sm bg-gray-50 border-gray-200"
              />
            </div>
            <div className="max-h-64 overflow-y-auto rounded-md border border-gray-100 bg-gray-50/50 pr-1 space-y-0.5">
              <button
                type="button"
                onClick={() => onCategoryChange(null)}
                className={cn(
                  "w-full text-left py-2 px-3 rounded-md text-sm transition-colors",
                  selectedCategory === null
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
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
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 flex flex-col shadow-lg transition-transform duration-300 lg:relative lg:shadow-none lg:max-h-none",
          "w-[min(100vw,20rem)] sm:max-w-sm lg:w-64",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0 lg:hidden">
          <h2 className="text-base font-semibold text-gray-900">Filtrar</h2>
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
            <h2 className="text-sm font-semibold text-gray-700">Filtros</h2>
          </div>
          {filterBody}
        </div>

        {isMobileDrawer && (
          <div className="shrink-0 border-t border-gray-200 bg-white p-3 space-y-2 lg:hidden">
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
              onClick={() => {
                handleClear()
              }}
            >
              Limpiar
            </Button>
          </div>
        )}
      </aside>
    </>
  )
}
