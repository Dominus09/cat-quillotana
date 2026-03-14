'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ClientHeader } from '@/components/client-header'
import { FiltersSidebar, type SortOption } from '@/components/filters-sidebar'
import { ProductCard } from '@/components/product-card'
import { CartPanel } from '@/components/cart-panel'
import { LoadingScreen } from '@/components/loading-screen'
import { getProducts } from '@/services/api'
import { getSession } from '@/lib/session'
import type { Product } from '@/lib/types'

export default function CatalogPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cartOpen, setCartOpen] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showOnlyStock, setShowOnlyStock] = useState(false)
  const [showOnlyOffers, setShowOnlyOffers] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('default')

  useEffect(() => {
    const session = getSession()
    if (!session) {
      router.push('/')
      return
    }

    async function loadProducts() {
      try {
        const data = await getProducts()
        setProducts(data)
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [router])

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.product_type))
    return Array.from(cats).sort()
  }, [products])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.product_name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.product_type.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.product_type))
    }

    // Stock filter
    if (showOnlyStock) {
      result = result.filter((p) => p.stock > 0)
    }

    // Offers filter (for demo, products with stock < 20 are "offers")
    if (showOnlyOffers) {
      result = result.filter((p) => p.stock > 0 && p.stock <= 10)
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'name-asc':
        result.sort((a, b) => a.product_name.localeCompare(b.product_name))
        break
      default:
        break
    }

    return result
  }, [products, searchQuery, selectedCategories, showOnlyStock, showOnlyOffers, sortBy])

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (selectedCategories.length > 0) count += selectedCategories.length
    if (showOnlyStock) count++
    if (showOnlyOffers) count++
    if (sortBy !== 'default') count++
    return count
  }, [selectedCategories, showOnlyStock, showOnlyOffers, sortBy])

  const clearAllFilters = () => {
    setSelectedCategories([])
    setShowOnlyStock(false)
    setShowOnlyOffers(false)
    setSortBy('default')
    setSearchQuery('')
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-[var(--quillotana-light)] relative">
      {/* Background watermark */}
      <div className="fixed inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none z-0">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%201-gJM6SQT6MRQSxwUtV0PzXsCUPapEMO.png"
          alt=""
          width={600}
          height={600}
          className="w-[600px] h-[600px] object-contain"
        />
      </div>

      <ClientHeader onCartClick={() => setCartOpen(true)} onSearch={setSearchQuery} />

      <main className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filters */}
          <div className="hidden lg:block">
            <FiltersSidebar
              categories={categories}
              selectedCategories={selectedCategories}
              onCategoryChange={setSelectedCategories}
              showOnlyStock={showOnlyStock}
              onShowOnlyStockChange={setShowOnlyStock}
              showOnlyOffers={showOnlyOffers}
              onShowOnlyOffersChange={setShowOnlyOffers}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>

          {/* Main content */}
          <div className="flex-1">
            {/* Mobile filter button and results count */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                      {activeFiltersCount > 0 && (
                        <span className="ml-2 bg-[var(--quillotana-red)] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                          {activeFiltersCount}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filtros</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4">
                      <FiltersSidebar
                        categories={categories}
                        selectedCategories={selectedCategories}
                        onCategoryChange={setSelectedCategories}
                        showOnlyStock={showOnlyStock}
                        onShowOnlyStockChange={setShowOnlyStock}
                        showOnlyOffers={showOnlyOffers}
                        onShowOnlyOffersChange={setShowOnlyOffers}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-muted-foreground"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Limpiar filtros
                  </Button>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
              </p>
            </div>

            {/* Product grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-card rounded-lg p-12 text-center">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%201-gJM6SQT6MRQSxwUtV0PzXsCUPapEMO.png"
                  alt="Quillotana"
                  width={80}
                  height={80}
                  className="mx-auto opacity-30 mb-4"
                />
                <h3 className="text-lg font-medium text-[var(--quillotana-blue)] mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-muted-foreground mb-4">
                  Intenta ajustar los filtros o buscar otro término.
                </p>
                <Button variant="outline" onClick={clearAllFilters}>
                  Limpiar filtros
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.variant_id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Cart panel */}
      <CartPanel open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  )
}
