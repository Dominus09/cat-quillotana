"use client"

import { useState } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ShoppingCart, Search, LogOut } from "lucide-react"
import type { ClientSession } from "@/types/catalog"

interface ClientHeaderProps {
  session: ClientSession
  cartItemCount: number
  searchQuery: string
  onSearchChange: (query: string) => void
  onCartClick: () => void
  onLogout: () => void
}

export function ClientHeader({
  session,
  cartItemCount,
  searchQuery,
  onSearchChange,
  onCartClick,
  onLogout,
}: ClientHeaderProps) {
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 h-16">
      <div className="max-w-7xl mx-auto px-4 h-full">
        <div className="flex items-center h-full gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Image
              src="/logo-main.png"
              alt="Distribuidora La Quillotana"
              width={100}
              height={50}
              priority
              className="object-contain h-8 w-auto"
            />
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-gray-100 border-0 rounded-full h-9"
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Test Mode Badge */}
            {session.isTestMode && (
              <span className="hidden sm:inline-flex items-center px-2 py-1 rounded-md bg-yellow-100 text-yellow-800 text-xs font-medium">
                Modo prueba
              </span>
            )}

            {/* Client Name */}
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900">{session.name}</p>
              <p className="text-xs text-gray-500">RUT: {session.rut}</p>
            </div>

            {/* Cart Button */}
            <Button
              variant="outline"
              size="icon"
              className="relative border-gray-200"
              onClick={onCartClick}
              aria-label={`Carrito con ${cartItemCount} productos`}
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[20px] h-[20px] px-1 rounded-full bg-[#E30613] text-white text-xs font-bold flex items-center justify-center leading-none">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </Button>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLogoutConfirmOpen(true)}
              aria-label="Cerrar sesión"
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <AlertDialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que deseas salir? Se cerrará tu sesión en esta página.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-primary text-primary-foreground hover:bg-[#c90510]"
                onClick={() => {
                  setLogoutConfirmOpen(false)
                  onLogout()
                }}
              >
                Salir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Mobile Search */}
        <div className="pb-3 sm:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-gray-100 border-0 rounded-full h-9"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
