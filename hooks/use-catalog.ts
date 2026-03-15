import useSWR from "swr"
import type { Product } from "@/types/catalog"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.quillotana.cl"

async function fetchCatalog(): Promise<Product[]> {
  const res = await fetch(`${API_URL}/api/catalog`)
  if (!res.ok) {
    throw new Error("Error loading catalog")
  }
  return res.json()
}

export function useCatalog() {
  const { data, error, isLoading, mutate } = useSWR<Product[]>(
    "catalog",
    fetchCatalog,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )

  return {
    products: data || [],
    isLoading,
    error,
    refresh: mutate,
  }
}
