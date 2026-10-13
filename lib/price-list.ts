import type { ClientSession } from "@/types/catalog"

/**
 * Listas vigentes del catálogo (company_id=3).
 * La lista 14 (COMODITI) está descontinuada y no debe usarse nunca.
 */
export type CatalogPriceList = "factura" | "melinka"

export const PRICE_LIST_IDS: Record<CatalogPriceList, number> = {
  factura: 13,
  melinka: 16,
}

const VALID_PRICE_LISTS = new Set<string>(Object.keys(PRICE_LIST_IDS))

export function isValidCatalogPriceList(value: unknown): value is CatalogPriceList {
  return typeof value === "string" && VALID_PRICE_LISTS.has(value.trim().toLowerCase())
}

/** Melinka → 16; cualquier otra ciudad o sin ciudad → 13 (Ruta/Web). */
export function resolvePriceListForClient(
  session: Pick<ClientSession, "is_melinka">
): CatalogPriceList {
  return session.is_melinka === true ? "melinka" : "factura"
}

/**
 * Ajusta `price_list` de la sesión a la lista que corresponde por ciudad.
 * Ignora cualquier selección guardada (p. ej. "comoditi" de sesiones antiguas).
 */
export function normalizeSessionPriceList(session: ClientSession): {
  session: ClientSession
  changed: boolean
  previous: string | undefined
} {
  const expected = resolvePriceListForClient(session)
  const previous = session.price_list?.trim().toLowerCase() || undefined
  if (previous === expected) {
    return { session, changed: false, previous }
  }
  return {
    session: { ...session, price_list: expected },
    changed: true,
    previous,
  }
}

export function hasValidCatalogPrice(price: number | null | undefined): boolean {
  return typeof price === "number" && Number.isFinite(price) && price > 0
}
