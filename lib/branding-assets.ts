/**
 * Evita caché vieja en CDN/navegador al cambiar PNG en /public.
 * En Vercel, `NEXT_PUBLIC_ASSET_VERSION` se define en build (ver next.config.mjs).
 * Si hace falta forzar ya: en el panel de Vercel → Settings → Environment Variables
 * añade `NEXT_PUBLIC_ASSET_VERSION` con un valor nuevo (ej. fecha) y redeploy.
 */
function publicAsset(path: string): string {
  const tag = process.env.NEXT_PUBLIC_ASSET_VERSION?.trim()
  if (!tag) return path
  const p = path.startsWith("/") ? path : `/${path}`
  const sep = p.includes("?") ? "&" : "?"
  return `${p}${sep}v=${encodeURIComponent(tag)}`
}

export const LOGO_MAIN_SRC = publicAsset("/logo-main.png")
export const LOGO_SEAL_SRC = publicAsset("/logo-seal.png")
