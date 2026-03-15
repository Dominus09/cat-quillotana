"use client"

import Image from "next/image"

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin">
          <Image
            src="/logo-seal.png"
            alt="Cargando..."
            width={100}
            height={100}
            priority
            className="object-contain"
          />
        </div>
        <p className="text-muted-foreground text-sm">Cargando catálogo...</p>
      </div>
    </div>
  )
}
