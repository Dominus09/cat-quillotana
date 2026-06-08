import type { CartItem, Product, SaleType } from "@/types/catalog"

const VALID_SALE_TYPES = new Set<SaleType>(["ENTERA", "PARCIAL", "UNITARIO"])

export function parseSaleType(raw: unknown): SaleType {
  const key = String(raw ?? "")
    .trim()
    .toUpperCase()
  if (VALID_SALE_TYPES.has(key as SaleType)) return key as SaleType
  return "UNITARIO"
}

function parseOptionalPositiveInt(raw: unknown): number | null {
  if (raw == null || raw === "") return null
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return null
  return Math.floor(n)
}

/** Aplica defaults comerciales (p. ej. ítems de carrito legacy). */
export function withCommercialDefaults(product: Product): Product {
  const units_per_box = parseOptionalPositiveInt(product.units_per_box)
  const sale_type = product.sale_type ? parseSaleType(product.sale_type) : "UNITARIO"
  let quantity_step = parseOptionalPositiveInt(product.quantity_step) ?? 1
  if (sale_type === "UNITARIO") quantity_step = 1

  return {
    ...product,
    units_per_box,
    sale_type,
    quantity_step,
  }
}

export function getQuantityStep(product: Product): number {
  const p = withCommercialDefaults(product)
  return Math.max(1, p.quantity_step ?? 1)
}

export function getMinQuantity(product: Product): number {
  return getQuantityStep(product)
}

export function getMaxValidQuantity(product: Product): number {
  const step = getQuantityStep(product)
  const stock = Math.max(0, product.stock)
  if (stock < step) return 0
  return Math.floor(stock / step) * step
}

export function canAddProductToCart(product: Product): boolean {
  const step = getQuantityStep(product)
  return product.stock >= step && getMaxValidQuantity(product) >= step
}

export function isValidQuantity(quantity: number, step: number): boolean {
  if (!Number.isFinite(quantity) || quantity < 1) return false
  const s = Math.max(1, step)
  return quantity % s === 0
}

/** Ajusta al múltiplo válido hacia arriba, respetando mínimo y máximo. */
export function snapQuantityUp(
  quantity: number,
  step: number,
  min: number,
  max: number
): number {
  const s = Math.max(1, step)
  const lo = Math.max(s, min)
  if (max > 0 && max < lo) return lo
  if (!Number.isFinite(quantity) || quantity <= 0) return lo
  let snapped = Math.ceil(quantity / s) * s
  if (snapped < lo) snapped = lo
  if (max > 0) snapped = Math.min(snapped, max)
  return snapped
}

export function clampValidQuantity(
  quantity: number,
  product: Product
): number {
  const step = getQuantityStep(product)
  const min = getMinQuantity(product)
  const max = getMaxValidQuantity(product)
  if (max <= 0) return min
  if (isValidQuantity(quantity, step)) {
    return Math.min(Math.max(quantity, min), max)
  }
  return snapQuantityUp(quantity, step, min, max)
}

export function incrementQuantityValue(
  current: number,
  product: Product
): number {
  const step = getQuantityStep(product)
  const max = getMaxValidQuantity(product)
  const min = getMinQuantity(product)
  const base = Number.isFinite(current) && current > 0 ? current : min
  return Math.min(base + step, max || base + step)
}

export function decrementQuantityValue(
  current: number,
  product: Product
): number {
  const step = getQuantityStep(product)
  const min = getMinQuantity(product)
  const base = Number.isFinite(current) && current > 0 ? current : min
  return Math.max(min, base - step)
}

/** Texto principal de regla comercial bajo el nombre del producto. */
export function getSaleRuleLabel(product: Product): string {
  const p = withCommercialDefaults(product)
  const step = getQuantityStep(p)

  switch (p.sale_type) {
    case "ENTERA":
      return p.units_per_box
        ? `Caja x ${p.units_per_box} unidades`
        : "Caja completa"
    case "PARCIAL":
      return `Mínimo ${step} unidades`
    default:
      return "Venta por unidad"
  }
}

export function getStockInsufficientMessage(product: Product): string {
  return "Stock insuficiente para mínimo de venta"
}

export function validateCartItemQuantity(
  item: CartItem
): { ok: true } | { ok: false; message: string } {
  const product = withCommercialDefaults(item.product)
  const step = getQuantityStep(product)
  if (!isValidQuantity(item.quantity, step)) {
    return {
      ok: false,
      message: `${product.name} se vende en múltiplos de ${step} unidades`,
    }
  }
  if (item.quantity > product.stock) {
    return {
      ok: false,
      message: `${product.name}: cantidad supera el stock disponible`,
    }
  }
  return { ok: true }
}

export function validateCartForCheckout(items: CartItem[]): {
  valid: boolean
  messages: string[]
} {
  const messages: string[] = []
  for (const item of items) {
    const result = validateCartItemQuantity(item)
    if (!result.ok) messages.push(result.message)
  }
  return { valid: messages.length === 0, messages }
}
