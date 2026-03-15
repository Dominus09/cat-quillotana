import type { Product } from "@/types/catalog"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.quillotana.cl"

export async function getCatalog(): Promise<Product[]> {
  const res = await fetch(`${API_URL}/api/catalog`, {
    next: { revalidate: 60 }
  })

  if (!res.ok) {
    throw new Error("Error loading catalog")
  }

  return res.json()
}
