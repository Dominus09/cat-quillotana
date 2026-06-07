import {
  formatDocumentTypeLabel,
  formatPaymentMethodLabel,
  formatPriceListLabel,
} from "@/lib/order-success"

export interface OrderCommercialSummaryProps {
  clientName?: string
  city?: string
  priceList?: string
  documentType?: string
  paymentMethod?: string
  vendedor?: string
  /** checkout: resumen antes de confirmar; success: datos del pedido generado */
  variant?: "checkout" | "success"
  title?: string
  className?: string
}

function SummaryRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-foreground text-left sm:text-right break-words">
        {value}
      </span>
    </div>
  )
}

export function OrderCommercialSummary({
  clientName,
  city,
  priceList,
  documentType,
  paymentMethod,
  vendedor,
  variant = "checkout",
  title,
  className = "",
}: OrderCommercialSummaryProps) {
  const showVendedor = Boolean(vendedor?.trim())
  const showCity = Boolean(city?.trim())
  const showClient = Boolean(clientName?.trim())

  if (variant === "success") {
    if (!showClient && !showCity && !showVendedor) return null
  }

  const heading =
    title ?? (variant === "checkout" ? "Resumen comercial" : "Datos del pedido")

  return (
    <div
      className={`rounded-xl border border-border bg-card p-4 space-y-3 text-sm ${className}`}
    >
      <h2 className="font-semibold text-foreground text-base">{heading}</h2>
      <div className="space-y-2.5">
        {showClient ? (
          <SummaryRow label="Cliente:" value={clientName!.trim()} />
        ) : variant === "checkout" ? (
          <SummaryRow label="Cliente:" value="—" />
        ) : null}

        {variant === "checkout" || showCity ? (
          <SummaryRow
            label="Ciudad:"
            value={showCity ? city!.trim() : "—"}
          />
        ) : null}

        {variant === "checkout" ? (
          <>
            <SummaryRow
              label="Lista de precios:"
              value={formatPriceListLabel(priceList)}
            />
            <SummaryRow
              label="Tipo documento:"
              value={formatDocumentTypeLabel(documentType)}
            />
            <SummaryRow
              label="Forma de pago:"
              value={formatPaymentMethodLabel(paymentMethod)}
            />
          </>
        ) : null}

        {variant === "success" && showVendedor ? (
          <SummaryRow label="Vendedor asignado:" value={vendedor!.trim()} />
        ) : null}
      </div>
    </div>
  )
}
