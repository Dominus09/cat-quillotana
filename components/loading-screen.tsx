"use client"

import Image from "next/image"
import { LOGO_SEAL_SRC } from "@/lib/branding-assets"

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin">
          <Image
            src={LOGO_SEAL_SRC}
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
