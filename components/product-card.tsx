"use client"

import { useState, useEffect, type ChangeEvent } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Minus, ShoppingCart } from "lucide-react"
import type { Product } from "@/types/catalog"

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product, quantity: number) => void
}

const PLACEHOLDER_WEBP = "/placeholder2.webp"
const FALLBACK_SEAL = "/logo-seal.png"

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

type QuantityValue = number | ""

function toNumericQty(q: QuantityValue): number {
  if (q === "") return NaN
  return typeof q === "number" ? q : NaN
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [quantity, setQuantity] = useState<QuantityValue>(1)
  const [qtyError, setQtyError] = useState("")
  const [displaySrc, setDisplaySrc] = useState(() => initialImageSrc(product))
  const [imageBroken, setImageBroken] = useState(false)

  useEffect(() => {
    setDisplaySrc(initialImageSrc(product))
    setImageBroken(false)
  }, [product.id, product.image])

  useEffect(() => {
    setQuantity(1)
    setQtyError("")
  }, [product.id])

  useEffect(() => {
    if (product.stock <= 0) return
    setQuantity((q) => {
      if (q === "") return q
      const n = typeof q === "number" && Number.isFinite(q) ? q : 1
      return Math.min(Math.max(0, n), product.stock)
    })
  }, [product.stock])

  const stockStatus = getStockStatus(product.stock)
  const isOutOfStock = product.stock === 0

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
    const q = toNumericQty(quantity)
    if (quantity === "" || !Number.isFinite(q) || q <= 0) {
      setQtyError("Indica una cantidad mayor a 0.")
      return
    }
    if (q > product.stock) {
      setQtyError(`Máximo ${product.stock} unidades disponibles.`)
      return
    }
    setQtyError("")
    onAddToCart(product, q)
    setQuantity(1)
  }

  const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQtyError("")
    const val = e.target.value
    if (val === "") {
      setQuantity("")
      return
    }
    setQuantity(Number(val))
  }

  const incrementQuantity = () => {
    if (isOutOfStock) return
    setQtyError("")
    const base = quantity === "" ? 0 : quantity
    const next = base + 1
    setQuantity(Math.min(next, product.stock))
  }

  const decrementQuantity = () => {
    if (isOutOfStock) return
    setQtyError("")
    const base = quantity === "" ? 0 : quantity
    setQuantity(Math.max(0, base - 1))
  }

  const numericForButtons = toNumericQty(quantity)
  const maxQty = Math.max(0, product.stock)

  return (
    <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border overflow-hidden flex flex-col h-full hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
      <div className="relative h-40 bg-muted border-b border-border">
        {imageBroken ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <Image
              src="/icon.svg"
              alt=""
              width={60}
              height={60}
              className="opacity-40"
            />
          </div>
        ) : (
          <Image
            key={displaySrc}
            src={displaySrc}
            alt={product.name}
            fill
            className="object-contain p-3"
            onError={handleImageError}
            loading="lazy"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
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

        <div className="mt-3 flex items-center gap-2 min-w-0">
          <div className="flex items-stretch border border-border rounded-md bg-background min-w-0 flex-1 max-w-[220px] sm:max-w-[240px] overflow-hidden">
            <button
              type="button"
              onClick={decrementQuantity}
              disabled={isOutOfStock || quantity === "" || numericForButtons <= 0}
              className="flex items-center justify-center p-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Minus className="w-3 h-3" />
            </button>

            <div className="flex flex-1 min-w-0 min-h-10 items-center justify-center self-stretch">
              <Input
                type="number"
                min={0}
                max={maxQty}
                disabled={isOutOfStock}
                value={quantity === "" ? "" : quantity}
                onChange={handleQuantityChange}
                className="h-10 w-full min-w-[60px] sm:min-w-[70px] max-w-[5.5rem] border-0 text-center text-sm font-semibold tabular-nums px-2 shadow-none focus-visible:ring-0 rounded-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                aria-label="Cantidad"
              />
            </div>

            <button
              type="button"
              onClick={incrementQuantity}
              disabled={
                isOutOfStock ||
                (Number.isFinite(numericForButtons) &&
                  numericForButtons >= product.stock)
              }
              className="flex items-center justify-center p-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <Button
            onClick={handleAdd}
            disabled={isOutOfStock}
            size="sm"
            className="flex-1 bg-[#E30613] text-white font-semibold rounded-md hover:bg-[#c90510] min-w-0"
          >
            <ShoppingCart className="w-4 h-4 mr-1 shrink-0" />
            <span className="hidden sm:inline">Agregar</span>
          </Button>
        </div>

        {qtyError ? (
          <p className="text-xs text-destructive mt-1.5 text-center">{qtyError}</p>
        ) : null}
      </div>
    </div>
  )
}
