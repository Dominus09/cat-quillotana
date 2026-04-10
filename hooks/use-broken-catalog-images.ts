"use client"

import { useEffect, useState } from "react"
import type { Product } from "@/types/catalog"
import { productUsesResolvedPlaceholderImage } from "@/lib/product-photo"

function probeImageUrl(src: string, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    let settled = false
    const finish = (ok: boolean) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      img.onload = null
      img.onerror = null
      resolve(ok)
    }
    const timer = window.setTimeout(() => finish(false), timeoutMs)
    img.onload = () => finish(true)
    img.onerror = () => finish(false)
    img.src = src
  })
}

/**
 * Comprueba en el navegador si la URL de imagen carga (alineado con onError de la tarjeta).
 * Solo se prueban productos con stock y URL que no sea ya un placeholder resuelto.
 */
export function useBrokenCatalogImages(products: Product[]) {
  const [brokenImageIds, setBrokenImageIds] = useState<ReadonlySet<number>>(() => new Set())
  const [probeState, setProbeState] = useState<"idle" | "running" | "done">("idle")

  useEffect(() => {
    let cancelled = false

    const candidates = products.filter(
      (p) =>
        p.stock > 0 &&
        p.imageFromApi === true &&
        !productUsesResolvedPlaceholderImage(p.image)
    )

    if (candidates.length === 0) {
      setBrokenImageIds(new Set())
      setProbeState("done")
      return
    }

    setProbeState("running")
    setBrokenImageIds(new Set())

    const failed = new Set<number>()
    const concurrency = 8
    let nextIndex = 0

    const worker = async () => {
      while (!cancelled) {
        const i = nextIndex++
        if (i >= candidates.length) break
        const p = candidates[i]
        const ok = await probeImageUrl(p.image, 12000)
        if (cancelled) return
        if (!ok) failed.add(p.id)
      }
    }

    void Promise.all(Array.from({ length: concurrency }, () => worker())).then(() => {
      if (cancelled) return
      setBrokenImageIds(new Set(failed))
      setProbeState("done")
    })

    return () => {
      cancelled = true
    }
  }, [products])

  return { brokenImageIds, imageProbeState: probeState }
}
