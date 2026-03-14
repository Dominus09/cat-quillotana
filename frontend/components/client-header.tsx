'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, User, LogOut, Menu, X, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getSession, clearSession, isTestMode } from '@/lib/session'
import { getCart, getCartCount } from '@/lib/cart'
import type { Client, CartItem } from '@/lib/types'

interface ClientHeaderProps {
  onCartClick?: () => void
  onSearch?: (query: string) => void
}

export function ClientHeader({ onCartClick, onSearch }: ClientHeaderProps) {
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [cartCount, setCartCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [testMode, setTestMode] = useState(false)

  useEffect(() => {
    const session = getSession()
    if (!session) {
      router.push('/')
      return
    }
    setClient(session)
    setTestMode(isTestMode())
    
    const updateCartCount = () => {
      const cart = getCart()
      setCartCount(getCartCount(cart))
    }
    
    updateCartCount()
    
    // Listen for cart updates
    const handleStorageChange = () => updateCartCount()
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('cartUpdated', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('cartUpdated', handleStorageChange)
    }
  }, [router])

  const handleLogout = () => {
    clearSession()
    router.push('/')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  if (!client) return null

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/catalog" className="flex-shrink-0">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%202-7HlK3Tlt7o9nu6KiqxaBfbaCjLrZqg.png"
              alt="Quillotana Distribuidora"
              width={120}
              height={48}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>

          {/* Search - Desktop */}
          <form 
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl mx-4"
          >
            <input
              type="search"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                onSearch?.(e.target.value)
              }}
              className="w-full h-10 px-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--quillotana-red)] focus:border-transparent"
            />
          </form>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Test mode badge */}
            {testMode && (
              <Badge variant="outline" className="hidden sm:flex bg-amber-50 text-amber-700 border-amber-300">
                Modo prueba
              </Badge>
            )}

            {/* Cart button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={onCartClick}
              aria-label="Ver carrito"
            >
              <ShoppingCart className="h-5 w-5 text-[var(--quillotana-blue)]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--quillotana-red)] text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Button>

            {/* User menu - Desktop */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden sm:flex items-center gap-2 text-[var(--quillotana-blue)]">
                  <User className="h-5 w-5" />
                  <span className="max-w-[150px] truncate">{client.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{client.name}</p>
                  <p className="text-xs text-muted-foreground">{client.rut}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/mis-pedidos" className="flex items-center gap-2 cursor-pointer">
                    <FileText className="h-4 w-4" />
                    Mis pedidos
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menú"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Search - Mobile */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch}>
            <input
              type="search"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                onSearch?.(e.target.value)
              }}
              className="w-full h-10 px-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--quillotana-red)] focus:border-transparent"
            />
          </form>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-border py-4 space-y-2">
            {testMode && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 mb-2">
                Modo prueba
              </Badge>
            )}
            <div className="flex items-center gap-2 px-2 py-2 text-[var(--quillotana-blue)]">
              <User className="h-5 w-5" />
              <div>
                <p className="font-medium">{client.name}</p>
                <p className="text-xs text-muted-foreground">{client.rut}</p>
              </div>
            </div>
            <Link
              href="/mis-pedidos"
              className="flex items-center gap-2 px-2 py-2 text-[var(--quillotana-blue)] hover:bg-muted rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FileText className="h-5 w-5" />
              Mis pedidos
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-2 py-2 text-destructive hover:bg-muted rounded-lg w-full"
            >
              <LogOut className="h-5 w-5" />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
