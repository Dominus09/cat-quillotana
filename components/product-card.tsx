"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Plus, Minus, ShoppingCart } from "lucide-react"
import type { Product } from "@/types/catalog"

interface ProductCardProps {
  product: Product
  priceList: string
  onAddToCart: (product: Product, quantity: number) => void
}

function getStockStatus(stock: number) {
  if (stock === 0) {
    return { label: "Sin stock", bgColor: "bg-red-100", textColor: "text-red-700" }
  } else if (stock <= 10) {
    return { label: "Últimas unidades", bgColor: "bg-yellow-100", textColor: "text-yellow-800" }
  }
  return { label: "Disponible", bgColor: "bg-green-100", textColor: "text-green-700" }
}

export function ProductCard({ product, priceList, onAddToCart }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)
  const [imageError, setImageError] = useState(false)
  
  const price = product.prices?.[priceList] ?? product.default_price ?? product.price ?? 0
  const stockStatus = getStockStatus(product.stock)
  const isOutOfStock = product.stock === 0

  const handleAdd = () => {
    if (!isOutOfStock) {
      onAddToCart(product, quantity)
      setQuantity(1)
    }
  }

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity((q) => q + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
      
      {/* Imagen */}
      <div className="relative h-40 bg-gray-100 border-b border-gray-100">
        {imageError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <Image
              src="/placeholder.png"
              alt="sin imagen"
              width={60}
              height={60}
              className="opacity-30"
            />
          </div>
        ) : (
          <Image
            src={product.image || "/placeholder.png"}
            alt={product.name}
            fill
            className="object-contain p-3"
            onError={() => setImageError(true)}
            loading="lazy"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {/* Stock */}
        <div className="absolute top-2 right-2">
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bgColor} ${stockStatus.textColor}`}>
            {stockStatus.label}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        
        {/* Tipo */}
        <p className="text-xs uppercase text-gray-500 tracking-wide">
          {product.type || "Sin categoría"}
        </p>

        {/* Nombre */}
        <h3 className="font-semibold text-gray-900 text-sm mt-1 line-clamp-2">
          {product.name}
        </h3>

        {/* Precio */}
        <div className="mt-auto pt-3">
          <p className="text-lg font-bold text-red-600">
            ${price.toLocaleString("es-CL")}
          </p>
        </div>

        {/* Cantidad + botón */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex items-center border border-gray-200 rounded-md bg-white">
            <button
              type="button"
              onClick={decrementQuantity}
              disabled={quantity <= 1 || isOutOfStock}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="w-3 h-3" />
            </button>

            <span className="w-8 text-center text-sm font-medium text-gray-900">
              {quantity}
            </span>

            <button
              type="button"
              onClick={incrementQuantity}
              disabled={quantity >= product.stock || isOutOfStock}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          
          <Button
            onClick={handleAdd}
            disabled={isOutOfStock}
            size="sm"
            className="flex-1 bg-[#E30613] text-white font-semibold rounded-md hover:bg-[#c90510]"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Agregar</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
