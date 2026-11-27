"use client"

import { useEffect, useState } from "react"
import type { Product } from "@/types/catalog"
import { productUsesResolvedPlaceholderImage } from "@/lib/product-photo"

function probeImageUrl(src: string, timeoutMs: number, signal: AbortSignal): Promise<boolean> {
  return new Promise((resolve) => {
    if (signal.aborted) { resolve(false); return }
    const img = new Image()
    let settled = false
    const finish = (ok: boolean, stop = false) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      signal.removeEventListener("abort", abort)
      img.onload = null
      img.onerror = null
      if (stop) img.removeAttribute("src")
      resolve(ok)
    }
    const abort = () => finish(false, true)
    const timer = window.setTimeout(() => finish(false, true), timeoutMs)
    signal.addEventListener("abort", abort, { once: true })
    img.onload = () => finish(true)
    img.onerror = () => finish(false)
    img.src = src
  })
}

type ProbeResult = { products: Product[]; ids: ReadonlySet<number> }
const EMPTY_IDS: ReadonlySet<number> = new Set()

/** Explicit, cancellable photo audit. Never run automatically on catalog entry. */
export function useBrokenCatalogImages(products: Product[], enabled: boolean) {
  const [result, setResult] = useState<ProbeResult | null>(null)
  useEffect(() => {
    if (!enabled) { setResult(null); return }
    const controller = new AbortController()
    const candidates = new Map<string, number[]>()
    for (const p of products) {
      if (p.stock <= 0 || !(p.imageFromApi === true || p.imageFromLocal === true) ||
          productUsesResolvedPlaceholderImage(p.image)) continue
      const ids = candidates.get(p.image) || []
      ids.push(p.id)
      candidates.set(p.image, ids)
    }
    const entries = [...candidates.entries()]
    const failed = new Set<number>()
    let nextIndex = 0
    async function worker() {
      while (!controller.signal.aborted) {
        const i = nextIndex++
        if (i >= entries.length) break
        const [src, ids] = entries[i]
        const ok = await probeImageUrl(src, 12000, controller.signal)
        if (controller.signal.aborted) return
        if (!ok) for (const id of ids) failed.add(id)
      }
    }
    void Promise.all(Array.from({ length: Math.min(4, entries.length) }, () => worker())).then(() => {
      if (!controller.signal.aborted) setResult({ products, ids: failed })
    })
    return () => controller.abort()
  }, [products, enabled])
  const done = enabled && result?.products === products
  return {
    brokenImageIds: done ? result.ids : EMPTY_IDS,
    imageProbeState: (done ? "done" : enabled ? "running" : "idle") as "idle" | "running" | "done",
  }
}
