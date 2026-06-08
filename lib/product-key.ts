import type { Product } from "@/types/catalog"

export interface ProductKeyContext {
  barcodeCounts: Map<string, number>
  compositeCounts: Map<string, number>
  idCounts: Map<number, number>
}

export interface ProductKeyDuplicateStats {
  total: number
  uniqueIds: number
  duplicateIdRows: number
  uniqueBarcodes: number
  duplicateBarcodeRows: number
}

/** Cuenta filas con id o barcode repetido (p. ej. 112 duplicados en catálogo). */
export function countProductKeyDuplicates(
  products: Product[]
): ProductKeyDuplicateStats {
  const idCounts = new Map<number, number>()
  const barcodeCounts = new Map<string, number>()

  for (const p of products) {
    idCounts.set(p.id, (idCounts.get(p.id) ?? 0) + 1)
    const bc = p.barcode?.trim()
    if (bc) barcodeCounts.set(bc, (barcodeCounts.get(bc) ?? 0) + 1)
  }

  const duplicateIdRows = [...idCounts.values()]
    .filter((c) => c > 1)
    .reduce((sum, c) => sum + (c - 1), 0)

  const duplicateBarcodeRows = [...barcodeCounts.values()]
    .filter((c) => c > 1)
    .reduce((sum, c) => sum + (c - 1), 0)

  return {
    total: products.length,
    uniqueIds: idCounts.size,
    duplicateIdRows,
    uniqueBarcodes: barcodeCounts.size,
    duplicateBarcodeRows,
  }
}

export function buildProductKeyContext(products: Product[]): ProductKeyContext {
  const barcodeCounts = new Map<string, number>()
  const compositeCounts = new Map<string, number>()
  const idCounts = new Map<number, number>()

  for (const p of products) {
    const bc = p.barcode?.trim() ?? ""
    if (bc) barcodeCounts.set(bc, (barcodeCounts.get(bc) ?? 0) + 1)
    idCounts.set(p.id, (idCounts.get(p.id) ?? 0) + 1)
    const composite = `${p.id}-${bc || "no-barcode"}`
    compositeCounts.set(composite, (compositeCounts.get(composite) ?? 0) + 1)
  }

  return { barcodeCounts, compositeCounts, idCounts }
}

/**
 * Key estable para listas React de productos del catálogo.
 * Prioridad: barcode (si único en la lista) → id-barcode → id-barcode#index.
 */
export function getProductReactKey(
  product: Product,
  index: number,
  ctx?: ProductKeyContext
): string {
  const barcode = product.barcode?.trim() ?? ""

  if (barcode && ctx && (ctx.barcodeCounts.get(barcode) ?? 0) === 1) {
    return barcode
  }

  if (barcode) {
    const composite = `${product.id}-${barcode}`
    if (ctx && (ctx.compositeCounts.get(composite) ?? 0) === 1) {
      return composite
    }
    return `${composite}#${index}`
  }

  if (ctx && (ctx.idCounts.get(product.id) ?? 0) === 1) {
    return String(product.id)
  }

  return `${product.id}#${index}`
}
