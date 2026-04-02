"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { getSession, setSession, updateSessionPriceList } from "@/lib/session"
import type { ClientSession } from "@/types/catalog"
import { LoadingScreen } from "@/components/loading-screen"

export default function SelectPriceListPage() {
  const router = useRouter()
  const [session, setLocalSession] = useState<ClientSession | null>(null)

  useEffect(() => {
    const s = getSession()
    if (!s) {
      router.replace("/")
      return
    }
    if (s.is_melinka) {
      if (!s.price_list?.trim()) {
        setSession({ ...s, price_list: "melinka" })
      }
      router.replace("/catalog")
      return
    }
    if (s.price_list?.trim()) {
      router.replace("/catalog")
      return
    }
    setLocalSession(s)
  }, [router])

  const choose = (price_list: "factura" | "comoditi") => {
    updateSessionPriceList(price_list)
    router.push("/catalog")
  }

  if (!session) {
    return <LoadingScreen />
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="hidden lg:block fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5">
          <Image
            src="/logo-seal.png"
            alt=""
            width={600}
            height={600}
            className="select-none"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl shadow-lg p-8 relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <Image
              src="/logo-main.png"
              alt="Distribuidora La Quillotana"
              width={200}
              height={120}
              priority
              className="object-contain mx-auto"
            />
            <h1 className="text-xl font-bold text-foreground">
              ¿Cómo deseas comprar?
            </h1>
            <p className="text-sm text-muted-foreground">
              Hola, {session.name}. Elige tu lista de precios.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              type="button"
              className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-[#c90510]"
              onClick={() => choose("factura")}
            >
              Factura
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base font-semibold border-2"
              onClick={() => choose("comoditi")}
            >
              Boleta (Comoditi)
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
