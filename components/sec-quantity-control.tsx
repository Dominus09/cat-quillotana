"use client"

import { useState, useEffect, type ChangeEvent } from "react"
import { Input } from "@/components/ui/input"
import { Minus, Plus } from "lucide-react"
import type { Product } from "@/types/catalog"
import {
  clampValidQuantity,
  decrementQuantityValue,
  getMaxValidQuantity,
  getMinQuantity,
  getQuantityStep,
  incrementQuantityValue,
  snapQuantityUp,
  withCommercialDefaults,
} from "@/lib/sale-quantity"

type QuantityValue = number | ""

function toNumericQty(q: QuantityValue): number {
  if (q === "") return NaN
  return typeof q === "number" ? q : NaN
}

export interface SecQuantityControlProps {
  product: Product
  quantity: QuantityValue
  onQuantityChange: (quantity: number) => void
  disabled?: boolean
  /** Muestra aviso cuando se corrige cantidad manual inválida */
  showAdjustHint?: boolean
  inputClassName?: string
  containerClassName?: string
}

export function SecQuantityControl({
  product,
  quantity,
  onQuantityChange,
  disabled = false,
  showAdjustHint = false,
  inputClassName,
  containerClassName,
}: SecQuantityControlProps) {
  const [adjustHint, setAdjustHint] = useState("")
  const commercial = withCommercialDefaults(product)
  const step = getQuantityStep(commercial)
  const min = getMinQuantity(commercial)
  const max = getMaxValidQuantity(commercial)
  const numericForButtons = toNumericQty(quantity)

  useEffect(() => {
    setAdjustHint("")
  }, [product.id])

  const applyQuantity = (next: number, opts?: { showAdjust?: boolean }) => {
    const clamped = clampValidQuantity(next, commercial)
    if (opts?.showAdjust && next !== clamped) {
      setAdjustHint("Cantidad ajustada al múltiplo permitido")
    } else {
      setAdjustHint("")
    }
    onQuantityChange(clamped)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val === "") return
    const n = Number(val)
    if (!Number.isFinite(n) || n <= 0) return
    setAdjustHint("")
    onQuantityChange(n)
  }

  const handleBlur = () => {
    const q = toNumericQty(quantity)
    if (quantity === "" || !Number.isFinite(q)) {
      applyQuantity(min)
      return
    }
    const snapped = snapQuantityUp(q, step, min, max || min)
    if (snapped !== q) {
      setAdjustHint("Cantidad ajustada al múltiplo permitido")
    }
    onQuantityChange(snapped)
  }

  const increment = () => {
    if (disabled || max <= 0) return
    const base = quantity === "" || !Number.isFinite(numericForButtons) ? min : numericForButtons
    applyQuantity(incrementQuantityValue(base, commercial))
  }

  const decrement = () => {
    if (disabled) return
    const base = quantity === "" || !Number.isFinite(numericForButtons) ? min : numericForButtons
    applyQuantity(decrementQuantityValue(base, commercial))
  }

  const atMin =
    !Number.isFinite(numericForButtons) || numericForButtons <= min
  const atMax =
    max > 0 && Number.isFinite(numericForButtons) && numericForButtons >= max

  return (
    <div className="min-w-0">
      <div
        className={
          containerClassName ??
          "flex items-stretch border border-border rounded-md bg-background min-w-0 flex-1 max-w-[220px] sm:max-w-[240px] overflow-hidden"
        }
      >
        <button
          type="button"
          onClick={decrement}
          disabled={disabled || atMin}
          className="flex items-center justify-center p-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          aria-label="Disminuir cantidad"
        >
          <Minus className="w-3 h-3" />
        </button>

        <div className="flex flex-1 min-w-0 min-h-10 items-center justify-center self-stretch">
          <Input
            type="number"
            min={min}
            max={max > 0 ? max : undefined}
            disabled={disabled}
            value={quantity === "" ? min : quantity}
            onChange={handleChange}
            onBlur={handleBlur}
            className={
              inputClassName ??
              "h-10 w-full min-w-[60px] sm:min-w-[70px] max-w-[5.5rem] border-0 text-center text-sm font-semibold tabular-nums px-2 shadow-none focus-visible:ring-0 rounded-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            }
            aria-label="Cantidad"
          />
        </div>

        <button
          type="button"
          onClick={increment}
          disabled={disabled || atMax || max <= 0}
          className="flex items-center justify-center p-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          aria-label="Aumentar cantidad"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {showAdjustHint && adjustHint ? (
        <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-1">{adjustHint}</p>
      ) : null}
    </div>
  )
}

export function initialQuantityForProduct(product: Product): number {
  return getMinQuantity(withCommercialDefaults(product))
}
