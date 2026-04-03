/**
 * Estilos de badge por estado de pedido (uso futuro en listados / detalle).
 * No usar en UI aún.
 */
export const ORDER_STATUS_BADGE_CLASS = {
  pendiente: "bg-yellow-100 text-yellow-900 border border-yellow-300",
  generado: "bg-green-100 text-green-900 border border-green-300",
  anulado: "bg-red-100 text-red-900 border border-red-300",
  revisar: "bg-blue-100 text-blue-900 border border-blue-300",
} as const

export type OrderStatusUiKey = keyof typeof ORDER_STATUS_BADGE_CLASS
