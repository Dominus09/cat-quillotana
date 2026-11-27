/** Local assets verified at build. Never probe thousands of nonexistent URLs. */
type PhotoManifest = Readonly<Record<string, string>>
const SAFE_BARCODE = /^[A-Za-z0-9_-]{1,80}$/
const SAFE_HASH = /^[a-f0-9]{16}$/
const PLACEHOLDER = /^(?:icon\.svg|logo-seal\.png|placeholder(?:2)?\.(?:png|webp)|(?:sin[-_]?foto|no[-_]?image|no[-_]?foto|default|generico|imagen[-_]?default|sin[-_]?imagen)\.(?:png|jpg|jpeg|webp|svg))$/i

export function localCatalogPhoto(barcode: string | null | undefined, rawImage: string | null | undefined, manifest: PhotoManifest): string | null {
  const code = barcode?.trim() || ""
  if (!SAFE_BARCODE.test(code) || !Object.prototype.hasOwnProperty.call(manifest, code)) return null
  const version = manifest[code]
  if (!SAFE_HASH.test(version)) return null
  const expectedPath = "/products/" + code + ".webp"
  const raw = rawImage?.trim() || ""
  if (raw) {
    try {
      const url = new URL(raw, "https://cat.quillotana.cl/")
      const sameAsset = url.origin === "https://cat.quillotana.cl" && url.pathname === expectedPath
      const placeholder = PLACEHOLDER.test(url.pathname.split("/").pop() || "")
      if (!sameAsset && !placeholder) return null
    } catch {
      return null
    }
  }
  return expectedPath + "?v=" + version
}

export function uniqueCatalogBarcodes(items: ReadonlyArray<{ id: number; barcode: string | null }>): Set<string> {
  const seen = new Map<string, Set<number>>()
  for (const item of items) {
    const code = item.barcode?.trim()
    if (!code || !SAFE_BARCODE.test(code)) continue
    const ids = seen.get(code) || new Set<number>()
    ids.add(item.id)
    seen.set(code, ids)
  }
  return new Set([...seen.entries()].filter(([, ids]) => ids.size === 1).map(([code]) => code))
}

let parsedManifest: PhotoManifest | undefined

export function readLocalCatalogPhotoManifest(): PhotoManifest {
  if (process.env.NEXT_PUBLIC_CATALOG_LOCAL_PHOTOS_ENABLED !== "1") return {}
  if (parsedManifest) return parsedManifest
  try {
    const data: unknown = JSON.parse(process.env.NEXT_PUBLIC_CATALOG_PHOTO_MANIFEST || "{}")
    if (!data || typeof data !== "object" || Array.isArray(data)) return {}
    parsedManifest = data as PhotoManifest
    return parsedManifest
  } catch {
    return {}
  }
}
