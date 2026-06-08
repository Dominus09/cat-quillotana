"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { LOGO_SEAL_SRC } from "@/lib/branding-assets"
import {
  canAddProductToCart,
  clampValidQuantity,
  getMaxValidQuantity,
  getSaleRuleLabel,
  getStockInsufficientMessage,
  isValidQuantity,
  withCommercialDefaults,
} from "@/lib/sale-quantity"
import {
  SecQuantityControl,
  initialQuantityForProduct,
} from "@/components/sec-quantity-control"
import type { Product } from "@/types/catalog"

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product, quantity: number) => void
}

const PLACEHOLDER_WEBP = "/placeholder2.webp"
const FALLBACK_SEAL = LOGO_SEAL_SRC

function getStockStatus(stock: number) {
  if (stock === 0) {
    return {
      label: "Sin stock",
      badgeClass:
        "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-200",
    }
  }
  if (stock <= 10) {
    return {
      label: "Últimas unidades",
      badgeClass:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-200",
    }
  }
  return {
    label: "Disponible",
    badgeClass:
      "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-200",
  }
}

function initialImageSrc(product: Product): string {
  const primary = product.image?.trim()
  return primary ? primary : PLACEHOLDER_WEBP
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const commercial = withCommercialDefaults(product)
  const [quantity, setQuantity] = useState(() => initialQuantityForProduct(commercial))
  const [qtyError, setQtyError] = useState("")
  const [displaySrc, setDisplaySrc] = useState(() => initialImageSrc(product))
  const [imageBroken, setImageBroken] = useState(false)

  const stockInsufficient = !canAddProductToCart(commercial)
  const isOutOfStock = product.stock === 0 || stockInsufficient
  const stockStatus = getStockStatus(product.stock)
  const saleRuleLabel = getSaleRuleLabel(commercial)

  useEffect(() => {
    setDisplaySrc(initialImageSrc(product))
    setImageBroken(false)
  }, [product.id, product.image])

  useEffect(() => {
    setQuantity(initialQuantityForProduct(withCommercialDefaults(product)))
    setQtyError("")
  }, [product.id, product.quantity_step, product.sale_type, product.stock])

  useEffect(() => {
    if (product.stock <= 0) return
    setQuantity((q) => {
      const p = withCommercialDefaults(product)
      const max = getMaxValidQuantity(p)
      if (max <= 0) return initialQuantityForProduct(p)
      return clampValidQuantity(typeof q === "number" ? q : initialQuantityForProduct(p), p)
    })
  }, [product.stock, product.quantity_step, product.sale_type])

  const handleImageError = () => {
    const primary = product.image?.trim() || ""
    if (primary && displaySrc === primary) {
      setDisplaySrc(PLACEHOLDER_WEBP)
      return
    }
    if (displaySrc === PLACEHOLDER_WEBP) {
      setDisplaySrc(FALLBACK_SEAL)
      return
    }
    setImageBroken(true)
  }

  const handleAdd = () => {
    if (isOutOfStock) return
    const p = withCommercialDefaults(product)
    const finalQty = clampValidQuantity(quantity, p)
    if (finalQty !== quantity) {
      setQuantity(finalQty)
      setQtyError("Cantidad ajustada al múltiplo permitido")
      return
    }
    const step = p.quantity_step ?? 1
    if (!isValidQuantity(finalQty, step)) {
      setQtyError(`Debes comprar en múltiplos de ${step} unidades.`)
      return
    }
    if (finalQty > product.stock) {
      setQtyError(`Máximo ${getMaxValidQuantity(p)} unidades disponibles.`)
      return
    }
    setQtyError("")
    onAddToCart(p, finalQty)
    setQuantity(initialQuantityForProduct(p))
  }

  return (
    <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border overflow-hidden flex flex-col h-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:border-border dark:hover:border-zinc-600 dark:hover:shadow-xl dark:hover:shadow-black/35">
      <div className="relative h-40 bg-muted border-b border-border dark:bg-zinc-950 dark:border-zinc-800/60">
        {imageBroken ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 dark:bg-zinc-950">
            <Image
              src="/icon.svg"
              alt=""
              width={60}
              height={60}
              className="opacity-40 dark:opacity-50"
            />
          </div>
        ) : (
          <div className="absolute inset-2 rounded-lg overflow-hidden bg-neutral-50/90 ring-1 ring-black/[0.04] dark:inset-1.5 dark:rounded-md dark:bg-gradient-to-b dark:from-zinc-800/35 dark:via-zinc-900/25 dark:to-zinc-950 dark:ring-white/[0.06] dark:shadow-[inset_0_1px_24px_rgba(0,0,0,0.28)]">
            <Image
              key={displaySrc}
              src={displaySrc}
              alt={product.name}
              fill
              className="object-contain p-2 dark:p-1.5 dark:brightness-[0.93] dark:contrast-[1.04] dark:saturate-[0.98]"
              onError={handleImageError}
              loading="lazy"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
        )}

        <div className="absolute top-2 right-2">
          <span
            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${stockStatus.badgeClass}`}
          >
            {stockStatus.label}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs uppercase text-muted-foreground tracking-wide line-clamp-2">
          {product.type}
        </p>

        <h3 className="font-semibold text-foreground text-sm mt-1 line-clamp-2">
          {product.name}
        </h3>

        <p className="text-xs text-muted-foreground mt-1.5 leading-snug">
          {saleRuleLabel}
        </p>

        <div className="mt-auto pt-3 space-y-1">
          {product.barcode ? (
            <p
              className="text-[10px] leading-tight text-muted-foreground font-mono tabular-nums break-all line-clamp-2"
              title={product.barcode}
            >
              {product.barcode}
            </p>
          ) : null}
          <p className="text-lg font-bold text-red-600 dark:text-red-400">
            ${product.price.toLocaleString("es-CL")}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <div className="flex-1 min-w-[8.5rem] basis-[8.5rem]">
            <SecQuantityControl
              product={commercial}
              quantity={quantity}
              onQuantityChange={setQuantity}
              disabled={isOutOfStock}
              feedbackMessage={
                stockInsufficient && product.stock > 0
                  ? getStockInsufficientMessage(commercial)
                  : undefined
              }
              showAdjustHint
              containerClassName="flex items-stretch border border-border rounded-md bg-background w-full max-w-none overflow-hidden"
            />
          </div>

          <Button
            onClick={handleAdd}
            disabled={isOutOfStock}
            size="sm"
            className="basis-full flex-1 min-w-[5.5rem] bg-[#E30613] text-white font-semibold rounded-md hover:bg-[#c90510] shrink-0 whitespace-nowrap"
          >
            <ShoppingCart className="w-4 h-4 mr-1.5 shrink-0" />
            Agregar
          </Button>
        </div>

        {qtyError ? (
          <p className="text-xs text-destructive mt-1.5 text-center">{qtyError}</p>
        ) : null}
      </div>
    </div>
  )
}
