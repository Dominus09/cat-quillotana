"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSession } from "@/lib/session"
import { LoadingScreen } from "@/components/loading-screen"

/** Ruta antigua: la lista ya no se elige, se resuelve por ciudad del cliente. */
export default function SelectPriceListPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace(getSession() ? "/catalog" : "/")
  }, [router])

  return <LoadingScreen />
}
