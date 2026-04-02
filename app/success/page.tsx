"use client"

import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("id")

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
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Pedido generado correctamente
          </h1>
          {orderId ? (
            <p className="text-lg text-muted-foreground">
              Número de pedido:{" "}
              <span className="font-semibold text-foreground">{orderId}</span>
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
