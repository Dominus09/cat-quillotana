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
