'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'

export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc'

interface FiltersSidebarProps {
  categories: string[]
  selectedCategories: string[]
  onCategoryChange: (categories: string[]) => void
  showOnlyStock: boolean
  onShowOnlyStockChange: (value: boolean) => void
  showOnlyOffers: boolean
  onShowOnlyOffersChange: (value: boolean) => void
  sortBy: SortOption
  onSortChange: (value: SortOption) => void
}

export function FiltersSidebar({
  categories,
  selectedCategories,
  onCategoryChange,
  showOnlyStock,
  onShowOnlyStockChange,
  showOnlyOffers,
  onShowOnlyOffersChange,
  sortBy,
  onSortChange,
}: FiltersSidebarProps) {
  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter((c) => c !== category))
    } else {
      onCategoryChange([...selectedCategories, category])
    }
  }

  return (
    <aside className="w-full lg:w-64 bg-card rounded-lg border border-border p-4 h-fit sticky top-20">
      <h2 className="font-semibold text-lg text-[var(--quillotana-blue)] mb-4">Filtros</h2>

      {/* Categories */}
      <div className="mb-6">
        <h3 className="font-medium text-sm text-foreground mb-3">Categoría</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center gap-2">
              <Checkbox
                id={`category-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => handleCategoryToggle(category)}
              />
              <Label
                htmlFor={`category-${category}`}
                className="text-sm cursor-pointer"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Stock filter */}
      <div className="mb-6">
        <h3 className="font-medium text-sm text-foreground mb-3">Disponibilidad</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-stock"
              checked={showOnlyStock}
              onCheckedChange={(checked) => onShowOnlyStockChange(checked as boolean)}
            />
            <Label htmlFor="show-stock" className="text-sm cursor-pointer">
              Solo con stock
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-offers"
              checked={showOnlyOffers}
              onCheckedChange={(checked) => onShowOnlyOffersChange(checked as boolean)}
            />
            <Label htmlFor="show-offers" className="text-sm cursor-pointer">
              Ofertas
            </Label>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Sort */}
      <div>
        <h3 className="font-medium text-sm text-foreground mb-3">Ordenar por</h3>
        <RadioGroup value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="default" id="sort-default" />
            <Label htmlFor="sort-default" className="text-sm cursor-pointer">
              Relevancia
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="price-asc" id="sort-price-asc" />
            <Label htmlFor="sort-price-asc" className="text-sm cursor-pointer">
              Precio: menor a mayor
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="price-desc" id="sort-price-desc" />
            <Label htmlFor="sort-price-desc" className="text-sm cursor-pointer">
              Precio: mayor a menor
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="name-asc" id="sort-name-asc" />
            <Label htmlFor="sort-name-asc" className="text-sm cursor-pointer">
              Nombre: A-Z
            </Label>
          </div>
        </RadioGroup>
      </div>
    </aside>
  )
}
