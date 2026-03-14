'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, Minus, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/lib/types'
import { getProductImageUrl } from '@/services/api'
import { addToCart } from '@/lib/cart'
import { toast } from 'sonner'

interface ProductCardProps {
  product: Product
  onCartUpdate?: () => void
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount)
}

function getStockStatus(stock: number): { label: string; color: string; bgColor: string } {
  if (stock === 0) {
    return { label: 'Sin stock', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200' }
  }
  if (stock <= 10) {
    return { label: 'Últimas unidades', color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200' }
  }
  return { label: 'Disponible', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200' }
}

export function ProductCard({ product, onCartUpdate }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)
  const [imageError, setImageError] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const stockStatus = getStockStatus(product.stock)
  const imageUrl = product.image_url || getProductImageUrl(product.sku)
  const isOutOfStock = product.stock === 0

  const handleAddToCart = () => {
    if (isOutOfStock) return
    
    setIsAdding(true)
    
    addToCart({
      variant_id: product.variant_id,
      product_name: product.product_name,
      sku: product.sku,
      price: product.price,
      quantity,
      image_url: imageUrl,
    })
    
    // Dispatch custom event for cart update
    window.dispatchEvent(new CustomEvent('cartUpdated'))
    
    toast.success('Producto agregado al carrito', {
      description: `${product.product_name} x${quantity}`,
    })
    
    setQuantity(1)
    onCartUpdate?.()
    
    setTimeout(() => setIsAdding(false), 300)
  }

  return (
    <Card className="group overflow-hidden h-full flex flex-col">
      <div className="relative aspect-square bg-muted overflow-hidden">
        {imageError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-[var(--quillotana-light)]">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%201-gJM6SQT6MRQSxwUtV0PzXsCUPapEMO.png"
              alt="Quillotana"
              width={80}
              height={80}
              className="opacity-30 mb-2"
            />
            <p className="text-xs text-muted-foreground text-center">Imagen próximamente disponible</p>
          </div>
        ) : (
          <Image
            src={product.image_url || "/placeholder.jpg"}
            alt={product.product_name}
            fill
            className="w-full h-40 object-contain"
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}
        
        {/* Stock badge */}
        <Badge
          variant="outline"
          className={`absolute top-2 right-2 ${stockStatus.bgColor} ${stockStatus.color} border`}
        >
          {stockStatus.label}
        </Badge>
      </div>

      <CardContent className="flex flex-col flex-1 p-4">
        {/* Category */}
        <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
          {product.product_type}
        </span>

        {/* Product name */}
        <h3 className="font-medium text-[var(--quillotana-blue)] leading-tight mb-1 line-clamp-2 flex-grow">
          {product.product_name}
        </h3>

        {/* SKU */}
        <span className="text-xs text-muted-foreground mb-2">SKU: {product.sku}</span>

        {/* Price */}
        <p className="text-xl font-bold text-[var(--quillotana-red)] mb-3">
          {formatCurrency(product.price)}
        </p>

        {/* Quantity selector and add button */}
        <div className="flex items-center gap-2 mt-auto">
          <div className="flex items-center border border-border rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={isOutOfStock}
              aria-label="Disminuir cantidad"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-medium text-sm">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity(quantity + 1)}
              disabled={isOutOfStock}
              aria-label="Aumentar cantidad"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            className={`flex-1 h-8 text-sm font-medium ${
              isOutOfStock 
                ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                : 'bg-[var(--quillotana-red)] hover:bg-[var(--quillotana-red-dark)] text-white'
            } ${isAdding ? 'scale-95' : ''} transition-transform`}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
