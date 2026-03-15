'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getProducts } from '@/services/api'
import { getSession } from '@/lib/session'
import type { Product } from '@/lib/types'

export default function CatalogPage() {

  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  if (isLoading) {

    return (
      <div className="flex items-center justify-center min-h-screen">
        Cargando productos...
      </div>
    )

  }

  return (

    <div className="min-h-screen p-8">

      <h1 className="text-2xl font-bold mb-6">
        Catálogo
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {products.map((product) => (

          <div
            key={product.variant_id}
            className="border rounded-lg p-4"
          >

            <h2 className="font-semibold">
              {product.product_name}
            </h2>

            <p>
              SKU: {product.sku}
            </p>

            <p>
              Stock: {product.stock}
            </p>

            <p className="font-bold">
              ${product.price}
            </p>

          </div>

        ))}

      </div>

    </div>

  )

}
