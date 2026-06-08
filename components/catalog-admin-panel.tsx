"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  getCatalogHealthDetail,
  getCatalogHealthSummary,
  type CatalogHealthDetailItem,
  type CatalogHealthSummary,
} from "@/services/api"
import { cn } from "@/lib/utils"

const STATUS_STYLES: Record<string, string> = {
  completo: "bg-green-500/15 text-green-800 dark:text-green-200 border-green-500/40",
  incompleto: "bg-yellow-500/15 text-yellow-800 dark:text-yellow-200 border-yellow-500/40",
  advertencia: "bg-orange-500/15 text-orange-800 dark:text-orange-200 border-orange-500/40",
  critico: "bg-red-500/15 text-red-800 dark:text-red-200 border-red-500/40",
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value.toLocaleString("es-CL")}</span>
    </div>
  )
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const cls = STATUS_STYLES[status] ?? STATUS_STYLES.incompleto
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", cls)}>
      {label}
    </Badge>
  )
}

interface CatalogAdminPanelProps {
  rut: string
}

export function CatalogAdminPanel({ rut }: CatalogAdminPanelProps) {
  const [summary, setSummary] = useState<CatalogHealthSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [detailItems, setDetailItems] = useState<CatalogHealthDetailItem[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await getCatalogHealthSummary(rut)
        if (!cancelled) setSummary(data)
      } catch {
        if (!cancelled) setError("No se pudo cargar el estado del catálogo")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [rut])

  const openDetail = useCallback(async () => {
    setDetailOpen(true)
    setDetailLoading(true)
    setDetailError(null)
    try {
      const data = await getCatalogHealthDetail(rut, { limit: 500, offset: 0 })
      setDetailItems(data.items)
    } catch {
      setDetailError("No se pudo cargar el detalle")
      setDetailItems([])
    } finally {
      setDetailLoading(false)
    }
  }, [rut])

  if (loading) {
    return (
      <Card className="mb-6 border-dashed">
        <CardContent className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando estado del catálogo…
        </CardContent>
      </Card>
    )
  }

  if (error || !summary) {
    return (
      <Card className="mb-6 border-destructive/40">
        <CardContent className="py-6 text-sm text-destructive text-center">
          {error ?? "Error desconocido"}
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="mb-6 border-primary/30 bg-primary/[0.03]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            {summary.title || "Estado del catálogo"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <SummaryRow label="Total productos" value={summary.total} />
          <SummaryRow label="Productos sin fotografía" value={summary.sin_fotografia} />
          <SummaryRow label="Productos sin SEC" value={summary.sin_sec} />
          <SummaryRow label="Productos sin tipo venta" value={summary.sin_tipo_venta} />
          <SummaryRow
            label="Productos con SEC pero sin quantity_step"
            value={summary.sec_sin_quantity_step}
          />
          <SummaryRow
            label="UNITARIO por falta de SEC"
            value={summary.unitario_por_falta_sec}
          />
          <Button type="button" variant="outline" size="sm" onClick={openDetail}>
            Ver detalle
          </Button>
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-[min(100vw-2rem,56rem)] max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Detalle del catálogo</DialogTitle>
            <DialogDescription>
              Calidad de configuración comercial y fotografía por producto
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Cargando detalle…
            </div>
          ) : detailError ? (
            <p className="text-sm text-destructive text-center py-8">{detailError}</p>
          ) : (
            <div className="overflow-auto flex-1 min-h-0 -mx-1 px-1">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 pr-3 font-medium text-muted-foreground">Código barras</th>
                    <th className="pb-2 pr-3 font-medium text-muted-foreground">Producto</th>
                    <th className="pb-2 pr-3 font-medium text-muted-foreground">Foto</th>
                    <th className="pb-2 pr-3 font-medium text-muted-foreground">SEC</th>
                    <th className="pb-2 pr-3 font-medium text-muted-foreground">Tipo venta</th>
                    <th className="pb-2 pr-3 font-medium text-muted-foreground">Quantity Step</th>
                    <th className="pb-2 font-medium text-muted-foreground">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {detailItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        Sin registros
                      </td>
                    </tr>
                  ) : (
                    detailItems.map((row) => (
                      <tr
                        key={row.variant_id}
                        className="border-b border-border/70 last:border-0"
                      >
                        <td className="py-2 pr-3 font-mono text-xs">{row.barcode ?? "—"}</td>
                        <td className="py-2 pr-3 max-w-[200px] truncate" title={row.product_name}>
                          {row.product_name}
                        </td>
                        <td className="py-2 pr-3">{row.has_photo ? "Sí" : "No"}</td>
                        <td className="py-2 pr-3 tabular-nums">{row.sec ?? "—"}</td>
                        <td className="py-2 pr-3">{row.sale_type}</td>
                        <td className="py-2 pr-3 tabular-nums">{row.quantity_step}</td>
                        <td className="py-2">
                          <StatusBadge status={row.status} label={row.status_label} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
