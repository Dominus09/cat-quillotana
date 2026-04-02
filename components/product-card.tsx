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
    return { label: "Sin stock", bgColor: "bg-red-100", textColor: "text-red-700" }
  } else if (stock <= 10) {
    return { label: "Últimas unidades", bgColor: "bg-yellow-100", textColor: "text-yellow-800" }
  }
  return { label: "Disponible", bgColor: "bg-green-100", textColor: "text-green-700" }
}

function initialImageSrc(product: Product): string {
  const primary = product.image?.trim()
  return primary ? primary : PLACEHOLDER_WEBP
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)
  const [displaySrc, setDisplaySrc] = useState(() => initialImageSrc(product))
  const [imageBroken, setImageBroken] = useState(false)

  useEffect(() => {
    setDisplaySrc(initialImageSrc(product))
    setImageBroken(false)
  }, [product.id, product.image])

  useEffect(() => {
    if (product.stock <= 0) return
    setQuantity((q: number) => Math.min(Math.max(1, q), product.stock))
  }, [product.stock, product.id])

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
    if (!isOutOfStock) {
      onAddToCart(product, quantity)
      setQuantity(1)
    }
  }

  const clampQuantity = (n: number) => {
    if (product.stock <= 0) return 1
    if (!Number.isFinite(n) || n < 1) return 1
    return Math.min(n, product.stock)
  }

  const incrementQuantity = () => {
    if (!isOutOfStock) {
      setQuantity((q: number) => clampQuantity(q + 1))
    }
  }

  const decrementQuantity = () => {
    if (!isOutOfStock) {
      setQuantity((q: number) => clampQuantity(q - 1))
    }
  }

  const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    if (v === "") {
      setQuantity(1)
      return
    }
    const n = Number(v)
    if (!Number.isInteger(n)) return
    setQuantity(clampQuantity(n))
  }

  const handleQuantityBlur = () => {
    setQuantity((q: number) => clampQuantity(q))
  }

  const maxQty = Math.max(1, product.stock)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
      <div className="relative h-40 bg-gray-100 border-b border-gray-100">
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
            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bgColor} ${stockStatus.textColor}`}
          >
            {stockStatus.label}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs uppercase text-gray-500 tracking-wide line-clamp-2">
          {product.type}
        </p>

        <h3 className="font-semibold text-gray-900 text-sm mt-1 line-clamp-2">
          {product.name}
        </h3>

        <div className="mt-auto pt-3">
          <p className="text-lg font-bold text-red-600">
            ${product.price.toLocaleString("es-CL")}
          </p>
        </div>

        <div className="mt-3 flex items-center gap-2 min-w-0">
          <div className="flex items-center border border-gray-200 rounded-md bg-white min-w-0 flex-1 max-w-[220px] sm:max-w-[240px] overflow-hidden">
            <button
              type="button"
              onClick={decrementQuantity}
              disabled={quantity <= 1 || isOutOfStock}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Minus className="w-3 h-3" />
            </button>

            <Input
              type="number"
              min={1}
              max={maxQty}
              disabled={isOutOfStock}
              value={quantity}
              onChange={handleQuantityChange}
              onBlur={handleQuantityBlur}
              className="h-10 min-w-[60px] w-16 sm:min-w-[70px] sm:w-20 max-w-[5.5rem] shrink-0 border-0 text-center text-sm font-semibold tabular-nums px-2 shadow-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              aria-label="Cantidad"
            />

            <button
              type="button"
              onClick={incrementQuantity}
              disabled={quantity >= product.stock || isOutOfStock}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
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
      </div>
    </div>
  )
}
