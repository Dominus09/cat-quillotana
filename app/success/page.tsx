"use client"

import { Suspense, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

function formatOrderDisplayId(raw: string | null): string | null {
  if (raw == null || raw.trim() === "") return null
  const n = Number(raw)
  if (Number.isFinite(n)) {
    return String(n).padStart(4, "0")
  }
  return String(raw).padStart(4, "0")
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("id")

  const formattedId = useMemo(() => formatOrderDisplayId(orderId), [orderId])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md text-center space-y-6">
        <Image
          src="/logo-main.png"
          alt="Distribuidora La Quillotana"
          width={180}
          height={90}
          className="object-contain mx-auto"
        />
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-foreground">
            Pedido generado correctamente
          </h1>
          {formattedId != null ? (
            <p className="text-2xl font-bold tracking-tight text-primary">
              Pedido #{formattedId}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Recibirás confirmación según los datos de contacto indicados.
            </p>
          )}
        </div>
        <Button
          asChild
          className="w-full max-w-xs h-12 font-semibold bg-primary text-primary-foreground hover:bg-[#c90510]"
        >
          <Link href="/catalog">Volver al catálogo</Link>
        </Button>
      </div>
    </main>
  )
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Cargando…</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
