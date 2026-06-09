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
  getMinQuantity,
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
const DEBUG_BARCODE = "6972229786055"

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
    const p = withCommercialDefaults(product)
    setQuantity(initialQuantityForProduct(p))
    setQtyError("")
  }, [product.id, product.quantity_step, product.sale_type, product.stock, product.type])

  useEffect(() => {
    if (product.barcode?.trim() !== DEBUG_BARCODE) return
    const p = withCommercialDefaults(product)
    console.log("[ProductCard SEC debug]", {
      name: p.name,
      type: p.type,
      units_per_box: p.units_per_box,
      sale_type: p.sale_type,
      quantity_step: p.quantity_step,
      initialQuantity: getMinQuantity(p),
    })
  }, [product])

  useEffect(() => {
    if (product.stock <= 0) return
    setQuantity((q) => {
      const p = withCommercialDefaults(product)
      const max = getMaxValidQuantity(p)
      if (max <= 0) return initialQuantityForProduct(p)
      return clampValidQuantity(typeof q === "number" ? q : initialQuantityForProduct(p), p)
    })
  }, [product.stock, product.quantity_step, product.sale_type, product.type])

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
    <article className="bg-card text-card-foreground rounded-xl shadow-sm border border-border overflow-hidden flex flex-col h-full min-h-[22rem] transition-shadow duration-200 hover:shadow-md dark:hover:border-zinc-600">
      <div className="relative h-36 shrink-0 bg-muted border-b border-border dark:bg-zinc-950 dark:border-zinc-800/60">
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
          <div className="absolute inset-2 rounded-lg overflow-hidden bg-neutral-50/90 ring-1 ring-black/[0.04] dark:inset-1.5 dark:rounded-md dark:bg-gradient-to-b dark:from-zinc-800/35 dark:via-zinc-900/25 dark:to-zinc-950 dark:ring-white/[0.06]">
            <Image
              key={displaySrc}
              src={displaySrc}
              alt={product.name}
              fill
              className="object-contain p-2 dark:p-1.5"
              onError={handleImageError}
              loading="lazy"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
        )}

        <div className="absolute top-2 right-2">
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${stockStatus.badgeClass}`}
          >
            {stockStatus.label}
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0 p-3 gap-1">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground line-clamp-1 shrink-0">
          {product.type}
        </p>

        <h3
          className="font-semibold text-foreground text-sm leading-snug line-clamp-3 min-h-[3.75rem] shrink-0"
          title={product.name}
        >
          {product.name}
        </h3>

        <p className="text-xs text-muted-foreground leading-snug shrink-0">
          {saleRuleLabel}
        </p>

        <div className="mt-auto pt-2 flex flex-col gap-2 min-w-0">
          {product.barcode ? (
            <p
              className="text-[9px] leading-tight text-muted-foreground/80 font-mono tabular-nums truncate"
              title={product.barcode}
            >
              {product.barcode}
            </p>
          ) : null}

          <p className="text-base font-bold text-red-600 dark:text-red-400 tabular-nums">
            ${product.price.toLocaleString("es-CL")}
          </p>

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
            containerClassName="flex items-stretch border border-border rounded-md bg-background w-full overflow-hidden"
          />

          <Button
            onClick={handleAdd}
            disabled={isOutOfStock}
            size="sm"
            className="w-full h-9 bg-[#E30613] text-white font-semibold rounded-md hover:bg-[#c90510] whitespace-nowrap"
          >
            <ShoppingCart className="w-4 h-4 mr-1.5 shrink-0" />
            Agregar
          </Button>

          {qtyError ? (
            <p className="text-[11px] text-destructive text-center leading-snug">
              {qtyError}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  )
}
