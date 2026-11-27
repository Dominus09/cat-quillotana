"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Download, Filter, Loader2, ImageOff } from "lucide-react"
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
import { filterCatalogProducts } from "@/lib/catalog-filters"
import { catalogPageWindow, catalogFilterKey } from "@/lib/catalog-page-window"
import { useCartPriceSync } from "@/hooks/use-cart-price-sync"
import { CartPriceNotice } from "@/components/cart-price-notice"
import {
  buildProductKeyContext,
  getProductReactKey,
} from "@/lib/product-key"
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
  const [pageChoice, setPageChoice] = useState({ key: "", page: 0 })
  const [scanRequested, setScanRequested] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  const { products: productsForList, isLoading, error } = useCatalog(apiInStockOnly)
  const cartPriceNotice = useCartPriceSync(session?.price_list, setCart)
  const [noticeDismissed, setNoticeDismissed] = useState(false)

  const showMissingPhotoExport = useMemo(
    () => rutEqualsNormalized(session?.rut, RUT_MISSING_PHOTO_EXPORT_TOOL),
    [session]
  )

  const { brokenImageIds, imageProbeState } = useBrokenCatalogImages(
    productsForList,
    showMissingPhotoExport && scanRequested
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
    if (!showMissingPhotoExport || !scanRequested || imageProbeState !== "done") return 0
    return productsForList.filter((p) =>
      productInStockMissingCatalogPhoto(p, brokenImageIds)
    ).length
  }, [showMissingPhotoExport, scanRequested, imageProbeState, productsForList, brokenImageIds])

  const handleDownloadMissingPhotosCsv = useCallback(() => {
    if (!showMissingPhotoExport || !scanRequested || imageProbeState !== "done") return
    const csv = buildMissingPhotoCsvRows(productsForList, brokenImageIds)
    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `productos-con-stock-sin-foto-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [showMissingPhotoExport, scanRequested, imageProbeState, productsForList, brokenImageIds])

  useEffect(() => {
    setMounted(true)
    const clientSession = getSession()
    if (!clientSession) {
      router.push("/")
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

  // Preserve every matching product in the result count, but mount at most 48 cards.
  const filterKey = catalogFilterKey(clientFilters, apiInStockOnly)
  const windowed = catalogPageWindow(filteredProducts, pageChoice.key === filterKey ? pageChoice.page : 0)
  const productKeyContext = useMemo(
    () => buildProductKeyContext(filteredProducts),
    [filteredProducts]
  )
  function goToPage(page: number) {
    setPageChoice({ key: filterKey, page })
    resultsRef.current?.scrollIntoView({ block: "start", behavior: "instant" })
  }

  const handleAddToCart = useCallback((product: Product, quantity: number) => {
    const updatedCart = addToCart(product, quantity)
    setCart(updatedCart)
  }, [])

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

            {cartPriceNotice && !noticeDismissed ? (
              <CartPriceNotice
                notice={cartPriceNotice}
                onDismiss={() => setNoticeDismissed(true)}
              />
            ) : null}

            <CatalogActiveFilters
              filters={clientFilters}
              onSearchChange={setSearchQuery}
              onCategoryChange={setSelectedCategory}
              onStockFilterChange={setStockFilter}
              onClearAll={clearCatalogFilters}
            />

            {/* Products Count */}
            <div ref={resultsRef} className="mb-4 scroll-mt-32 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-sm text-muted-foreground" aria-live="polite">
                {getCatalogResultsLabel(filteredProducts.length, clientFilters)}
              </p>{windowed.pageCount > 1 ? <p className="mt-1 text-xs text-muted-foreground">Mostrando {windowed.start + 1}–{windowed.end} de {filteredProducts.length.toLocaleString("es-CL")}</p> : null}</div>
              {showMissingPhotoExport ? (
                <div className="flex flex-wrap items-center gap-2">
                  {!scanRequested ? <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setScanRequested(true)}><ImageOff className="w-4 h-4" /> Revisar fotos</Button> : imageProbeState !== "done" ? <><span role="status" className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Comprobando fotos…</span><Button type="button" variant="ghost" size="sm" onClick={() => setScanRequested(false)}>Cancelar</Button></> : <><Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleDownloadMissingPhotosCsv} disabled={missingPhotoCount === 0}><Download className="w-4 h-4" /> Lista sin foto ({missingPhotoCount})</Button><Button type="button" variant="ghost" size="sm" onClick={() => setScanRequested(false)}>Cerrar revisión</Button></>}
                </div>
              ) : null}
            </div>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {windowed.items.map((product, index) => (
                    <ProductCard
                      key={getProductReactKey(product, windowed.start + index, productKeyContext)}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
                {windowed.pageCount > 1 ? <nav aria-label="Páginas del catálogo" className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Button variant="outline" size="sm" disabled={windowed.page === 0} onClick={() => goToPage(windowed.page - 1)}><ChevronLeft className="w-4 h-4" /> Anterior</Button>
                  <span className="text-sm tabular-nums">Página {windowed.page + 1} de {windowed.pageCount}</span>
                  <Button variant="outline" size="sm" disabled={windowed.page + 1 === windowed.pageCount} onClick={() => goToPage(windowed.page + 1)}>Siguiente <ChevronRight className="w-4 h-4" /></Button>
                </nav> : null}
              </>
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
