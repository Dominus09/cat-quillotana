/** RUT que ve la exportación “Lista sin foto” en el catálogo. */
export const RUT_MISSING_PHOTO_EXPORT_TOOL = "19874231-7"

export function rutEqualsNormalized(a: string | undefined, b: string): boolean {
  const norm = (s: string) =>
    s
      .trim()
      .replace(/\./g, "")
      .replace(/\s+/g, "")
      .toLowerCase()
  return norm(a ?? "") === norm(b)
}
