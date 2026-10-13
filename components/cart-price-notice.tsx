"use client"

import { X } from "lucide-react"
import type { CartPriceNoticeData } from "@/hooks/use-cart-price-sync"

interface CartPriceNoticeProps {
  notice: CartPriceNoticeData
  onDismiss: () => void
  title?: string
  footer?: string
}

function formatClp(value: number): string {
  return `$${value.toLocaleString("es-CL")}`
}

export function CartPriceNotice({
  notice,
  onDismiss,
  title = "Actualizamos los precios de tu carrito a tu lista vigente.",
  footer,
}: CartPriceNoticeProps) {
  return (
    <div
      className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 shadow-sm dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-100"
      role="status"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold">{title}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-sm p-0.5 opacity-70 hover:opacity-100"
          aria-label="Cerrar aviso"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {notice.changed.length > 0 ? (
        <ul className="mt-2 space-y-0.5 text-[13px]">
          {notice.changed.map((c) => (
            <li key={c.name}>
              {c.name}: {formatClp(c.oldPrice)} → {formatClp(c.newPrice)}
            </li>
          ))}
        </ul>
      ) : null}

      {notice.removed.length > 0 ? (
        <div className="mt-2 text-[13px]">
          <p>Se quitaron por no tener precio disponible:</p>
          <ul className="list-disc pl-5">
            {notice.removed.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {footer ? <p className="mt-2 text-[13px] font-medium">{footer}</p> : null}
    </div>
  )
}
