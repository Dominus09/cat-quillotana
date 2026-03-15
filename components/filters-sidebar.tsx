"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface FiltersSidebarProps {
  categories: string[]
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
  stockFilter: "all" | "available" | "low"
  onStockFilterChange: (filter: "all" | "available" | "low") => void
  isOpen: boolean
  onClose: () => void
}

export function FiltersSidebar({
  categories,
  selectedCategory,
  onCategoryChange,
  stockFilter,
  onStockFilterChange,
  isOpen,
  onClose,
}: FiltersSidebarProps) {
  const [categorySearch, setCategorySearch] = useState("")

  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  )

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 lg:relative lg:transform-none lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-4 h-full overflow-y-auto">
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h2 className="text-sm font-semibold text-gray-700">Filtros</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Categorías
            </h3>
            
            {/* Category Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar categoría"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="pl-9 h-9 text-sm bg-gray-50 border-gray-200"
              />
            </div>

            <div className="space-y-1">
              <button
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
          </div>

          {/* Stock Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Disponibilidad
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => onStockFilterChange("all")}
                className={cn(
                  "w-full text-left py-2 px-3 rounded-md text-sm transition-colors",
                  stockFilter === "all"
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                Todos
              </button>
              <button
                onClick={() => onStockFilterChange("available")}
                className={cn(
                  "w-full flex items-center gap-2 py-2 px-3 rounded-md text-sm transition-colors",
                  stockFilter === "available"
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Disponibles
              </button>
              <button
                onClick={() => onStockFilterChange("low")}
                className={cn(
                  "w-full flex items-center gap-2 py-2 px-3 rounded-md text-sm transition-colors",
                  stockFilter === "low"
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                Últimas unidades
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
