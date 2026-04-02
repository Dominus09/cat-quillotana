import useSWR from "swr"
import type { Product } from "@/types/catalog"
import { getCatalog } from "@/services/api"
import { getSession } from "@/lib/session"

type CatalogKey = readonly ["catalog", string, boolean]

async function catalogFetcher([, price_list, inStockOnly]: CatalogKey): Promise<
  Product[]
> {
  return getCatalog(price_list, inStockOnly ? true : undefined)
}

export function useCatalog(inStockOnly: boolean) {
  const session = typeof window !== "undefined" ? getSession() : null
  const key: CatalogKey | null = session
    ? (["catalog", session.price_list, inStockOnly] as const)
    : null

  const { data, error, isLoading, mutate } = useSWR<Product[]>(
    key,
    catalogFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )

  return {
    products: data || [],
    isLoading: key !== null ? isLoading : false,
    error,
    refresh: mutate,
  }
}
