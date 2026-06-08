"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Download, Filter, Loader2 } from "lucide-react"
import { useCatalog } from "@/hooks/use-catalog"
import { useBrokenCatalogImages } from "@/hooks/use-broken-catalog-images"
import { ProductCard } from "@/components/product-card"
import { ClientHeader } from "@/components/client-header"
import { FiltersSidebar } from "@/components/filters-sidebar"
import { CartPanel } from "@/components/cart-panel"
import { CatalogAdminPanel } from "@/components/catalog-admin-panel"
import { LoadingScreen } from "@/components/loading-screen"
import {
  getSession,
  clearSession,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartItemCount,
} from "@/lib/session"
import { buildMissingPhotoCsvRows, productInStockMissingCatalogPhoto } from "@/lib/product-photo"
import { LOGO_SEAL_SRC } from "@/lib/branding-assets"
import { filterProductsForPriceList, filterCatalogProducts } from "@/lib/catalog-filters"
import {
  CatalogActiveFilters,
  getCatalogResultsLabel,
} from "@/components/catalog-active-filters"
import {
  RUT_MISSING_PHOTO_EXPORT_TOOL,
  rutEqualsNormalized,
} from "@/lib/internal-tools"
import type { ClientSession, CartItem, Product } from "@/types/catalog"

export default function CatalogPage() {
  const router = useRouter()
  const [apiInStockOnly, setApiInStockOnly] = useState(true)
  const [session, setSession] = useState<ClientSession | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [stockFilter, setStockFilter] = useState<"all" | "available" | "low">("all")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const { products, isLoading, error } = useCatalog(apiInStockOnly)

  const productsForList = useMemo(
    () => filterProductsForPriceList(products, session?.price_list),
    [products, session?.price_list]
  )

  const showMissingPhotoExport = useMemo(
    () => rutEqualsNormalized(session?.rut, RUT_MISSING_PHOTO_EXPORT_TOOL),
    [session]
  )

  const { brokenImageIds, imageProbeState } = useBrokenCatalogImages(
    productsForList,
    showMissingPhotoExport
  )

  const clearCatalogFilters = useCallback(() => {
    setSearchQuery("")
    setSelectedCategory(null)
    setStockFilter("all")
    setApiInStockOnly(true)
  }, [])

  const clientFilters = useMemo(
    () => ({ searchQuery, selectedCategory, stockFilter }),
    [searchQuery, selectedCategory, stockFilter]
  )

  const missingPhotoCount = useMemo(() => {
    if (!showMissingPhotoExport) return 0
    return productsForList.filter((p) =>
      productInStockMissingCatalogPhoto(p, brokenImageIds)
    ).length
  }, [showMissingPhotoExport, productsForList, brokenImageIds])

  const handleDownloadMissingPhotosCsv = useCallback(() => {
    const csv = buildMissingPhotoCsvRows(productsForList, brokenImageIds)
    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `productos-con-stock-sin-foto-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [productsForList, brokenImageIds])

  useEffect(() => {
    setMounted(true)
    const clientSession = getSession()
    if (!clientSession) {
      router.push("/")
      return
    }
    if (!clientSession.price_list?.trim()) {
      router.push("/select-price-list")
      return
    }
    setSession(clientSession)
    setCart(getCart())
  }, [router])

  // Extract unique categories
  const categories = useMemo(() => {
    const types = new Set(productsForList.map((p) => p.type))
    return Array.from(types).sort()
  }, [productsForList])

  const filteredProducts = useMemo(
    () => filterCatalogProducts(productsForList, clientFilters),
    [productsForList, clientFilters]
  )

  const handleAddToCart = (product: Product, quantity: number) => {
    const updatedCart = addToCart(product, quantity)
    setCart(updatedCart)
  }

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    const updatedCart = updateCartItem(productId, quantity)
    setCart(updatedCart)
  }

  const handleRemoveItem = (productId: number) => {
    const updatedCart = removeFromCart(productId)
    setCart(updatedCart)
  }

  const handleClearCart = () => {
    clearCart()
    setCart([])
  }

  const handleLogout = () => {
    clearSession()
    router.push("/")
  }

  if (!mounted || !session) {
    return <LoadingScreen />
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Image
            src={LOGO_SEAL_SRC}
            alt=""
            width={80}
            height={80}
            className="mx-auto opacity-50 mb-4"
          />
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Error al cargar el catálogo
          </h1>
          <p className="text-muted-foreground mb-4">
            No pudimos conectar con el servidor. Por favor intenta de nuevo.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground hover:bg-[#c90510]"
          >
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Watermark */}
      <div className="hidden lg:block fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5">
          <Image
            src={LOGO_SEAL_SRC}
            alt=""
            width={500}
            height={500}
            className="select-none"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Header */}
      <ClientHeader
        session={session}
        cartItemCount={getCartItemCount(cart)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCartClick={() => setCartOpen(true)}
        onLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className="hidden lg:block w-[240px] max-w-[260px] flex-shrink-0">
            <FiltersSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              stockFilter={stockFilter}
              onStockFilterChange={setStockFilter}
              apiInStockOnly={apiInStockOnly}
              onApiInStockOnlyChange={setApiInStockOnly}
              isOpen={filtersOpen}
              onClose={() => setFiltersOpen(false)}
              isMobileDrawer={false}
              onClearFilters={clearCatalogFilters}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {session.is_catalog_admin ? (
              <CatalogAdminPanel rut={session.rut} />
            ) : null}

            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                onClick={() => setFiltersOpen(true)}
                className="w-full justify-center h-11 font-medium"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtrar
              </Button>
            </div>

            <CatalogActiveFilters
              filters={clientFilters}
              onSearchChange={setSearchQuery}
              onCategoryChange={setSelectedCategory}
              onStockFilterChange={setStockFilter}
              onClearAll={clearCatalogFilters}
            />

            {/* Products Count */}
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {getCatalogResultsLabel(filteredProducts.length, clientFilters)}
              </p>
              {showMissingPhotoExport ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 h-9 gap-2 border-border"
                  onClick={handleDownloadMissingPhotosCsv}
                  disabled={imageProbeState === "running" || missingPhotoCount === 0}
                  title="CSV: tipo, código de barras, stock, detalle (incluye enlaces rotos y sin imagen en API)"
                >
                  {imageProbeState === "running" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {imageProbeState === "running"
                    ? "Comprobando fotos…"
                    : `Lista sin foto (${missingPhotoCount})`}
                </Button>
              ) : null}
            </div>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Image
                  src={LOGO_SEAL_SRC}
                  alt=""
                  width={80}
                  height={80}
                  className="mx-auto opacity-30 mb-4"
                />
                <p className="text-muted-foreground">
                  No encontramos productos con estos filtros
                </p>
                <Button
                  variant="link"
                  onClick={clearCatalogFilters}
                  className="text-primary mt-2"
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Sidebar */}
      <div className="lg:hidden">
        <FiltersSidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          stockFilter={stockFilter}
          onStockFilterChange={setStockFilter}
          apiInStockOnly={apiInStockOnly}
          onApiInStockOnlyChange={setApiInStockOnly}
          isOpen={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          isMobileDrawer
          onClearFilters={clearCatalogFilters}
        />
      </div>

      {/* Cart Panel */}
      <CartPanel
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />
    </div>
  )
}
