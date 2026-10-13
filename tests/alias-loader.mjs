// Resuelve el alias "@/..." de tsconfig para el runner nativo de Node (node --test).
const ROOT = new URL("../", import.meta.url)
const EXTENSIONS = [".ts", "/index.ts"]

export async function resolve(specifier, context, nextResolve) {
  if (!specifier.startsWith("@/")) return nextResolve(specifier, context)
  const base = new URL(specifier.slice(2), ROOT).href
  for (const ext of EXTENSIONS) {
    try {
      return await nextResolve(base + ext, context)
    } catch {
      // probar la siguiente extensión
    }
  }
  return nextResolve(specifier, context)
}
